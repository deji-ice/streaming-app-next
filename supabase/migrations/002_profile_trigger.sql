-- 002_profile_trigger.sql
-- Creates a profiles row for every new auth user, idempotently.
--
-- The app does not depend on this migration being applied: the client auth bootstrap
-- (lib/store.ts fetchUser) inserts the row once per sign-in when it is missing.
-- With this trigger in place that client insert never runs, which saves a request
-- on a user's first sign-in.
--
-- Differences from the trigger in 001_initial_schema.sql / supabase-schema.sql:
--   * ON CONFLICT (id) DO NOTHING, so it never fails a sign-up when a row already exists
--   * full_name falls back to the email local part
--   * SET search_path = public (security definer hygiene)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
