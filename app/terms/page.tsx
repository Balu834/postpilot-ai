import Link from "next/link"
import { Zap } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — PostPilot AI",
  description: "Terms of Service for PostPilot AI. Read our terms and conditions before using the platform.",
}

const LAST_UPDATED = "May 20, 2026"
const CONTACT_EMAIL = "support@postpilot.ai"
const APP_URL = "https://postpilot.ai"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-300">
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
          <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-slate-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose-legal">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using PostPilot AI ("{APP_URL}"), you agree to be bound by these Terms of
              Service ("Terms"). If you do not agree to these Terms, do not use the Service. These Terms
              apply to all visitors, users, and others who access or use the Service.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              PostPilot AI is an AI-powered social media content management platform that allows users
              to generate, schedule, and publish content across multiple social media platforms including
              Twitter/X and LinkedIn. Features include AI content generation, content repurposing, post
              scheduling, analytics, and brand voice customization.
            </p>
          </Section>

          <Section title="3. Accounts">
            <ul>
              <li>You must be at least 13 years old to use this Service.</li>
              <li>
                You are responsible for maintaining the confidentiality of your account credentials and
                for all activities that occur under your account.
              </li>
              <li>
                You agree to notify us immediately of any unauthorized use of your account at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </li>
              <li>
                We reserve the right to terminate accounts that violate these Terms or remain inactive
                for more than 12 months.
              </li>
            </ul>
          </Section>

          <Section title="4. Subscription and Payments">
            <ul>
              <li>
                PostPilot AI offers free and paid subscription plans. Paid plans are billed monthly or
                annually as selected at checkout.
              </li>
              <li>
                All payments are processed securely via Razorpay. By subscribing, you authorize us to
                charge your payment method on a recurring basis.
              </li>
              <li>
                Subscription fees are non-refundable except as required by applicable law. If you cancel
                your subscription, you retain access to paid features until the end of your current
                billing period.
              </li>
              <li>
                We reserve the right to change pricing at any time. Price changes will be communicated
                at least 14 days in advance via email.
              </li>
              <li>
                Free plan users are subject to usage limits including a cap on AI-generated posts per
                month. Limits are displayed within the dashboard.
              </li>
            </ul>
          </Section>

          <Section title="5. Acceptable Use">
            <p>You agree NOT to use PostPilot AI to:</p>
            <ul>
              <li>Generate, publish, or schedule spam, misleading, or deceptive content.</li>
              <li>Violate any applicable laws or regulations.</li>
              <li>Infringe upon the intellectual property rights of others.</li>
              <li>
                Attempt to reverse engineer, hack, or gain unauthorized access to our systems or another
                user's account.
              </li>
              <li>
                Use the Service to generate content that is hateful, harassing, violent, or sexually
                explicit.
              </li>
              <li>
                Exceed the rate limits or usage quotas imposed on your plan through automated means.
              </li>
              <li>
                Resell or sublicense access to the Service without our written permission.
              </li>
            </ul>
            <p>
              We reserve the right to suspend or terminate your account immediately for violations
              without notice.
            </p>
          </Section>

          <Section title="6. AI-Generated Content">
            <ul>
              <li>
                Content generated by our AI is provided as-is. You are solely responsible for reviewing,
                editing, and approving any content before publishing to your social media accounts.
              </li>
              <li>
                We do not guarantee that AI-generated content is accurate, original, or free from
                copyright issues. Always verify facts and claims before publishing.
              </li>
              <li>
                By using our content generation features, you grant us a limited license to process your
                inputs (topics, brand voice settings, uploaded content) solely for the purpose of
                generating outputs for you.
              </li>
              <li>
                You retain full ownership of content you create, upload, or generate through the Service.
              </li>
            </ul>
          </Section>

          <Section title="7. Third-Party Social Platforms">
            <p>
              PostPilot AI integrates with third-party platforms (Twitter/X, LinkedIn, and others).
              Your use of these integrations is subject to those platforms' own terms of service and
              policies. We are not responsible for:
            </p>
            <ul>
              <li>Changes to third-party APIs that affect our Service's functionality.</li>
              <li>Content moderation decisions made by third-party platforms.</li>
              <li>Suspension or banning of your accounts on third-party platforms.</li>
            </ul>
          </Section>

          <Section title="8. Intellectual Property">
            <p>
              The PostPilot AI platform, including its design, code, logo, and all non-user-generated
              content, is the exclusive property of PostPilot AI and is protected by copyright and
              other intellectual property laws. You may not copy, modify, distribute, or create
              derivative works without our express written consent.
            </p>
          </Section>

          <Section title="9. Disclaimer of Warranties">
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR
              A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE
              UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW, POSTPILOT AI SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA,
              OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE, EVEN IF WE HAVE
              BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS
              ARISING FROM USE OF THE SERVICE SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE 12 MONTHS
              PRECEDING THE CLAIM.
            </p>
          </Section>

          <Section title="11. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless PostPilot AI and its officers, directors,
              employees, and agents from any claims, damages, losses, liabilities, and expenses (including
              legal fees) arising out of your use of the Service, your violation of these Terms, or your
              violation of any rights of a third party.
            </p>
          </Section>

          <Section title="12. Termination">
            <p>
              We may terminate or suspend your account and access to the Service at our sole discretion,
              without prior notice, for conduct that we believe violates these Terms or is harmful to
              other users, us, third parties, or the public. Upon termination, your right to use the
              Service ceases immediately. Provisions that by their nature should survive termination
              (including intellectual property, disclaimer, indemnification, and limitation of liability)
              will survive.
            </p>
          </Section>

          <Section title="13. Changes to Terms">
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of material
              changes via email or a prominent notice within the Service at least 7 days before the
              changes take effect. Your continued use of the Service after the effective date constitutes
              acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="14. Governing Law">
            <p>
              These Terms are governed by the laws of India, without regard to conflict of law principles.
              Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of
              the courts located in India.
            </p>
          </Section>

          <Section title="15. Contact Us">
            <p>
              If you have any questions about these Terms, please contact us at:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </Section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
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
      <div className="space-y-3 text-slate-400 leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_a]:text-[#F7BE4D] [&_a]:hover:underline">
        {children}
      </div>
    </section>
  )
}
