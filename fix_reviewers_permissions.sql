-- =========================================================================
-- سكريبت تفعيل صلاحيات المراجعين المعتمدين في منصة نجم لإدارة المعرفة
-- يرجى نسخه ولصقه في محرر SQL في Supabase Dashboard ثم الضغط على Run
-- =========================================================================

-- 1. التأكد من إنشاء جدول profiles إذا لم يكن منشأً
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    is_reviewer BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. إدراج وتفعيل صلاحية المراجعين الأربعة المعتمدين بصورة فورية
INSERT INTO public.profiles (id, email, is_reviewer)
VALUES 
  ('e9d7e424-bb3c-4f6f-b58e-ccc4e42770f7', 'a1390sa@gmail.com', true),
  ('77203853-5dfd-4ac4-bbfe-2eb72cc5b9cc', 'mhamdi@hcharity.org', true),
  ('4ef1805b-68dd-42a2-a19d-60d3e5fd96b7', 'naji@hcharity.org', true),
  ('4efbbd31-ceeb-4d2b-b147-5544ac79933d', 'yazeed@hcharity.org', true)
ON CONFLICT (id) DO UPDATE 
SET is_reviewer = true, email = EXCLUDED.email;

-- 3. تحديث كافة السجلات الحالية في الجدول لتكون معتمدة
UPDATE public.profiles SET is_reviewer = true;

-- 4. إنشاء مشغل آلي (Trigger) بحيث يتم منح أي حساب جديد يضيفه المدير في المستقبل صلاحية المراجع تلقائياً
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_reviewer)
  VALUES (new.id, new.email, true)
  ON CONFLICT (id) DO UPDATE SET is_reviewer = true;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. التأكد من سياسات القراءة والتعديل على جدول profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow reviewer read of own profile') THEN
    CREATE POLICY "Allow reviewer read of own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
  END IF;
END $$;
