import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, ArrowLeft, Send, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useMeta } from '../lib/useMeta';
import { cn } from '../lib/utils';
import { useI18n } from '../lib/i18n';

const DEFAULTS = {
  contact_email: 'ban-sagar@madebysai.com',
  contact_get_in_touch:
    "Have questions, feedback, or suggestions? We're always happy to hear from our community. Send us a message using the form below or email us directly.",
  contact_report_issues:
    "Found a bug or have a feature request? Found inaccurate or inappropriate content? Please let us know through email and we'll address it as soon as possible.",
};

type FormStatus = 'idle' | 'sending' | 'sent' | 'error';

export function Contact() {
  const { t } = useI18n();
  const [content, setContent] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setFormStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }),
      });

      if (!res.ok) throw new Error('Failed');

      setFormStatus('sent');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setTimeout(() => setFormStatus('idle'), 4000);
    } catch {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 4000);
    }
  };

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
        <ArrowLeft className="w-4 h-4" /> {t('general.back')}
      </Link>

      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/15">
          <MessageCircle className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">{t('contact.title')}</h1>
        <p className="text-text-secondary text-sm">{t('contact.subtitle')}</p>
      </div>

      <div className="space-y-6">
        {/* Contact Form */}
        <div className="bg-surface-raised/80 rounded-2xl border border-white/[0.04] p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <Send className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-display font-bold text-white">{t('contact.sendMessage')}</h2>
          </div>
          <div className="text-sm text-white/60 leading-relaxed">
            {content.contact_get_in_touch.split('\n').filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">{t('contact.name')} *</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/20 transition-all"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">{t('contact.email')} *</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/20 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-subject" className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">{t('contact.subject')}</label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/20 transition-all"
                placeholder="What's this about?"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">{t('contact.message')} *</label>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/20 transition-all resize-none"
                placeholder="Your message..."
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={formStatus === 'sending' || formStatus === 'sent'}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95",
                  formStatus === 'sent'
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30",
                  (formStatus === 'sending' || formStatus === 'sent') && "opacity-80 cursor-not-allowed"
                )}
              >
                {formStatus === 'sending' && <Loader2 className="w-4 h-4 animate-spin" />}
                {formStatus === 'sent' && <CheckCircle className="w-4 h-4" />}
                {formStatus === 'idle' && <Send className="w-4 h-4" />}
                {formStatus === 'error' && <AlertTriangle className="w-4 h-4" />}
                {formStatus === 'sending' ? t('contact.sending') : formStatus === 'sent' ? t('contact.sent') : formStatus === 'error' ? t('contact.tryAgain') : t('contact.send')}
              </button>

              {formStatus === 'error' && (
                <span className="text-xs text-red-400">{t('contact.error')}</span>
              )}
            </div>
          </form>
        </div>

        {/* Direct Email */}
        <div className="bg-surface-raised/80 rounded-2xl border border-white/[0.04] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-display font-bold text-white">{t('contact.emailDirect')}</h2>
          </div>
          <ContactItem
            icon={<Mail className="w-4 h-4" />}
            label={t('contact.email')}
            value={content.contact_email}
            href={`mailto:${content.contact_email}`}
          />
        </div>

        {/* Report Issues */}
        <div className="bg-surface-raised/80 rounded-2xl border border-white/[0.04] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-display font-bold text-white">{t('contact.reportIssues')}</h2>
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
