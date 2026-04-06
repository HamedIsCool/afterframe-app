
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Owner update profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create afterframes table
CREATE TABLE public.afterframes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  the_event text NOT NULL,
  the_gut_punch text NOT NULL,
  the_pivot text NOT NULL,
  the_retroactive_why text NOT NULL,
  the_one_liner text NOT NULL,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  published_at timestamptz
);

ALTER TABLE public.afterframes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published afterframes" ON public.afterframes FOR SELECT USING (is_published = true OR author_id = auth.uid());
CREATE POLICY "Owner insert afterframes" ON public.afterframes FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "Owner update afterframes" ON public.afterframes FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Owner delete afterframes" ON public.afterframes FOR DELETE USING (author_id = auth.uid());

-- Create saves table
CREATE TABLE public.saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  afterframe_id uuid REFERENCES public.afterframes(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, afterframe_id)
);

ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner read saves" ON public.saves FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Owner insert saves" ON public.saves FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owner delete saves" ON public.saves FOR DELETE USING (user_id = auth.uid());

-- Create likes table
CREATE TABLE public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  afterframe_id uuid REFERENCES public.afterframes(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, afterframe_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Owner insert likes" ON public.likes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owner delete likes" ON public.likes FOR DELETE USING (user_id = auth.uid());

-- Create comments table
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  afterframe_id uuid REFERENCES public.afterframes(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Auth insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Owner delete comments" ON public.comments FOR DELETE USING (auth.uid() = author_id);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('like', 'comment')),
  afterframe_id uuid REFERENCES public.afterframes(id) ON DELETE CASCADE NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipient read notifications" ON public.notifications FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "Recipient update notifications" ON public.notifications FOR UPDATE USING (recipient_id = auth.uid());
CREATE POLICY "Auth insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(split_part(NEW.email, '@', 1), 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
