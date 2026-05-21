import { createClient } from "@supabase/supabase-js"
import ReferralLanding from "./ReferralLanding"

export default async function ReferralPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: referrer } = await supabaseAdmin
    .from("users")
    .select("name")
    .eq("referral_code", code)
    .maybeSingle()

  const referrerName = referrer?.name?.trim() || null

  return <ReferralLanding code={code} referrerName={referrerName} />
}
