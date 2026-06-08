# Issue: OTP Login — ChunkLoadError on VPS Deployment

**Date:** 2026-06-02
**Status:** Resolved
**Environment:** Ubuntu VPS, Next.js 15, PM2, ngrok tunnel

---

## Symptoms

1. Login page renders correctly (server-side HTML works)
2. Clicking "Send code" causes the page to crash with:
   ```
   Application error: a client-side exception has occurred
   ```
3. Browser console shows:
   ```
   ChunkLoadError: Loading chunk 520 failed.
   (error: https://<ngrok-url>/_next/static/chunks/app/login/page-d21ad9eeacb8e936.js)
   ```
4. The requested chunk returns a **400** status
5. Error persisted in Incognito windows (ruling out browser cache)

---

## Root Cause

**The VPS was running an outdated version of `login/page.tsx`.**

The login page was rewritten from email+password to OTP (passwordless) on the local machine, but those changes were never pushed to the git remote and pulled on the VPS. The VPS had the old code, which compiled to chunk hash `d21ad9eeacb8e936`. The new code (OTP flow) compiles to hash `410110ea807dda48`.

Because the VPS built from old source, the webpack runtime embedded the old chunk hash in its manifest. When the browser loaded the page and tried to hydrate, it requested `page-d21ad9eeacb8e936.js` — which no longer existed on disk (a clean rebuild had replaced it with `page-410110ea807dda48.js`) — resulting in a 400 error and crash.

### Why the error was hard to diagnose

- `rm -rf .next && npm run build` confirmed the **new** chunk (`page-410110ea807dda48.js`) was on disk
- But the built HTML and webpack runtime still referenced the **old** chunk hash — because they were compiled from the old source code
- This looked like a caching or webpack corruption issue, but was actually a source code mismatch

---

## Contributing Factor: Silent Error Swallowing

The original OTP login page had no `try/catch` around the Supabase calls:

```javascript
// Before — button would get stuck if signInWithOtp threw
const { error: err } = await supabase.auth.signInWithOtp({ email, ... })
if (err) { setError(err.message); setLoading(false); return }
setStep('otp')
setLoading(false)
```

If the Supabase client threw (e.g. missing env vars, network error), `setLoading(false)` was never called — leaving the button permanently stuck on "Sending code…" with no visible error.

Additionally, the very first deployment attempt failed because `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` were not present in `.env.local` on the VPS at build time. Since `NEXT_PUBLIC_` vars are baked into the JS bundle during `npm run build`, building without them produces a bundle that throws on first Supabase client initialization.

---

## Resolution

### 1. Push latest code to remote and pull on VPS

```bash
# Local machine
git add celebrate-analytics/src/app/login/page.tsx
git commit -m "Fix OTP login error handling"
git push origin main

# VPS
cd ~/celebrate-analytics/celebrate-analytics
git pull origin main
```

### 2. Wrap Supabase calls in try/catch

```javascript
async function handleEmailSubmit(e: FormEvent) {
  e.preventDefault()
  setError(null)
  setLoading(true)

  try {
    const supabase = createSupabaseBrowserClient()
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    if (err) { setError(err.message); return }
    setStep('otp')
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Failed to send code. Please try again.')
  } finally {
    setLoading(false)  // always runs — button never gets stuck
  }
}
```

### 3. Clean rebuild and restart on VPS

```bash
rm -rf .next
npm run build
pm2 restart celebrate-analytics
```

---

## Checklist for Future Deployments

- [ ] Ensure `.env.local` exists on VPS **before** running `npm run build`
- [ ] Always `git pull` on VPS before rebuilding — source mismatch causes stale chunk hashes
- [ ] `rm -rf .next` before every build on VPS to prevent stale manifests
- [ ] Verify env vars baked into bundle after build: `grep -r "supabase.co" .next/static/ | head -3`
- [ ] After restarting PM2, test in Incognito to avoid browser cache confusion

---

## Key Diagnostic Commands

```bash
# Confirm env vars are baked into the bundle
grep -r "your-project-ref.supabase.co" .next/static/ | head -3

# Confirm which chunk files exist for a given route
ls .next/static/chunks/app/login/

# Check which chunk hash the built HTML references
grep -o 'page-[a-f0-9]*\.js' .next/server/app/login/page.html

# Check PM2 working directory (wrong cwd = wrong .next folder served)
pm2 info celebrate-analytics | grep cwd

# Full clean restart
pm2 delete celebrate-analytics
rm -rf .next
npm run build
pm2 start npm --name "celebrate-analytics" -- start
pm2 save
```

---

## PM2 Notes

- Always run `pm2 start` from inside the Next.js project directory — PM2 inherits the `cwd` from wherever you run the command
- If PM2 was started from a parent directory, it may serve from the wrong `.next` folder
- Restart count `↺ 37+` in `pm2 status` means the process was crashing in a restart loop — check `pm2 logs` immediately
- `pm2 restart` with `--update-env` is needed if env vars changed after the process was first started (though for `NEXT_PUBLIC_` vars, a full rebuild is still required regardless)
