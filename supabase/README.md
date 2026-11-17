# Supabase setup

For a new project, run `schema.sql` in the Supabase SQL Editor. To repair a project
where the other schema is already installed but `public.profiles` is missing, run
the latest SQL file in `migrations/`.

In Supabase Authentication settings, set the Site URL to your app origin. For
local development, the origin is `http://localhost:3000`.

For numeric email OTPs, edit both the **Confirm signup** and **Magic Link**
email templates to include `{{ .Token }}` (and remove `{{ .ConfirmationURL }}`).
Otherwise Supabase may send a link instead of a code. Add the production Site URL
when deploying.

Sign-up requires a mobile number and email. The mobile number is saved to the
user's profile during onboarding; only the email address is verified by OTP.
