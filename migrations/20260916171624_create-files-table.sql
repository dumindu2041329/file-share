-- Shared file metadata for FileShare.
-- Owners keep full CRUD on their own rows; public share links read a single row
-- through get_shared_file() instead of a broad anon SELECT policy.

CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL DEFAULT '',
  share_token TEXT NOT NULL UNIQUE,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_files_user_id_created_at
  ON public.files (user_id, created_at DESC);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS files_owner_select ON public.files;
DROP POLICY IF EXISTS files_owner_insert ON public.files;
DROP POLICY IF EXISTS files_owner_update ON public.files;
DROP POLICY IF EXISTS files_owner_delete ON public.files;

CREATE POLICY files_owner_select ON public.files
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY files_owner_insert ON public.files
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY files_owner_update ON public.files
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY files_owner_delete ON public.files
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.files TO authenticated;

DROP TRIGGER IF EXISTS files_updated_at ON public.files;
CREATE TRIGGER files_updated_at
  BEFORE UPDATE ON public.files
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

-- Public share lookup. Runs as the function owner so anonymous visitors holding
-- a share token can resolve exactly one row without table-wide read access.
CREATE OR REPLACE FUNCTION public.get_shared_file(p_token TEXT)
RETURNS TABLE (
  id UUID,
  file_name TEXT,
  storage_url TEXT,
  file_size BIGINT,
  file_type TEXT,
  share_token TEXT,
  download_count INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT
    f.id,
    f.file_name,
    f.storage_url,
    f.file_size,
    f.file_type,
    f.share_token,
    f.download_count,
    f.created_at
  FROM public.files AS f
  WHERE f.share_token = p_token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_shared_file(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_file(TEXT) TO anon, authenticated;

-- Download counter for public share pages.
CREATE OR REPLACE FUNCTION public.increment_downloads(file_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  UPDATE public.files
  SET download_count = download_count + 1
  WHERE id = file_id;
$$;

REVOKE ALL ON FUNCTION public.increment_downloads(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_downloads(UUID) TO anon, authenticated;
