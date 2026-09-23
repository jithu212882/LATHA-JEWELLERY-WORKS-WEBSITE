-- Supabase Storage Bucket Migration for Latha Jewellery Works
-- Bucket: jewellery-images
-- Public READ access for storefront catalog images

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'jewellery-images',
  'jewellery-images',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

-- Policy for Public Read Access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Public Read Access for Jewellery Images'
  ) THEN
    CREATE POLICY "Public Read Access for Jewellery Images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'jewellery-images');
  END IF;
END $$;
