import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useMeta } from '../lib/useMeta';

const DEFAULTS = {
  contact_email: 'ban-sagar@madebysai.com',
  contact_get_in_touch:
    "Have questions, feedback, or suggestions? We're always happy to hear from our community. Here's how you can reach us:",
  contact_report_issues:
    "Found a bug or have a feature request? Found inaccurate or inappropriate content? Please let us know through email and we'll address it as soon as possible.",
};

export function Contact() {
  const [content, setContent] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useMeta({
    title: 'Contact',
    description: 'Get in touch with the Ban Sagar team. Report issues, share feedback, or suggest improvements.',
    url: '/contact',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['contact_email', 'contact_get_in_touch', 'contact_report_issues']);

        if (data) {
          const loaded = { ...DEFAULTS };
          data.forEach((row: any) => {
            if (row.value && row.key in loaded) {
              (loaded as any)[row.key] = row.value;
            }
          });
          setContent(loaded);
        }
      } catch (err) {
        // Use defaults on error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

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
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/15">
          <MessageCircle className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Contact Us</h1>
        <p className="text-text-secondary text-sm">We'd love to hear from you</p>
      </div>

      <div className="space-y-6">
        <div className="bg-surface-raised/80 rounded-2xl border border-white/[0.04] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-display font-bold text-white">Get in Touch</h2>
          </div>
          <div className="space-y-3 text-sm text-white/60 leading-relaxed">
            {content.contact_get_in_touch.split('\n').filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            <ContactItem
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              value={content.contact_email}
              href={`mailto:${content.contact_email}`}
            />
          </div>
        </div>

        <div className="bg-surface-raised/80 rounded-2xl border border-white/[0.04] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Send className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-display font-bold text-white">Report Issues</h2>
          </div>
          <div className="space-y-3 text-sm text-white/60 leading-relaxed">
            {content.contact_report_issues.split('\n').filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p>
              For content-related suggestions on specific slang words, you can also use
              the <Link to="/contribute" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Suggest</Link> feature
              directly on any approved word.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ContactItem({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group"
    >
      <div className="text-indigo-400/60 group-hover:text-indigo-400 transition-colors">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">{label}</p>
        <p className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{value}</p>
      </div>
    </a>
  );
}
