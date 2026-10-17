-- Website posters re-cut from a clean frame of each video (no social-media hook text); ?v=2 so caches fetch the new ones.
UPDATE projects SET poster = '/media/firnlight.webp?v=2' WHERE slug = 'firnlight';
UPDATE projects SET poster = '/media/oddball.webp?v=2' WHERE slug = 'oddball';
UPDATE projects SET poster = '/media/valmora.webp?v=2' WHERE slug = 'valmora';
UPDATE projects SET poster = '/media/earshot.webp?v=2' WHERE slug = 'earshot';
-- Darebni AI is live on the App Store (projects row says so); the FAQ still called it "in development".
UPDATE faqs SET answer = 'Yes. We design and build mobile apps for iOS and Android, from the first screens to the admin side and publishing on the App Store and Google Play. Darebni AI, an AI-powered fitness app we built, is live on the App Store.' WHERE id = 7;
