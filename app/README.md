# Wavelength app

The real, working version of the Wavelength prototype: a mobile-friendly web app (installable PWA) that students join from a code, QR or link, with no app store.

## What works (milestone 1: live join loop)

- **Facilitator** (`/host`): start a session with a custom code (like `BIO101`) or a generated one.
- **Projector join screen** (`/present/CODE`): huge code, QR, join link and a live joined count. After sorting it switches to groups listed by name, so students without a phone can find their group.
- **Students** (`/` or `/join/CODE`): type the code or scan the QR, enter a name, wait in the lobby, then get the color reveal and see who else is in their group.
- **Groups**: auto-sorted from the headcount (about five per group, up to ten groups). Each group has a color, a name and a symbol so it never relies on color alone. Late joiners go into the smallest group and see a "your group is already together" message. The facilitator can reshuffle, change the group count mid-class, rebalance when sizes drift, and remove someone.
- **Rejoining**: a student who reloads or comes back on the same phone lands in the same group.
- **Spotty Wi-Fi**: phones keep the last known state and show a quiet "Reconnecting" badge instead of an error.

## Running it

```sh
cd app
npm install
npm run dev        # http://localhost:5173
npm test           # grouping logic tests
```

Without a database the app runs in **demo mode**: everything syncs between tabs in one browser. Open `/host` in one tab, the join screen in another, and student tabs alongside.

## Connecting a real database (so phones sync)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql).
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon key from Project Settings → API.

## Deploying for free

Import the repo on [vercel.com](https://vercel.com), set the root directory to `app`, and add the two `VITE_SUPABASE_*` environment variables. `vercel.json` already handles the page routes.

## Not yet

Timeline and games (milestone 2), sign-in, privacy settings and wrap-up (milestone 3). Until milestone 3, anyone with a session code can change that session, which is fine for class testing but not for real student data.
