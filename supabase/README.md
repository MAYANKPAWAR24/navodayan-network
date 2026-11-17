# Supabase setup

For a new project, run `schema.sql` in the Supabase SQL Editor. To repair a project
where the other schema is already installed but `public.profiles` is missing, run
the latest SQL file in `migrations/`.

In Supabase Authentication settings, set the Site URL to your app origin and add
`<app-origin>/auth/callback` to the allowed Redirect URLs. For local development,
the origin is `http://localhost:3000`. Add the production callback URL as well
when deploying.

If a confirmation link expires or has already been used, sign-up now offers a
button to resend the email. Always open the newest confirmation email.
