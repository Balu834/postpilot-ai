import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const WINDOW_SECONDS = 60
const MAX_REQUESTS = 5

export async function checkRateLimit(userId: string): Promise<{ limited: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - WINDOW_SECONDS * 1000).toISOString()

  const { count } = await supabaseAdmin
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", windowStart)

  const used = count ?? 0
  const remaining = Math.max(0, MAX_REQUESTS - used)

  return { limited: used >= MAX_REQUESTS, remaining }
}
