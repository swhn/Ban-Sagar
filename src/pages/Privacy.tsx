import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export function Privacy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white text-sm font-medium rounded-xl transition-all active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-violet-500/15">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Privacy Policy</h1>
        <p className="text-text-secondary text-sm">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="space-y-5">
        <PolicySection title="1. Information We Collect">
          <p>When you use Ban Sagar, we may collect the following information:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-1">
            <li><strong className="text-white/70">Account Information:</strong> When you sign in with Google, we receive your email address, display name, and profile picture.</li>
            <li><strong className="text-white/70">User Content:</strong> Slang words, definitions, examples, suggestions, and votes you submit.</li>
            <li><strong className="text-white/70">Usage Data:</strong> Page views and view counts on slang entries for trending/analytics features.</li>
          </ul>
        </PolicySection>

        <PolicySection title="2. How We Use Your Information">
          <p>We use collected information to:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-1">
            <li>Provide and maintain the Ban Sagar dictionary service</li>
            <li>Display your contributions with your chosen display name</li>
            <li>Calculate leaderboard rankings and achievements</li>
            <li>Moderate content for quality and appropriateness</li>
            <li>Improve the user experience and site features</li>
          </ul>
        </PolicySection>

        <PolicySection title="3. Data Sharing">
          <p>
            We do not sell, trade, or share your personal information with third parties.
            Your contributed content (slang words, definitions) is publicly visible to all
            users. Your display name is shown alongside your contributions.
          </p>
        </PolicySection>

        <PolicySection title="4. Authentication">
          <p>
            We use Google OAuth through Supabase for authentication. We do not store your
            Google password. Authentication is handled securely by Google's OAuth 2.0
            service. We only receive the profile information you authorize.
          </p>
        </PolicySection>

        <PolicySection title="5. Cookies & Storage">
          <p>
            We use browser local storage and session storage to maintain your login state
            and preferences (such as NSFW content settings). We do not use tracking cookies
            or third-party analytics services.
          </p>
        </PolicySection>

        <PolicySection title="6. Data Retention">
          <p>
            Your account information is retained as long as your account is active. Contributed
            content remains in the dictionary even if your account is deleted, but will be
            anonymized. You can request deletion of your account and associated data by
            contacting us.
          </p>
        </PolicySection>

        <PolicySection title="7. Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-1">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your account and personal data</li>
            <li>Withdraw consent for data processing at any time</li>
          </ul>
        </PolicySection>

        <PolicySection title="8. Contact">
          <p>
            If you have any questions about this Privacy Policy or your data, please
            contact us at{' '}
            <a href="mailto:ban-sagar@madebysai.com" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              ban-sagar@madebysai.com
            </a>
            {' '}or visit our{' '}
            <Link to="/contact" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Contact page
            </Link>.
          </p>
        </PolicySection>
      </div>
    </motion.div>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-raised/80 rounded-2xl border border-white/[0.04] p-5 sm:p-6">
      <h2 className="text-base font-display font-bold text-white mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-white/60 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
