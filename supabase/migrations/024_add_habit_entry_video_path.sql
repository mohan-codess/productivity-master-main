-- Migration to add video_path to habit_entries and setup habit-videos bucket
ALTER TABLE public.habit_entries ADD COLUMN IF NOT EXISTS video_path TEXT DEFAULT NULL;

-- Storage bucket for habit video proofs (private, per-user folder)
INSERT INTO storage.buckets (id, name, public)
VALUES ('habit-videos', 'habit-videos', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Policies to restrict users to their own folders in the habit-videos bucket
DO $$ BEGIN
  CREATE POLICY "habit_videos_select" ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'habit-videos' AND (storage.foldername(name))[1] = auth.uid()::text);
  CREATE POLICY "habit_videos_insert" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'habit-videos' AND (storage.foldername(name))[1] = auth.uid()::text);
  CREATE POLICY "habit_videos_delete" ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'habit-videos' AND (storage.foldername(name))[1] = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
