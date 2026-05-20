import Link from "next/link"
import { Zap } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — PostPilot AI",
  description: "Privacy Policy for PostPilot AI. Learn how we collect, use, and protect your data.",
}

const LAST_UPDATED = "May 20, 2026"
const CONTACT_EMAIL = "support@postpilot.ai"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-slate-300">
      {/* Nav */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#F7BE4D] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-[#050816]" fill="currentColor" />
            </div>
            <span className="font-bold text-white">PostPilot</span>
            <span className="text-[#F7BE4D] font-bold">AI</span>
          </Link>
          <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
            Sign in →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-slate-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div>
          <Section title="1. Introduction">
            <p>
              PostPilot AI ("we", "us", or "our") is committed to protecting your personal information.
              This Privacy Policy explains what data we collect, how we use it, and the choices you have
              regarding your information when you use our platform at postpilot.ai.
            </p>
            <p>
              By using PostPilot AI, you consent to the data practices described in this policy.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong className="text-white">Information you provide directly:</strong></p>
            <ul>
              <li>
                <strong className="text-slate-300">Account information:</strong> Email address, name,
                and password when you create an account. If you sign in with Google, we receive your
                name and email from Google.
              </li>
              <li>
                <strong className="text-slate-300">Profile and preferences:</strong> Niche, brand voice
                settings (brand name, industry, audience, tone, preferred topics), and notification
                preferences.
              </li>
              <li>
                <strong className="text-slate-300">Content you create:</strong> Topics, blog URLs,
                generated posts, scheduled content, and any text you paste into the repurpose tool.
              </li>
              <li>
                <strong className="text-slate-300">Payment information:</strong> We do not store your
                card details. Payment processing is handled entirely by Razorpay. We receive
                confirmation of payment status only.
              </li>
            </ul>

            <p><strong className="text-white">Information collected automatically:</strong></p>
            <ul>
              <li>
                <strong className="text-slate-300">Usage data:</strong> Pages visited, features used,
                generation counts, and session activity to improve the product.
              </li>
              <li>
                <strong className="text-slate-300">Technical data:</strong> IP address, browser type,
                operating system, and device information.
              </li>
              <li>
                <strong className="text-slate-300">Cookies:</strong> We use essential session cookies
                (Supabase auth) and optional referral cookies. We do not use third-party advertising
                cookies.
              </li>
            </ul>

            <p><strong className="text-white">Information from third parties:</strong></p>
            <ul>
              <li>
                <strong className="text-slate-300">Social media accounts:</strong> When you connect
                Twitter/X or LinkedIn, we store OAuth access tokens to publish on your behalf. We only
                request the minimum permissions needed and never read your private messages.
              </li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul>
              <li>To create and manage your account and authenticate you securely.</li>
              <li>To generate AI content tailored to your brand voice and preferences.</li>
              <li>To schedule and publish posts to your connected social media accounts.</li>
              <li>To send transactional emails (publish confirmations, weekly digests) if you opt in.</li>
              <li>To process payments and manage your subscription.</li>
              <li>To send product updates, feature announcements, and important notices.</li>
              <li>To monitor and prevent abuse, fraud, and rate-limit violations.</li>
              <li>To analyze aggregate usage patterns and improve the Service.</li>
              <li>To respond to your support requests.</li>
            </ul>
            <p>
              We do not sell your personal data to third parties. We do not use your content to train
              AI models without your explicit consent.
            </p>
          </Section>

          <Section title="4. Data Sharing">
            <p>We share your data only with:</p>
            <ul>
              <li>
                <strong className="text-slate-300">Supabase:</strong> Our database and authentication
                provider. Data is stored on Supabase infrastructure with encryption at rest.
              </li>
              <li>
                <strong className="text-slate-300">OpenAI:</strong> Your content prompts are sent to
                OpenAI's API to generate posts. OpenAI's data usage policy applies. We do not send your
                account email or personal details to OpenAI.
              </li>
              <li>
                <strong className="text-slate-300">Razorpay:</strong> For payment processing. Subject
                to Razorpay's privacy policy.
              </li>
              <li>
                <strong className="text-slate-300">Resend:</strong> For transactional email delivery.
                Your email address is shared only to deliver emails you requested.
              </li>
              <li>
                <strong className="text-slate-300">Twitter/X and LinkedIn:</strong> Your content and
                access tokens are used solely to publish on your behalf when you authorize it.
              </li>
              <li>
                <strong className="text-slate-300">Crisp:</strong> Our live chat support provider may
                receive your name, email, and conversation history when you use the chat widget.
              </li>
              <li>
                <strong className="text-slate-300">Vercel:</strong> Our hosting provider. May process
                request logs including IP addresses.
              </li>
            </ul>
            <p>
              We may disclose your information if required by law, court order, or governmental authority.
            </p>
          </Section>

          <Section title="5. Data Retention">
            <ul>
              <li>
                Account data is retained for as long as your account is active. You may request deletion
                at any time (see Section 7).
              </li>
              <li>Generated posts and scheduled content are retained to power your dashboard history.</li>
              <li>
                Payment records are retained as required by applicable financial regulations (typically
                7 years).
              </li>
              <li>
                OAuth access tokens for connected social accounts are deleted when you disconnect
                a platform from Settings.
              </li>
            </ul>
          </Section>

          <Section title="6. Security">
            <p>
              We implement industry-standard security measures to protect your data:
            </p>
            <ul>
              <li>All data is encrypted in transit (TLS/HTTPS) and at rest.</li>
              <li>Authentication is handled by Supabase with JWT-based session management.</li>
              <li>API endpoints are protected with authentication and rate limiting.</li>
              <li>Service role keys and secrets are never exposed to the client.</li>
              <li>
                Access tokens for social media accounts are stored encrypted in our database and used
                only for scheduled publishing.
              </li>
            </ul>
            <p>
              No system is perfectly secure. If you discover a security vulnerability, please email us
              at{" "}<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will respond promptly.
            </p>
          </Section>

          <Section title="7. Your Rights and Choices">
            <ul>
              <li>
                <strong className="text-slate-300">Access:</strong> You can view and update your
                profile information at any time from your Settings page.
              </li>
              <li>
                <strong className="text-slate-300">Disconnecting social accounts:</strong> You can
                revoke our access to your Twitter/X or LinkedIn accounts from Settings → Connected
                Accounts at any time.
              </li>
              <li>
                <strong className="text-slate-300">Email preferences:</strong> You can opt out of
                weekly digest emails and publish notifications from Settings → Notifications.
              </li>
              <li>
                <strong className="text-slate-300">Data deletion:</strong> You may request deletion of
                your account and all associated data by emailing us at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We will process your request
                within 30 days.
              </li>
              <li>
                <strong className="text-slate-300">Data portability:</strong> You may request a copy
                of your generated content and account data in a machine-readable format.
              </li>
            </ul>
            <p>
              If you are located in the European Economic Area (EEA), you have additional rights under
              the GDPR, including the right to lodge a complaint with your local supervisory authority.
            </p>
          </Section>

          <Section title="8. Cookies">
            <p>We use the following cookies:</p>
            <ul>
              <li>
                <strong className="text-slate-300">Authentication cookies</strong> (essential): Set by
                Supabase to keep you signed in. Cannot be disabled without breaking the Service.
              </li>
              <li>
                <strong className="text-slate-300">Referral cookie</strong> (<code>postpilot_ref</code>):
                Set for 30 days when you visit a referral link, to credit the referring user. Deleted
                after signup.
              </li>
            </ul>
            <p>We do not use advertising, tracking, or analytics cookies from third-party ad networks.</p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              PostPilot AI is not directed to children under the age of 13. We do not knowingly collect
              personal information from children under 13. If you believe we have inadvertently collected
              such data, please contact us immediately and we will delete it.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material
              changes via email or a prominent notice in the app. Your continued use of the Service
              after the changes take effect constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or your
              personal data, please contact us at:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </Section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white transition-colors">Contact</a>
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      <div className="space-y-3 text-slate-400 leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_a]:text-[#F7BE4D] [&_a]:hover:underline [&_code]:text-slate-300 [&_code]:bg-white/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs">
        {children}
      </div>
    </section>
  )
}
