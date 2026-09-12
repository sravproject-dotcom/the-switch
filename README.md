# The Switch — an AI Engineer transition tracker

A private field notebook for the Salesforce-developer → AI-Engineer switch: a
12-week roadmap (garden-path visual, checkable tasks per week), a daily
60-minute coding-discipline tracker with a streak, a theory checklist, six
system-design practice prompts, a bank of 10 STAR-style interview stories,
and a positioning cheat-sheet (target titles, resume reframes, timeline).

Progress is saved to Supabase when it's configured, and always cached in
the browser too, so the app keeps working even if Supabase is briefly
unreachable.

The built-in AI coach runs through a Cloudflare Pages Function. It receives
the current roadmap, checklist state, and daily logs, then returns a response
plus a small validated action (mark a task, reset all data, or set a new plan
start date). API keys stay server-side and are selected round-robin.

## 1. Run it locally

```bash
npm install
cp .env.example .env.local   # fill in your Supabase values
npm run dev
```

## 2. Set up Supabase (optional but recommended)

1. Create a free project at supabase.com.
2. In the SQL editor, run the contents of `supabase/schema.sql`.
3. In Project Settings → API, copy the Project URL and the `anon` public key
   into `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
4. If you skip this step entirely, the app still works — it just saves
   everything to `localStorage` on whichever device you're using instead of
   syncing across devices.

## 3. Configure the AI coach and reports

Add these as Cloudflare Pages environment variables, not `VITE_` variables:

```text
AI_API_KEY_1=...
AI_API_KEY_2=...
AI_API_KEY_3=...
SENDER_MAIL=...
RECEIVER_MAIL=...
RESEND_API_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
CRON_SECRET=...
```

Any number of `AI_API_KEY_<number>` values is supported. The assistant is
available at `/api/assistant`. The email endpoint uses Resend over HTTPS; raw
Gmail SMTP credentials are not used by Cloudflare Pages Functions. The server
secrets are deliberately never sent to the browser.

The assistant can schedule a daily motivation email at `/api/schedule-email`.
Run `/api/send-daily-email` once per day from an external scheduler such as
cron-job.org, passing `Authorization: Bearer $CRON_SECRET`. The handler loads
the saved schedule and sends it through Resend. Cloudflare Pages does not run
Cron Triggers for Pages Functions; use a Worker deployment if you want the
cron to live inside Cloudflare.

## 4. About the lock

The passphrase screen checks what you type against a SHA-256 hash, not a
plaintext password, so the phrase itself isn't sitting in the shipped code.
The current phrase is **ShashiSwitch**.

Be clear-eyed about what this does and doesn't protect against: this is a
**static site with a client-side gate**. It will stop casual visitors and
search engines, but anyone who opens browser dev tools can read the app's
own JavaScript, and the Supabase `anon` key is, by design, visible in that
same bundle (that's how anon keys work — they're meant to be public,
with row-level security doing the real access control). So treat this as
a "keep it off the beaten path" lock, not a bank-vault lock. If you want
something stronger for genuinely sensitive data, two options, roughly in
order of effort:

- **Cloudflare Access** (free for personal use): put the whole Pages site
  behind Cloudflare's own login wall, enforced by Cloudflare's servers
  before your app ever loads. This is the actually-secure option.
- **Supabase Auth**: replace the shared passphrase with a real login
  (email + password or magic link) and add row-level-security policies
  scoped to `auth.uid()` instead of the current "anon full access" ones.

To change the passphrase, generate a new hash and paste it into
`src/components/PasswordGate.jsx`:

```bash
node -e "crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourNewPhrase')).then(b => console.log(Buffer.from(b).toString('hex')))"
```

(or, in Python: `python3 -c "import hashlib; print(hashlib.sha256(b'yourNewPhrase').hexdigest())"`)

## 5. Deploy to Cloudflare Pages

1. Push this project to a GitHub/GitLab repo.
2. In the Cloudflare dashboard: Workers & Pages → Create → Pages → connect
   your repo.
3. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add environment variables (Settings → Environment variables) for
   **Production** (and Preview, if you want):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Cloudflare rebuilds automatically on every push.

Or from the CLI, once you've built locally:

```bash
npm run build
npx wrangler pages deploy dist --project-name the-switch
```

## 6. Editing the roadmap content

All of the curriculum content — the 12 weeks, theory topics, system-design
prompts, and story titles — lives in `src/data/seed.js` as plain data. Edit
it directly to reword tasks, add weeks, or change the story list; the
progress-tracking UI works off whatever's there.
