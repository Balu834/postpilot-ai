// Public, client-safe values — identical to what already ships in the
// PostPilot AI web app's own JS bundle to every visitor's browser.
// Not secrets: Supabase's anon key is designed to be exposed client-side
// and is only as powerful as your Row Level Security policies allow.
export const CONFIG = {
  APP_URL:              "https://getpostpilot.vercel.app",
  SUPABASE_URL:         "https://dnpsnmkdqrbmdufjwlqm.supabase.co",
  SUPABASE_ANON_KEY:    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucHNubWtkcXJibWR1Zmp3bHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxODI4NDgsImV4cCI6MjA5NDc1ODg0OH0.W-3KJrl0MzrfMaOweQ0y75UllL04nrVoe-DhmyR2JSg",
}
