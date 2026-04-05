-- Migration: Firebase Firestore → Supabase
-- 102 slang entries
-- Run this in Supabase SQL Editor

-- OPTION A: If you've already signed in (admin user exists), just run this as-is.
-- OPTION B: If you haven't signed in yet, this will temporarily drop the FK
--           constraint, insert with a placeholder UUID, and you can update later.

DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Try to find existing admin user
  SELECT id INTO admin_id FROM public.users WHERE role = 'admin' LIMIT 1;

  IF admin_id IS NULL THEN
    -- No admin user yet - temporarily disable FK constraint for migration
    ALTER TABLE public.slangs DROP CONSTRAINT IF EXISTS slangs_author_id_fkey;
    -- Use a placeholder UUID (will be updated after first sign-in)
    admin_id := '00000000-0000-0000-0000-000000000000'::uuid;
    RAISE NOTICE 'No admin user found. Using placeholder ID. After signing in, run: UPDATE public.slangs SET author_id = (SELECT id FROM public.users WHERE role = ''admin'' LIMIT 1) WHERE author_id = ''00000000-0000-0000-0000-000000000000'';';
  END IF;

  -- Insert slangs (skip duplicates by word)

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'အားကြီးနဲ့', 'Ar-gyi-nae', 'Extremely, very much, or "so much" (used for emphasis, often in an exaggerated or cute way).', 'အရမ်း၊ အလွန်အမင်း (အလေးအနက်ပြုပြောဆိုခြင်း)။', ARRAY['သူကတော့ အားကြီးနဲ့ လုပ်နေပြန်ပြီ (There she goes again, being so extra)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-03T04:45:15.431Z', '2026-04-03T04:45:15.431Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('အားကြီးနဲ့'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'မှု', 'Hmu', 'To care or pay attention.', 'ဂရုစိုက်တယ်၊ အရေးတယူလုပ်တယ်။', ARRAY['ငါ့ကို မမှုဘူး (Doesn''t care about me)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-02T15:45:33.525Z', '2026-04-03T03:54:17.498Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('မှု'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'လန်း', NULL, '(Lan) Fresh, cool, or beautiful.', 'ကြည့်ကောင်းတယ်၊ သစ်လွင်တယ်၊ လှပတယ်။', ARRAY['ဒီနေ့ မင်းပုံစံက လန်းနေတယ် (You look fresh today)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 5, '{"2026-04-03":5}'::jsonb, '2026-04-02T15:45:32.604Z', '2026-04-02T16:43:41.825Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('လန်း'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'စောက်တလွဲ', 'Sauk-ta-lwal', 'Total mess, completely wrong, or doing something in a foolishly incorrect way. (Note: "Sauk" is a vulgar intensifier).', 'လုံးဝလွဲမှားနေခြင်း၊ တလွဲတချော်လုပ်ခြင်း။', ARRAY['သူလုပ်လိုက်ရင် အမြဲတမ်း စောက်တလွဲပဲ (Whenever he does something, it''s always a total mess)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 6, '{"2026-04-03":6}'::jsonb, '2026-04-03T04:52:00.057Z', '2026-04-03T04:52:00.057Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('စောက်တလွဲ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဆိုက်', 'Sike', 'Style, vibe, or a person’s unique look/attitude.', 'စတိုင်၊ အထာ၊ ကိုယ်ပိုင်ဟန်ပန်။', ARRAY['သူ့ဆိုက်က တစ်မျိုးလေး လန်းတယ် (His style is cool in its own way)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 6, '{"2026-04-03":6}'::jsonb, '2026-04-03T04:57:22.712Z', '2026-04-03T04:57:22.712Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဆိုက်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'အမွှေစိန်', NULL, '(A Mwe Sein) A playful troublemaker.', 'အမြဲတမ်း ပြဿနာရှာတတ်သူ၊ အဆော့မက်သူ။', ARRAY['သူကတော့ အမွှေစိန်လေးပဲ (She''s a little troublemaker)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 6, '{"2026-04-03":6}'::jsonb, '2026-04-02T15:45:32.632Z', '2026-04-02T16:43:41.571Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('အမွှေစိန်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဂျင်းထည့်', 'Gin-htae', 'To scam someone, to pull a fast one, or to deceive someone (literally: "to put ginger in"). It refers to the act of tricking someone into a bad deal or making them believe a lie.', 'လိမ်လည်ခြင်း၊ လှည့်ဖြားခြင်း (သို့) မဟုတ်ကဟုတ်ကများပြော၍ တစ်ပါးသူအား အယုံသွင်းခြင်း။', ARRAY['သူက ငါ့ကို အသေ ဂျင်းထည့် သွားတာ (He really scammed me/He really pulled a fast one on me)','ဂျင်းထည့် မလို့တော့ မကြံနဲ့နော် (Don''t even think about tricking me'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 0, '{}', '2026-04-03T05:20:52.117Z', '2026-04-03T05:20:52.117Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဂျင်းထည့်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'တောသား', 'Taw-thar', 'Country bumpkin, rustic, or unsophisticated person. (Often used as a slang insult for someone perceived as uncool or outdated).', 'ကျေးလက်နေသူ (သို့) ခေတ်နောက်ကျသူ၊ နားမလည်သူ။', ARRAY['သူက ဝတ်ရတာ တောသားကျလိုက်တာ (His style is so unsophisticated'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 0, '{}', '2026-04-03T04:04:08.891Z', '2026-04-03T04:04:24.873Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('တောသား'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ကျပ်မပြည့်', 'Kyat-ma-pyay', 'Crazy, eccentric, or "having a screw loose" (literally: not a full Kyat).', 'ပေါကြောင်ကြောင်နိုင်သူ၊ စိတ်မနှံ့သူ။', ARRAY['သူက တစ်ခါတလေ ကျပ်မပြည့်သလိုပဲ (Sometimes he acts like he has a screw loose)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 1, 0, 0, '{}', '2026-04-03T04:21:03.172Z', '2026-04-03T12:40:34.028Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ကျပ်မပြည့်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဖွ', 'Phwa', 'To stir up trouble, to spread rumors, or to create a mess/chaos.', 'ပြဿနာဖြစ်အောင်လုပ်ခြင်း (သို့) ကောလာဟလဖြန့်ခြင်း။', ARRAY['သူကတော့ လာဖွပြန်ပြီ (He’s here to stir up trouble again)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-03T04:11:21.279Z', '2026-04-03T04:11:21.279Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဖွ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဆွေ', NULL, '(Swe) To be very close friends (from Swe Myo).', 'ဆွေမျိုးလို ရင်းနှီးတဲ့ သူငယ်ချင်း။', ARRAY['ငါတို့က ဆွေတွေလေ (We are like family)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 0, '{}', '2026-04-02T15:44:17.927Z', '2026-04-02T16:43:42.553Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဆွေ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဂျင်း', 'Gin', 'A scam, a rip-off, or being sold something that doesn''t match the advertisement. It literally means "Ginger," but in slang, it refers to being deceived or "tricked into buying/believing something fake."', 'လိမ်လည်လှည့်ဖြားခြင်း၊ အပေါစားပစ္စည်းကို အကောင်းဟု ပြောရောင်းခြင်း (သို့) မဟုတ်မမှန်တာကို အဟုတ်မှတ်အောင် ပြောခြင်း။', ARRAY['အွန်လိုင်းက မှာတာ ဂျင်း ထည့်ခံလိုက်ရတယ် (I got scammed by my online order)','အဲဒါ ဂျင်း ကြီးပါကွာ၊ မယုံနဲ့ (That''s a rip-off/lie, don''t believe it)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 0, '{}', '2026-04-03T05:19:44.256Z', '2026-04-03T05:19:44.256Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဂျင်း'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'အီး', NULL, '(Ee) Bullshit or lie.', NULL, ARRAY['အီးတွေ လာမတိုက်နဲ့ (Don''t give me bullshit)'], admin_id, 'Sai Wai Hlyan Tun', 'rejected', 0, 0, 0, '{}', '2026-04-02T15:34:29.919Z', '2026-04-02T16:03:53.345Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('အီး'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'လေပါတယ်', 'Lay-par-tal', 'Feeling fed up, weary, frustrated, or mentally exhausted (usually by a person''s behavior or a recurring situation).', 'စိတ်ပျက်ခြင်း၊ စိတ်ကုန်ခြင်း (သို့) တစ်စုံတစ်ခုကြောင့် စိတ်မောရခြင်း။', ARRAY['မင်းနဲ့တော့ တကယ် စိတ်လေပါတယ် (I''m honestly so fed up with you)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 6, '{"2026-04-05":2,"2026-04-03":4}'::jsonb, '2026-04-03T05:10:34.381Z', '2026-04-03T05:10:34.381Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('လေပါတယ်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဂျီကျ', NULL, '(G Kya) To throw a tantrum or act stubborn.', 'ကလေးလို ဂျစ်ကန်ကန်လုပ်တယ်၊ ပူဆာတယ်။', ARRAY['ကလေးလို ဂျီမကျနဲ့ (Don''t throw a tantrum like a kid)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 0, '{}', '2026-04-02T15:45:32.966Z', '2026-04-02T16:43:32.865Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဂျီကျ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ကွဲ', 'Kwe', 'To break up or fail.', 'လမ်းခွဲတယ်၊ အဆင်မပြေဖြစ်တယ်။', ARRAY['သူတို့ ကွဲသွားပြီ (They broke up)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-02T15:45:33.277Z', '2026-04-03T03:56:22.299Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ကွဲ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'အယ့်လယ်', 'Ae-lae', 'Whoa!, Wow!, or Ooh-la-la! (An exclamation used to tease someone who is dressed up, acting fancy, or showing off).', 'အထာကျနေသူ သို့မဟုတ် ပြင်ဆင်လာသူကို မြင်သည့်အခါ အံ့ဩတကြီး နောက်ပြောင်ကျီစယ်သော အာမေဍိတ်စကား။', ARRAY['အယ့်လယ်... ဒီနေ့တော့ အလန်းဇယားပဲလား (Whoa... looking sharp today, aren''t we?)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 6, '{"2026-04-03":6}'::jsonb, '2026-04-03T04:47:26.911Z', '2026-04-03T04:47:26.911Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('အယ့်လယ်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ရေလည်', 'Yay-Lal', 'Extremely, very, or "to the max."', 'အရမ်း၊ အလွန်အမင်း (တစ်ခုခုကို အားဖြည့်ပြောဆိုရာတွင် သုံးသည်)။', ARRAY['ဒီနေ့ ရေလည် ပူတာပဲ (It’s extremely hot today)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 32, '{"2026-04-03":32}'::jsonb, '2026-04-03T01:36:05.586Z', '2026-04-03T02:38:07.118Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ရေလည်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ထိရှ', 'Hti-sha', 'Triggered, Touching, heartbreaking, or emotionally deep (literally: to be cut or grazed emotionally).', 'ရင်ထဲထိရောက်စေသော၊ စိတ်လှုပ်ရှားစေသော (သို့) ခံစားချက်ပြင်းထန်စေသော။', ARRAY['အဲဒီဇာတ်လမ်းက တော်တော်ထိရှဖို့ကောင်းတယ် (That story is really heartbreakingly deep)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 4, '{"2026-04-05":2,"2026-04-03":2}'::jsonb, '2026-04-03T05:04:47.134Z', '2026-04-03T05:04:47.134Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ထိရှ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ညှိ', 'Hnyi', 'To negotiate or hook up.', 'အဆင်ပြေအောင် ညှိနှိုင်းတယ်၊ ချိတ်ဆက်တယ်။', ARRAY['ညှိကြည့်လိုက်မယ် (I''ll try to negotiate/hook up)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 0, '{}', '2026-04-02T15:45:33.314Z', '2026-04-03T03:55:42.547Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ညှိ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ထော', 'Htaw', 'To become rich or get a big profit.', 'ချမ်းသာသွားတယ်၊ အမြတ်အစွန်းများတယ်။', ARRAY['ထောပြီလေ (Got rich!)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 1, '{"2026-04-03":1}'::jsonb, '2026-04-02T15:44:17.555Z', '2026-04-03T04:23:04.914Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ထော'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ရုပ်ဖြောင့်', 'Yoke-phyat', 'Handsome, good-looking, or well-featured (usually referring to a male).', 'ရုပ်ရည်ချောမောပြေပြစ်သော၊ ကြည့်ကောင်းသော။', ARRAY['သူက ရုပ်လည်းဖြောင့်သလို သဘောလည်းကောင်းတယ် (He is both handsome and kind-hearted)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 8, '{"2026-04-03":8}'::jsonb, '2026-04-03T04:51:00.059Z', '2026-04-03T04:51:00.059Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ရုပ်ဖြောင့်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'အိုဗာတင်း', 'Over-Tin', 'Derived from "Overacting." It refers to someone who is being dramatic, extra, or showing off excessively.', 'Overacting ကို အသံလှယ်ထားခြင်းဖြစ်သည်။ ဟန်ဆောင်မှုများသူ၊ ပိုကဲသူ သို့မဟုတ် ကြွားဝါလွန်းသူကို ဆိုလိုသည်။', ARRAY['သူကတော့ အိုဗာတင်းတွေ လုပ်နေပြန်ပြီ (He’s being so extra again / He''s overacting again)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 4, '{"2026-04-05":2,"2026-04-03":2}'::jsonb, '2026-04-03T12:43:11.893Z', '2026-04-03T12:43:11.893Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('အိုဗာတင်း'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ခိုးစား', 'Kho-sar', 'To have a secret affair, to cheat on a partner, or to do something behind someone''s back for personal gain (literally: "to eat stealthily").', 'ဖောက်ပြန်ခြင်း၊ တိတ်တဆိတ် ရည်ငံခြင်း (သို့) ကွယ်ရာတွင် မဟုတ်တာလုပ်ခြင်း။', ARRAY['သူ မိန်းမရှိရက်နဲ့ ခိုးစားနေတာ (He''s having an affair even though he has a wife)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 4, '{"2026-04-03":4}'::jsonb, '2026-04-03T05:16:20.051Z', '2026-04-03T05:16:20.051Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ခိုးစား'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဖွန်ကြောင်', NULL, '(Hpun Kyaung) To flirt or act like a playboy.', 'မိန်းကလေးတွေကို လိုက်ငမ်းတယ်၊ ရည်းစားများချင်တယ်။', ARRAY['ဖွန်မကြောင်နဲ့ (Don''t flirt around)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-02T15:45:32.696Z', '2026-04-02T16:43:40.780Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဖွန်ကြောင်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'စွံ', 'Sun', 'To be popular (especially in dating) or to sell well.', 'ရောင်းပန်းဝယ်ပန်းတည့်တယ်၊ လူကြိုက်များတယ်။', ARRAY['တော်တော်စွံနေတယ် (Very popular in the dating scene)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 0, '{}', '2026-04-02T15:45:33.417Z', '2026-04-03T03:55:05.672Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('စွံ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဝုန်း', 'Wone', 'To do something intensely, quickly, or with high energy (often used for eating, working, or hanging out).', 'အင်တိုက်အားတိုက် လုပ်ဆောင်သည် (သို့) အားရပါးရ စားသောက်သည်။', ARRAY['ဒီညတော့ အဝတ်အစားလှလှဝတ်ပြီး ဝုန်းကြမယ် (Let''s dress up and party hard tonight.)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-03T05:28:57.319Z', '2026-04-03T05:28:57.319Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဝုန်း'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'အောက်တန်းစား', 'Out-tan-sar', 'Low-life, trashy, or a person with no class/morals.', 'ကိုယ်ကျင့်တရားမရှိသူ၊ ယုတ်ညံ့သူ။', ARRAY['အဲဒီလိုလုပ်တာ အောက်တန်းစား အလုပ်ပဲ (Doing that is a total low-life move)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 0, '{}', '2026-04-03T04:16:38.166Z', '2026-04-03T04:16:38.166Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('အောက်တန်းစား'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'အလွင့်', 'A-lwint', 'Extremely high, out of this world, or "lit." It is often used to describe someone who is very high (intoxicated), a piece of music/art that is incredibly trippy, or a vibe that is transcendent.', 'အထွတ်အထိပ်ရောက်ခြင်း၊ လွင့်ပါးသွားလောက်အောင် ကောင်းလွန်းခြင်း (သို့) မူးယစ်ပြီး လွင့်နေခြင်း။', ARRAY['ဒီသီချင်းကတော့ တကယ့် အလွင့်ပဲ (This song is a total vibe/out of this world)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 0, '{}', '2026-04-03T05:11:34.870Z', '2026-04-03T05:11:34.870Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('အလွင့်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ကောက်', 'Kauk', 'To sulk or act petty.', 'စိတ်ကောက်တယ်၊ စိတ်ဆိုးတယ်။', ARRAY['ကောက်သွားပြန်ပြီ (Sulking again)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-02T15:44:17.632Z', '2026-04-03T04:23:33.316Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ကောက်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ခေး', 'Khay', 'Baby, babe, or kiddo. It is a shortened, "cute" version of the word "Kalay" (Child/Baby). It''s commonly used as a pet name for a partner, a younger sibling, or by influencers referring to themselves/their fans.', '"ကလေး" ကို အသံလှလှလေးဖြစ်အောင် ခေါ်ဝေါ်သောစကား။ ချစ်သူအချင်းချင်း သို့မဟုတ် ချစ်စနိုးဖြင့် ခေါ်ဆိုရာတွင် သုံးသည်။', ARRAY['ခေး ဗိုက်ဆာပြီလား (Are you hungry, babe?)','ဒီနေ့ ခေး တို့ ဘယ်သွားကြမလဲ (Where are we going today, guys/babes?)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-03T05:17:52.648Z', '2026-04-03T05:17:52.648Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ခေး'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဗန်းစကား', 'Ban-sa-gar', 'Slang, jargon, or colloquial language.', 'လူအများကြားတွင် အလွတ်သဘော ပြောဆိုသုံးနှုန်းသော စကားလုံးများ။', ARRAY['အခုခေတ် ဗန်းစကားတွေက နားလည်ရခက်တယ် (Modern slang words are hard to understand)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-03T05:01:36.707Z', '2026-04-03T05:01:36.707Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဗန်းစကား'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဖင်ယား', 'Phin-yar', 'Looking for trouble, being restless, or acting out unnecessarily.', 'ပြဿနာရှာချင်နေခြင်း (သို့) မလိုအပ်ဘဲ လှုပ်ရှားနေခြင်း။', ARRAY['မင်း ဖင်မယားနဲ့၊ ငြိမ်ငြိမ်နေ (Don''t look for trouble, stay quiet)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-03T04:09:14.077Z', '2026-04-03T04:09:14.077Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဖင်ယား'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ရွ', 'Ywa', 'To be overly active, restless, or flirtatious.', 'အငြိမ်မနေဘူး၊ သွားလာလှုပ်ရှားချင်နေတယ်။', ARRAY['တော်တော်ရွနေတယ် (Being very restless/flirty)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 22, '{"2026-04-03":22}'::jsonb, '2026-04-02T15:45:33.150Z', '2026-04-03T04:27:50.168Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ရွ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'အရောက်ပို့', 'A-yauk-poh', 'To burn someone with a savage comeback, to deliver a sharp insult, or to "send someone to their place" with words.', 'စကားဖြင့် ထိအောင်ပြောခြင်း (သို့) အရှက်ရအောင် ချေပပြောဆိုခြင်း။', ARRAY['သူ့ကို အောက်က ကွန်မန့်မှာ အရောက်ပို့ထားတယ် (He got roasted in the comments below)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-03T04:40:50.367Z', '2026-04-03T04:40:50.367Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('အရောက်ပို့'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'အဖတ်', 'A Phat', 'Solid part; used with ''A Yay'' to mean substance.', 'အဖတ်တင်တာ၊ အကျိုးရှိတာ။', ARRAY['အရည်မရ အဖတ်မရ (Nonsense)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 1, '{"2026-04-03":1}'::jsonb, '2026-04-02T15:44:17.747Z', '2026-04-03T04:23:46.993Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('အဖတ်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ကြမ်း', NULL, '(Kyan) Hardcore, intense, or savage.', 'အခြေအနေ အရမ်းတင်းမာတယ်၊ အကြမ်းပတမ်းနိုင်တယ်။', ARRAY['ဒီပွဲကတော့ ကြမ်းတယ် (This situation is intense)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 3, '{"2026-04-03":3}'::jsonb, '2026-04-02T15:45:32.758Z', '2026-04-02T16:43:39.632Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ကြမ်း'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'အထာ', NULL, '(A Htar) Swag, style, or knowing how to handle things.', 'စတိုင်ကျတယ်၊ လုပ်တတ်ကိုင်တတ်တယ်။', ARRAY['သူ့အထာနဲ့သူပဲ (He has his own swag)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 7, '{"2026-04-03":7}'::jsonb, '2026-04-02T15:45:32.719Z', '2026-04-02T16:43:40.465Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('အထာ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'နွား', NULL, '(Nwar) Simp; someone who is blindly in love.', 'အချစ်ကန်းနေသူ၊ တစ်ဖက်သတ် အနစ်နာခံလွန်းသူ။', ARRAY['မင်းကတော့ နွားကျနေတာပဲ (You''re acting like a simp)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 6, '{"2026-04-03":4,"2026-04-02":2}'::jsonb, '2026-04-02T15:45:32.656Z', '2026-04-02T16:43:41.326Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('နွား'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ငွေ့', NULL, '(Ngway) To feel awkward or dead inside.', 'အခြေအနေမကောင်းလို့ ငြိမ်ကျသွားတယ်။', ARRAY['ငွေ့သွားတာပဲ (Felt totally awkward)'], admin_id, 'Sai Wai Hlyan Tun', 'rejected', 0, 0, 0, '{}', '2026-04-02T15:45:33.035Z', '2026-04-03T01:41:05.090Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ငွေ့'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'လစ်', 'Lit', 'To leave quickly, escape, or run away.', 'အမြန်ထွက်ပြေးတယ်၊ ရှောင်ထွက်တယ်။', ARRAY['ငါတို့ လစ်ရအောင် (Let''s get out of here)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-02T15:44:17.201Z', '2026-04-03T04:22:03.548Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('လစ်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဆွဲ', NULL, '(Swe) To eat (slang) or to pull.', 'စားတယ် သို့မဟုတ် ဆွဲယူတယ်။', ARRAY['ထမင်းသွားဆွဲမယ် (Going to grab some food)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-02T15:45:33.093Z', '2026-04-02T16:43:31.505Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဆွဲ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဂျို', 'Gyo', 'Horns; acting rebellious or tough.', 'ခေါင်းမာတယ်၊ ပြဿနာရှာချင်တယ်။', ARRAY['ဂျိုမထွက်နဲ့ (Don''t act tough)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 0, '{}', '2026-04-02T15:44:17.688Z', '2026-04-03T04:24:25.753Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဂျို'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဇာတ်', NULL, '(Zat) Drama or acting fake.', 'ဟန်ဆောင်တယ်၊ ဇာတ်လမ်းဆင်တယ်။', ARRAY['ဇာတ်မလမ်းနဲ့ (Don''t create drama)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-02T15:45:32.881Z', '2026-04-02T16:43:37.838Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဇာတ်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဂေါ်လီ', NULL, '(Gawli) Cool kid, playboy, or someone who thinks they are slick.', 'အထာကျတဲ့သူ၊ လူလည်ကျချင်သူ။', ARRAY['ဂေါ်လီလေးတွေ (Cool kids)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 0, '{}', '2026-04-02T15:45:32.948Z', '2026-04-02T16:43:34.105Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဂေါ်လီ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဘဲ', NULL, '(Bae) Guy or Boyfriend.', 'ကောင်လေး သို့မဟုတ် ရည်းစား(ယောကျ်ားလေး)။', ARRAY['ငါ့ဘဲလာပြီ (My boyfriend is here)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 3, '{"2026-04-03":1,"2026-04-02":2}'::jsonb, '2026-04-02T15:45:32.822Z', '2026-04-02T16:43:38.833Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဘဲ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ကွိ', NULL, '(Kwi) Cute or adorable.', 'ချစ်စရာကောင်းတယ်။', ARRAY['ကွိလေး (Cute little one)'], admin_id, 'Sai Wai Hlyan Tun', 'rejected', 0, 0, 0, '{}', '2026-04-02T15:44:17.857Z', '2026-04-03T04:32:16.744Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ကွိ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ကိတ်', NULL, '(Kate) Curvy or thick (usually referring to a woman''s body).', 'ခန္ဓာကိုယ် အချိုးအစားပြည့်စုံတယ် (အထူးသဖြင့် မိန်းကလေး)။', ARRAY['တော်တော်ကိတ်တယ် (Very curvy)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-02T15:45:33.112Z', '2026-04-02T16:43:31.226Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ကိတ်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ခါ', NULL, '(Kha) To ignore, ditch, or reject someone.', NULL, ARRAY['ငါ့ကို ခါသွားတယ် (They ditched me)'], admin_id, 'Sai Wai Hlyan Tun', 'rejected', 0, 0, 0, '{}', '2026-04-02T15:34:29.152Z', '2026-04-02T16:03:45.315Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ခါ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ထီလာသား', 'Htee-lar-thar', 'A native of Meiktila (a city in central Myanmar). In slang, it can sometimes be used to describe someone who is nationalist, sharp, street-smart, or tough, as Meiktila is traditionally known for its military presence and "tough" reputation.', 'မိတ္ထီလာမြို့သား။ မိတ္ထီလာမြို့မှ ဖွားမြင်သူ သို့မဟုတ် နေထိုင်သူ။ ဗန်းစကားအရ အမျိုးသားရေးအားသန်သူ၊ အတိုက်အခိုက် ဝါသနာပါသူ (သို့) လူမိုက်ဆန်ဆန် ဂျေဝါးကျသူများကိုလည်း တင်စားလေ့ရှိသည်။', ARRAY['သူက ထီလာသား ဆိုတော့ အထာတော့ နပ်သားပဲ (Since he''s a Meiktila native, he''s quite street-smart)','သူက ထီလာသား ဆိုတော့ အထာတော့ နပ်သားပဲ (Since he''s a Meiktila native, he''s quite street-smart)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 4, '{"2026-04-03":4}'::jsonb, '2026-04-03T05:24:08.341Z', '2026-04-03T12:39:06.997Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ထီလာသား'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ပလပ်ကျွတ်', 'Pa-lat-kyoot', 'To be "unplugged," out of it, crazy, or functioning incorrectly (often used for someone acting weird or a situation gone wrong).', 'ပေါကြောင်ကြောင်နိုင်ခြင်း၊ စိတ်လွတ်နေခြင်း (သို့) ပုံမှန်မဟုတ်တော့ခြင်း။', ARRAY['သူကတော့ ပလပ်ကျွတ်နေပြီ (He has completely lost it)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 4, '{"2026-04-03":4}'::jsonb, '2026-04-03T05:03:07.121Z', '2026-04-03T05:03:07.121Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ပလပ်ကျွတ်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဖြီး', NULL, '(Hpee) To exaggerate or lie.', 'ပိုပြောတယ်၊ လိမ်ပြောတယ်။', ARRAY['မဖြီးပါနဲ့ (Don''t exaggerate)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-02T15:45:33.018Z', '2026-04-02T16:43:32.667Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဖြီး'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'လော', 'Law', 'To rush or be hasty.', 'အလောတကြီးလုပ်တယ်၊ စိတ်လောတယ်။', ARRAY['အရမ်းမလောနဲ့ (Don''t rush too much)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 3, '{"2026-04-02":2,"2026-04-03":1}'::jsonb, '2026-04-02T15:44:17.909Z', '2026-04-03T04:32:30.734Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('လော'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'လွှင့်', NULL, '(Hlwin) To ignore or let something go.', 'ဂရုမစိုက်ဘဲ ပစ်ထားလိုက်တယ်။', ARRAY['လွှင့်ပစ်လိုက်ပါ (Just let it go)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-02T15:45:33.073Z', '2026-04-02T16:43:31.777Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('လွှင့်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဂေါ်', NULL, '(Gaw) Cool, awesome, or trendy.', 'မိုက်တယ်၊ ခေတ်မီတယ်၊ အထာကျတယ်။', ARRAY['ဒီကောင်လေးက တော်တော်ဂေါ်တာပဲ (This guy is really cool)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 3, '{"2026-04-03":3}'::jsonb, '2026-04-02T15:45:32.581Z', '2026-04-02T16:43:42.233Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဂေါ်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဘော်ဒါ', 'Baw-dar', 'Friend, buddy, or pal.', 'သူငယ်ချင်း၊ အပေါင်းအသင်း။', ARRAY['သူက ငါ့ရဲ့ ဝါရင့်ဘော်ဒါပါ (He is my long-time buddy)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 4, '{"2026-04-03":4}'::jsonb, '2026-04-03T03:59:19.094Z', '2026-04-03T03:59:19.094Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဘော်ဒါ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'အူတက်', 'U-tet', 'Extremely funny or hilarious (literally: "to have one’s intestines twisted" from laughing so hard).', 'အရမ်းရယ်ရခြင်း၊ ရယ်လွန်း၍ ဗိုက်အောင့်ခြင်း။', ARRAY['ဒီဟာသက တော်တော်အူတက်ဖို့ကောင်းတယ် (This joke is absolutely hilarious)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 0, '{}', '2026-04-03T04:48:27.323Z', '2026-04-03T04:48:27.323Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('အူတက်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ရူးသွားမယ်', 'Yue-thwar-mae', 'Insane, crazy good, or "it''ll blow your mind" (can be used for something amazing or something overwhelming).', 'အရမ်းလန်းတယ်၊ အံ့သြဖို့ကောင်းတယ် (သို့) ရူးလောက်အောင် ဖြစ်ရခြင်း။', ARRAY['ဒီဖျော်ဖြေပွဲကတော့ ရူးသွားမယ် (This performance is going to be insane)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 6, '{"2026-04-03":6}'::jsonb, '2026-04-03T04:43:49.910Z', '2026-04-03T04:43:49.910Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ရူးသွားမယ်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဆေးထိုး', 'Say-htoe', 'To prank, to troll, to trick, or to gaslight someone into believing something false (literally: to give an injection).', 'နောက်ပြောင်ကျီစယ်ခြင်း၊ မဟုတ်ကဟုတ်ကများပြော၍ ယုံအောင်လုပ်ခြင်း။', ARRAY['နောက်ပြောင်ကျီစယ်ခြင်း၊ မဟုတ်ကဟုတ်ကများပြော၍ ယုံအောင်လုပ်ခြင်း။'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-03T05:07:18.829Z', '2026-04-03T05:07:18.829Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဆေးထိုး'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'မိုက်', NULL, '(Mike) Awesome, cool, or badass.', 'အရမ်းကောင်းတယ်၊ သဘောကျစရာကောင်းတယ်။', ARRAY['ဒီသီချင်းက တော်တော်မိုက်တယ် (This song is really badass)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 10, '{"2026-04-03":10}'::jsonb, '2026-04-02T15:45:32.925Z', '2026-04-02T16:43:34.927Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('မိုက်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ချော့', 'Chawt', 'To comfort or coax.', 'စိတ်ပြေအောင် ချော့မော့တယ်။', ARRAY['သွားချော့လိုက်ဦး (Go comfort her)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 5, '{"2026-04-03":5}'::jsonb, '2026-04-02T15:44:17.651Z', '2026-04-03T04:24:07.774Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ချော့'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ရှယ်', 'Shal', 'Excellent, top-notch, or premium.', 'အရမ်းကောင်းတယ်၊ အကောင်းစား။', ARRAY['ရှယ်ပဲ (Top-notch!)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 5, '{"2026-04-03":4,"2026-04-02":1}'::jsonb, '2026-04-02T15:45:33.257Z', '2026-04-03T04:21:49.405Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ရှယ်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ပြတ်', 'Pyat', 'To be broke (no money) or to end a relationship.', 'ပိုက်ဆံမရှိတော့ဘူး သို့မဟုတ် အဆက်အသွယ်ဖြတ်တယ်။', ARRAY['ပိုက်ဆံပြတ်နေတယ် (I''m broke)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 3, '{"2026-04-03":3}'::jsonb, '2026-04-02T15:45:33.295Z', '2026-04-03T03:56:04.083Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ပြတ်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ကြောင်', NULL, '(Kyaung) To be confused, spaced out, or act weird.', 'ကြောင်တောင်တောင်ဖြစ်တယ်၊ နားမလည်ဖြစ်သွားတယ်။', ARRAY['ဘာတွေ ကြောင်နေတာလဲ (Why are you spacing out?)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 1, '{"2026-04-03":1}'::jsonb, '2026-04-02T15:45:33.055Z', '2026-04-02T16:43:32.019Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ကြောင်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ကြောင်တောင်တောင်', 'Kyaung Taung Taung', 'Acting weird or suspicious.', 'ပုံမှန်မဟုတ်ဘူး၊ ထူးဆန်းနေတယ်။', ARRAY['ကြောင်တောင်တောင်နဲ့ ဘာလုပ်နေတာလဲ (What are you doing acting so weird?)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 7, '{"2026-04-03":7}'::jsonb, '2026-04-02T15:45:33.777Z', '2026-04-03T02:38:31.109Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ကြောင်တောင်တောင်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ညေး', 'Nyay', 'Little brother or younger male friend (often used affectionately or casually among peers).', 'ညီလေး (သို့) ရင်းနှီးသော မောင်လေးသဖွယ် အငယ်ပိုင်းကို ခေါ်ဝေါ်ခြင်း။', ARRAY['ညေး... ဘာတွေလုပ်နေလဲ (Hey little brother, what are you doing?)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 0, '{}', '2026-04-03T04:10:21.715Z', '2026-04-03T04:10:21.715Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ညေး'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'စောက်ရမ်း', NULL, '(Sauk Yan) Extremely / Very much (intensifier).', 'အရမ်းကို (အလွန်အမင်း)။', ARRAY['စောက်ရမ်းမိုက်တယ် (Extremely awesome)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 8, '{"2026-04-02":2,"2026-04-03":6}'::jsonb, '2026-04-02T15:45:32.803Z', '2026-04-02T16:43:39.097Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('စောက်ရမ်း'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဝီးမန်း', 'Wee-man', 'A transliteration of "Women" used sarcastically or mockingly to point out stereotypical female behavior or "drama."', 'အမျိုးသမီးများကို လှောင်ပြောင်သည့်အနေဖြင့် (သို့) မိန်းကလေးဆန်သော အပြုအမူများကို ခနဲ့ရာတွင် သုံးသောစကား။', ARRAY['ဝီးမန်းတွေကတော့ လုပ်ပြီ (Women... there they go again)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 4, '{"2026-04-03":4}'::jsonb, '2026-04-03T04:18:37.135Z', '2026-04-03T04:18:37.135Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဝီးမန်း'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဟိုဒင်း', 'Ho Din', 'Whatchamacallit / That thing (used when forgetting a word).', 'နာမည်မေ့နေတဲ့အချိန် သုံးတဲ့စကားလုံး။', ARRAY['ဟိုဒင်းလေး ယူပေးပါ (Pass me that thing)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 20, '{"2026-04-03":11,"2026-04-02":9}'::jsonb, '2026-04-02T15:44:17.763Z', '2026-04-03T04:24:44.482Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဟိုဒင်း'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'မွှန်း', 'Hmun', 'To hype someone up or praise excessively.', 'အမွှမ်းတင်တယ်၊ အလွန်အကျွံချီးကျူးတယ်။', ARRAY['အရမ်းမမွှန်းပါနဲ့ (Don''t overhype me)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 11, '{"2026-04-03":7,"2026-04-02":4}'::jsonb, '2026-04-02T15:44:17.839Z', '2026-04-03T04:29:04.273Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('မွှန်း'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'အလွဲ', NULL, '(A Lwe) Blooper, mistake, or awkward moment.', 'လွဲချော်မှု၊ အမှားအယွင်း။', ARRAY['အလွဲတွေချည်းပဲ (Full of bloopers)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 0, '{}', '2026-04-02T15:45:32.905Z', '2026-04-02T16:43:37.237Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('အလွဲ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ကြွေ', 'Kyway', 'To fall deeply in love or be amazed.', 'အရမ်းသဘောကျသွားတယ်၊ အချစ်မိသွားတယ်။', ARRAY['ကြွေသွားပြီ (Fell in love completely)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 4, '{"2026-04-03":4}'::jsonb, '2026-04-02T15:45:33.571Z', '2026-04-03T03:53:42.371Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ကြွေ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'အာဘွား', 'Ar-bwar', 'Kiss (informal/cute), mwah, or a friendly/affectionate peck.', 'နမ်းခြင်း (သို့) ချစ်စနိုးဖြင့် အနမ်းပေးခြင်း။', ARRAY['မေမေ့ကို အာဘွားပေးပါဦး (Give mommy a kiss)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 0, '{}', '2026-04-03T04:33:49.617Z', '2026-04-03T04:33:49.617Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('အာဘွား'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'သောက်', 'Thauk', 'F***ing (Intensifier, slightly vulgar).', 'အရမ်းကို (အနည်းငယ် ရိုင်းစိုင်းသော အသုံးအနှုန်း)။', ARRAY['သောက်ရမ်းမိုက်တယ် (F***ing awesome)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-02":2}'::jsonb, '2026-04-02T15:45:33.650Z', '2026-04-03T03:53:17.394Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('သောက်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'တိုက်', 'Tike', 'To treat (someone to food/drinks).', 'အစားအသောက် ဒကာခံတယ်၊ ကျွေးတယ်။', ARRAY['မင်းတိုက်ရမှာနော် (You have to treat)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 4, '{"2026-04-03":4}'::jsonb, '2026-04-02T15:45:33.195Z', '2026-04-03T04:26:10.199Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('တိုက်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'စွာ', 'Swar', 'Sassy, talkative, or feisty (usually describing someone who is outspoken or talks back boldly)', 'နှုတ်သီးကောင်းလျှာပါးဖြစ်ခြင်း၊ စကားပြန်ပြောရာတွင် ရဲတင်းခြင်း။', ARRAY['အဲဒီကောင်မလေးက တော်တော်စွာတာပဲ (That girl is really sassy)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-03T04:19:48.899Z', '2026-04-03T04:19:48.899Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('စွာ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'တောကြိုက်', 'Taw-kyite', 'Someone with questionable or "trashy" taste; someone who likes things that are considered unrefined or outdated.', 'အဆင့်အတန်းမရှိသည်များကို ကြိုက်နှစ်သက်သူ (သို့) အမြင်မရှိသူ။', ARRAY['သူ့ဖက်ရှင်က တောကြိုက်ကြီး (His fashion sense is so trashy)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-03T04:55:50.849Z', '2026-04-03T04:55:50.849Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('တောကြိုက်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'မာမီ', 'Ma-mee', 'Sugar mommy or a wealthy older woman who supports a younger person; sometimes used to refer to a stylish, attractive older woman.', 'ငွေကြေးချမ်းသာပြီး ပံ့ပိုးပေးနိုင်သည့် အသက်ကြီးပိုင်းအမျိုးသမီး (သို့) အလန်းဇယား အသက်ကြီးပိုင်းအမျိုးသမီး။', ARRAY['သူ့မှာ မာမီရှိတယ် (He has a sugar mommy)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 0, '{}', '2026-04-03T04:07:37.723Z', '2026-04-03T04:07:37.723Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('မာမီ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ပွ', 'Pwa', 'To get lucky or hit the jackpot.', 'ကံကောင်းတယ်၊ အကျိုးအမြတ်ကြီးကြီးရတယ်။', ARRAY['ဒီနေ့တော့ ပွတာပဲ (Hit the jackpot today)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 1, '{"2026-04-03":1}'::jsonb, '2026-04-02T15:45:33.377Z', '2026-04-03T03:54:50.990Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ပွ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'လု', 'Lu', 'To snatch or steal someone''s partner.', 'သူများအရာကို အတင်းယူတယ်၊ လုယူတယ်။', ARRAY['ငါ့ဘဲကို လုသွားတယ် (Stole my boyfriend)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 1, '{"2026-04-03":1}'::jsonb, '2026-04-02T15:44:17.820Z', '2026-04-03T04:27:23.265Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('လု'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ချိတ်', 'Chate', 'To connect, hook up, or match.', 'အချိတ်အဆက်လုပ်တယ်၊ မိတ်ဆက်ပေးတယ်။', ARRAY['ကောင်မလေးနဲ့ ချိတ်ပေးပါ (Hook me up with the girl)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 1, '{"2026-04-03":1}'::jsonb, '2026-04-02T15:45:33.333Z', '2026-04-03T03:55:19.434Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ချိတ်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ပေါကား', 'Paw-kar', 'A low-quality, nonsensical, or cheesy movie.', 'အနှစ်သာရမရှိသော ရုပ်ရှင် (သို့) ပေါကြောင်ကြောင်နိုင်သော ဇာတ်ကား။', ARRAY['အဲဒါ ပေါကားကြီးပါ၊ သွားမကြည့်နဲ့ (That''s a total cheesy movie, don''t go watch it)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 1, 0, 6, '{"2026-04-03":6}'::jsonb, '2026-04-03T04:35:18.871Z', '2026-04-03T06:35:24.570Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ပေါကား'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဘူ', NULL, '(Bu) To be clueless or not understand anything.', NULL, ARRAY['ဘာမှန်းကို မဘူဘူး (I have no clue what''s going on)'], admin_id, 'Sai Wai Hlyan Tun', 'rejected', 0, 0, 0, '{}', '2026-04-02T15:34:30.813Z', '2026-04-02T16:04:04.299Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဘူ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'လိုင်း', 'Line', 'Field of interest or internet connection.', 'စိတ်ဝင်စားတဲ့ နယ်ပယ် သို့မဟုတ် အင်တာနက်လိုင်း။', ARRAY['သူ့လိုင်းမဟုတ်ဘူး (Not his field)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 6, '{"2026-04-05":2,"2026-04-03":4}'::jsonb, '2026-04-02T15:44:17.521Z', '2026-04-03T04:22:22.488Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('လိုင်း'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဆယ်လီ', 'Selly', 'A celebrity or a social media influencer. It is a Burmese slang abbreviation of the English word "Celebrity."', 'နာမည်ကျော်ကြားသူ၊ အနုပညာရှင် (သို့) လူမှုကွန်ရက်ပေါ်တွင် လူသိများသူ။ "Celebrity" ဆိုသော အင်္ဂလိပ်စကားလုံးကို အတိုကောက် ခေါ်ဝေါ်ခြင်းဖြစ်သည်။', ARRAY['သူက အခု Facebook ပေါ်မှာ ဆယ်လီ ပဲ (He is a celebrity on Facebook now)','ဆယ်လီ တွေ ကြော်ငြာပေးတာ ပေါက်တယ် (Products endorsed by influencers usually sell well)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 4, '{"2026-04-03":4}'::jsonb, '2026-04-03T05:22:21.176Z', '2026-04-03T05:22:21.176Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဆယ်လီ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဘလိန်း', 'Blane', 'To blame, to accuse, or to pin the fault on someone (Burmese slang version of the English word "Blame").', 'အပြစ်ပုံချခြင်း၊ စွပ်စွဲခြင်း။', ARRAY['ငါ့ကို လာမဘလိန်းနဲ့ (Don''t come and blame me)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 4, '{"2026-04-03":4}'::jsonb, '2026-04-03T04:59:12.083Z', '2026-04-03T04:59:12.083Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဘလိန်း'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'အရည်', 'A Yay', 'Quality or substance.', 'အရည်အသွေး၊ အနှစ်သာရ။', ARRAY['အရည်မရ အဖတ်မရ (Nonsense / No substance)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 3, '{"2026-04-03":2,"2026-04-02":1}'::jsonb, '2026-04-02T15:44:17.726Z', '2026-04-03T04:25:12.233Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('အရည်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ငမ်း', 'Ngan', 'To stare lustfully, check someone out, or ogle.', 'တစ်ဖက်လူကို ရမ္မက်မျက်စိဖြင့် စိုက်ကြည့်သည်။', ARRAY['သူက မြင်သမျှ မိန်းကလေးတိုင်းကို လိုက်ငမ်းနေတာ (He is checking out every girl he sees)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 12, '{"2026-04-03":12}'::jsonb, '2026-04-03T02:16:31.044Z', '2026-04-03T02:35:58.391Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ငမ်း'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ကျူ', NULL, '(Kyu) To flirt or hit on someone.', 'လိုက်ပိုးပန်းတယ်၊ ရည်းစားစကားပြောတယ်။', ARRAY['သူ့ကို သွားမကျူနဲ့ (Don''t go flirting with her)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 6, '{"2026-04-03":6}'::jsonb, '2026-04-02T15:45:32.861Z', '2026-04-02T16:43:38.253Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ကျူ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ကပ်', 'Kat', '(Kat) To stick around someone for benefits.', 'အကျိုးအမြတ်လိုချင်လို့ အနားကပ်တယ်။', ARRAY['သွားမကပ်နဲ့ (Don''t go leeching off them)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-02T15:45:33.221Z', '2026-04-03T04:25:27.182Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ကပ်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ကြိတ်', 'Kyeik', 'To secretly do something (like secretly dating).', 'တိတ်တဆိတ် လုပ်တယ်၊ လျှို့ဝှက်ထားတယ်။', ARRAY['သူတို့ ကြိတ်တွဲနေတာ (They are secretly dating)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-02T15:45:33.676Z', '2026-04-03T02:38:53.870Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ကြိတ်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဟော့', 'Hot', 'Hot, trending, or sexy.', 'ရေပန်းစားနေတယ်၊ ဆွဲဆောင်မှုရှိတယ်။', ARRAY['ဟော့နေတာပဲ (So trending right now)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 3, '{"2026-04-02":2,"2026-04-03":1}'::jsonb, '2026-04-02T15:45:33.239Z', '2026-04-03T04:22:47.166Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဟော့'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ပလစ်', 'Pa-lit', 'To dump someone.', 'စွန့်ပစ်တယ်၊ လမ်းခွဲတယ်။', ARRAY['သူ့ကို ပလစ်လိုက်ပြီ (Dumped him)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 4, '{"2026-04-03":4}'::jsonb, '2026-04-02T15:45:33.467Z', '2026-04-03T05:08:45.154Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ပလစ်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'မွှေ', 'Mway', 'To cause trouble or mess around.', 'ပြဿနာရှာတယ်၊ အနှောင့်အယှက်ပေးတယ်။', ARRAY['လာမမွှေနဲ့ (Don''t come causing trouble)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 6, '{"2026-04-03":6}'::jsonb, '2026-04-02T15:45:33.129Z', '2026-04-03T04:32:52.972Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('မွှေ'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ပေါ်ပင်', 'Paw-pin', 'Trendy, viral, or a temporary fad.', 'ခေတ်စားနေသောအရာ (သို့) ခဏတာ ရေပန်းစားနေခြင်း။', ARRAY['အခုဒါက ပေါ်ပင်ဖြစ်နေတာ (This is currently trending)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 0, '{}', '2026-04-03T04:38:23.166Z', '2026-04-03T04:38:23.166Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ပေါ်ပင်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'စော်', NULL, '(Saw) Girl or Girlfriend.', 'ကောင်မလေး သို့မဟုတ် ရည်းစား(မိန်းကလေး)။', ARRAY['စော်ရနေပြီလား (Got a girlfriend yet?)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 3, '{"2026-04-02":1,"2026-04-03":2}'::jsonb, '2026-04-02T15:45:32.843Z', '2026-04-02T16:43:38.523Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('စော်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'အထုပ်', 'A Htoke', 'Baggage or secret.', 'လျှို့ဝှက်ချက်၊ ဖုံးကွယ်ထားတဲ့အရာ။', ARRAY['အထုပ်ဖြေမယ် (Spill the tea/secrets)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 4, '{"2026-04-03":1,"2026-04-02":3}'::jsonb, '2026-04-02T15:45:33.441Z', '2026-04-03T03:55:26.962Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('အထုပ်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'အကွက်', 'A-kwet', 'A scheme, a trick, or a calculated move (often used when someone is playing a game or being manipulative).', 'အကြံအစည်၊ လှည့်ကွက် (သို့) ကြိုတင်ပြင်ဆင်ထားသော အပြုအမူ။', ARRAY['ဒါက သူ့အကွက်ပဲ (This is his trick)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 0, '{}', '2026-04-03T04:49:40.197Z', '2026-04-03T04:49:40.197Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('အကွက်'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'လိုသုံး', 'Lo-thone', 'Using someone only when needed; a fair-weather friend or a "rebound."', 'လိုအပ်မှသာ အသုံးချခြင်း (သို့) လိုအပ်မှ သတိရခြင်း။', ARRAY['ငါ့ကို လိုသုံး မလုပ်နဲ့ (Don''t just use me when you need something)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 1, 0, 2, '{"2026-04-03":2}'::jsonb, '2026-04-03T04:26:55.819Z', '2026-04-03T06:37:01.299Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('လိုသုံး'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ပွဲကြမ်း', NULL, '(Pwe Kyan) Major drama or a big fight.', 'ပြဿနာကြီးကြီးမားမားဖြစ်တယ်။', ARRAY['အခုတော့ ပွဲကြမ်းနေပြီ (Major drama is happening now)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 12, '{"2026-04-02":2,"2026-04-03":10}'::jsonb, '2026-04-02T15:45:32.785Z', '2026-04-02T16:43:39.371Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ပွဲကြမ်း'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ဆရာကြီး', 'Sayar Gyi', 'A know-it-all, a show-off, or someone acting like an expert (often used sarcastically).', 'အားလုံးသိသလိုလို၊ တတ်သလိုလို လုပ်နေသူ (သို့) ဆရာလုပ်လိုသူ။', ARRAY['သူကတော့ လုပ်လိုက်ရင် ဆရာကြီးပဲ (He always acts like a know-it-all)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 18, '{"2026-04-03":18}'::jsonb, '2026-04-03T01:53:18.335Z', '2026-04-03T02:37:45.741Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ဆရာကြီး'));

  INSERT INTO public.slangs (word, pronunciation, meaning, meaning_burmese, examples, author_id, author_name, status, upvotes, downvotes, views, view_history, created_at, updated_at)
  SELECT 'ချေ', NULL, '(Chay) To act snobby, arrogant, or hard to get.', 'အထက်စီးကနေဆက်ဆံတယ်၊ မာနကြီးတယ်။', ARRAY['သူက တော်တော်ချေတာ (She plays hard to get)'], admin_id, 'Sai Wai Hlyan Tun', 'approved', 0, 0, 9, '{"2026-04-03":9}'::jsonb, '2026-04-02T15:45:32.674Z', '2026-04-02T16:43:41.062Z'
  WHERE NOT EXISTS (SELECT 1 FROM public.slangs WHERE LOWER(word) = LOWER('ချေ'));

  -- Re-add FK constraint if it was dropped
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'slangs_author_id_fkey' AND table_name = 'slangs'
  ) THEN
    RAISE NOTICE 'Re-adding FK constraint will be done after you sign in. Run the fixup query shown above.';
  END IF;

  RAISE NOTICE 'Migration complete!';
END $$;

-- Verify
SELECT count(*) as total_slangs FROM public.slangs;

-- AFTER you sign in for the first time, run these two queries:
-- 1. Update placeholder author_ids:
--    UPDATE public.slangs SET author_id = (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1) WHERE author_id = '00000000-0000-0000-0000-000000000000';
-- 2. Re-add the foreign key constraint:
--    ALTER TABLE public.slangs ADD CONSTRAINT slangs_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);
