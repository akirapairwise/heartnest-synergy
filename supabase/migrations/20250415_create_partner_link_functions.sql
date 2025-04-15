
-- Function to link two users as partners in a single transaction
CREATE OR REPLACE FUNCTION public.link_partners(user_id_1 UUID, user_id_2 UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update user 1 to connect to user 2
  UPDATE user_profiles
  SET partner_id = user_id_2
  WHERE id = user_id_1;

  -- Update user 2 to connect to user 1
  UPDATE user_profiles
  SET partner_id = user_id_2
  WHERE id = user_id_1;
END;
$$;

-- Function to unlink two users as partners in a single transaction
CREATE OR REPLACE FUNCTION public.unlink_partners(user_id_1 UUID, user_id_2 UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Remove the partner connection for user 1
  UPDATE user_profiles
  SET partner_id = NULL
  WHERE id = user_id_1;

  -- Remove the partner connection for user 2
  UPDATE user_profiles
  SET partner_id = NULL
  WHERE id = user_id_2;
END;
$$;
