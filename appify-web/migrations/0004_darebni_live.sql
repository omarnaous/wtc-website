-- Darebni AI is on the App Store: its card shows a web preview of the store page.
UPDATE projects SET
  store_url = 'https://apps.apple.com/us/app/darebni-ai-workout-coach/id6764822814',
  status = 'live',
  summary = 'An AI-powered fitness app, now on the App Store.',
  description = 'Darebni AI is an AI-powered fitness app built by Appify, now on the App Store.'
WHERE slug = 'darebni-ai';
DELETE FROM settings WHERE key = 'store_debug';
