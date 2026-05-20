import posthog from "posthog-js"

function safe(fn: () => void) {
  if (typeof window === "undefined") return
  try { fn() } catch {}
}

export const analytics = {
  identify: (userId: string, traits: {
    email?: string; plan?: string; niche?: string; tone?: string; goal?: string; platforms?: string[]
  }) => safe(() => posthog.identify(userId, traits)),

  reset: () => safe(() => posthog.reset()),

  signup: (method: "email" | "google") =>
    safe(() => posthog.capture("user_signup", { method })),

  login: (method: "email" | "google") =>
    safe(() => posthog.capture("user_login", { method })),

  onboardingStarted: () =>
    safe(() => posthog.capture("onboarding_started")),

  onboardingStepCompleted: (step: number, stepName: string) =>
    safe(() => posthog.capture("onboarding_step_completed", { step, step_name: stepName })),

  onboardingCompleted: (props: { niche: string; tone: string; goal: string; platforms: string[] }) =>
    safe(() => posthog.capture("onboarding_completed", props)),

  generationStarted: (props: { topic_length: number; tone: string; has_product: boolean; has_blog_url: boolean }) =>
    safe(() => posthog.capture("generation_started", props)),

  generationCompleted: (props: { tone: string; topic_length: number; duration_ms: number }) =>
    safe(() => posthog.capture("generation_completed", props)),

  generationFailed: (error: string) =>
    safe(() => posthog.capture("generation_failed", { error })),

  blogToPostsUsed: (has_url: boolean) =>
    safe(() => posthog.capture("blog_to_posts_used", { has_url })),

  templateUsed: (id: string, title: string, category: string) =>
    safe(() => posthog.capture("template_used", { template_id: id, template_title: title, category })),

  copyClicked: (platform: string) =>
    safe(() => posthog.capture("copy_clicked", { platform })),

  scheduleCreated: (platform: string) =>
    safe(() => posthog.capture("schedule_created", { platform })),

  upgradeClicked: (source: string, plan?: string) =>
    safe(() => posthog.capture("upgrade_clicked", { source, plan })),

  checkoutStarted: (plan: string) =>
    safe(() => posthog.capture("checkout_started", { plan })),

  subscriptionCreated: (plan: string) =>
    safe(() => posthog.capture("subscription_created", { plan })),
}
