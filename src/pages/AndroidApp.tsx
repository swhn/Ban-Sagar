import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Search, Zap, Moon, Share2, Wifi, Bell, Shield, ArrowLeft, ChevronRight, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useMeta } from '../lib/useMeta';
import { cn } from '../lib/utils';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.bansagar.app';

const features = [
  {
    icon: <Search className="w-5 h-5" />,
    color: 'from-indigo-400 to-blue-500',
    title: 'Instant Search',
    description: 'Find slang words instantly with real-time search in both English and Burmese.',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    color: 'from-amber-400 to-orange-500',
    title: 'Trending & Latest',
    description: 'Browse trending, latest, and top-voted slang words updated from the community.',
  },
  {
    icon: <Moon className="w-5 h-5" />,
    color: 'from-purple-400 to-violet-500',
    title: 'Dark & Light Mode',
    description: 'Material You design that adapts to your system theme and wallpaper colors.',
  },
  {
    icon: <Share2 className="w-5 h-5" />,
    color: 'from-emerald-400 to-green-500',
    title: 'Easy Sharing',
    description: 'Share any slang word with friends via any app on your phone.',
  },
  {
    icon: <Wifi className="w-5 h-5" />,
    color: 'from-sky-400 to-cyan-500',
    title: 'Deep Links',
    description: 'Tap any bansagar.com link and it opens directly in the app.',
  },
  {
    icon: <Bell className="w-5 h-5" />,
    color: 'from-pink-400 to-rose-500',
    title: 'Notifications',
    description: 'Get notified when your contributions are approved or you unlock badges.',
  },
];

export function AndroidApp() {
  useMeta({
    title: 'Android App',
    description: 'Download Ban Sagar for Android — Browse, search, and contribute to Myanmar\'s largest slang dictionary on the go.',
    url: '/app',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-10"
    >
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white text-sm font-medium rounded-xl transition-all active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Hero */}
      <div className="text-center space-y-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl shadow-indigo-500/25"
        >
          <Smartphone className="w-10 h-10 text-white" />
        </motion.div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Ban Sagar for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
              Android
            </span>
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-lg mx-auto leading-relaxed">
            Myanmar's slang dictionary in your pocket. Browse, search, and contribute — all from your Android device.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <PlayStoreIcon />
            Get it on Google Play
          </a>
          <span className="text-xs text-white/30">Free • No ads</span>
        </div>
      </div>

      {/* App Preview */}
      <div className="bg-surface-raised/80 rounded-2xl border border-white/[0.04] p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PhoneFrame title="Home" subtitle="Trending words at a glance">
            <div className="space-y-2">
              <div className="flex gap-1.5">
                {['Trending', 'Latest', 'Top'].map(tab => (
                  <div key={tab} className={cn(
                    "px-2 py-1 rounded-md text-[9px] font-bold",
                    tab === 'Trending' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-white/30'
                  )}>
                    {tab}
                  </div>
                ))}
              </div>
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.04]">
                  <div className="h-2.5 bg-white/15 rounded w-16 mb-1.5" />
                  <div className="h-2 bg-white/8 rounded w-full mb-1" />
                  <div className="h-2 bg-white/5 rounded w-3/4" />
                </div>
              ))}
            </div>
          </PhoneFrame>

          <PhoneFrame title="Search" subtitle="Find words instantly">
            <div className="space-y-2">
              <div className="bg-white/[0.05] rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 border border-white/[0.06]">
                <Search className="w-3 h-3 text-white/20" />
                <span className="text-[9px] text-white/30">Search word or meaning...</span>
              </div>
              {[1, 2].map(i => (
                <div key={i} className="bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.04]">
                  <div className="h-2.5 bg-indigo-400/20 rounded w-14 mb-1.5" />
                  <div className="h-2 bg-white/8 rounded w-full" />
                </div>
              ))}
            </div>
          </PhoneFrame>

          <PhoneFrame title="Detail" subtitle="Full word breakdown">
            <div className="space-y-2">
              <div className="bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.04]">
                <div className="h-3 bg-white/15 rounded w-20 mb-1" />
                <div className="h-2 bg-indigo-400/15 rounded w-12 mb-2" />
                <div className="flex gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-400/30" />
                    <span className="text-[8px] text-white/30">128</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <span className="text-[8px] text-white/30">1.2k</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-2 border border-white/[0.03]">
                <div className="text-[8px] text-indigo-400/50 font-bold mb-1">MEANING</div>
                <div className="h-2 bg-white/8 rounded w-full mb-0.5" />
                <div className="h-2 bg-white/5 rounded w-4/5" />
              </div>
            </div>
          </PhoneFrame>
        </div>
      </div>

      {/* Features Grid */}
      <div className="space-y-5">
        <h2 className="text-xl font-display font-bold text-white text-center">Why you'll love it</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface-raised/80 rounded-xl border border-white/[0.04] p-4 flex gap-3.5"
            >
              <div className={cn(
                "shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg",
                feature.color
              )}>
                {feature.icon}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-0.5">{feature.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tech specs */}
      <div className="bg-surface-raised/80 rounded-2xl border border-white/[0.04] p-5 sm:p-6">
        <h2 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          App Details
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: 'Size', value: '~15 MB' },
            { label: 'Android', value: '8.0+' },
            { label: 'Price', value: 'Free' },
            { label: 'Ads', value: 'None' },
          ].map(spec => (
            <div key={spec.label} className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.03]">
              <div className="text-lg font-display font-bold text-white">{spec.value}</div>
              <div className="text-[11px] text-white/40 font-medium">{spec.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Same data callout */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/15 p-5 sm:p-6 text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Star className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-display font-bold text-white">Same dictionary, native experience</h2>
        </div>
        <p className="text-sm text-white/60 max-w-lg mx-auto leading-relaxed">
          The Android app connects to the same database as bansagar.com. Your votes, contributions, and badges sync across web and mobile. Sign in with the same Google account on both.
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pb-4 space-y-4">
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <PlayStoreIcon />
          Download on Google Play
          <ChevronRight className="w-4 h-4" />
        </a>
        <p className="text-xs text-white/25">
          Available on Android 8.0 (Oreo) and above
        </p>
      </div>
    </motion.div>
  );
}

function PhoneFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface/80 rounded-2xl border border-white/[0.06] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-white">{title}</div>
          <div className="text-[9px] text-white/30">{subtitle}</div>
        </div>
        <div className="flex gap-0.5">
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <div className="w-1 h-1 rounded-full bg-white/10" />
        </div>
      </div>
      {children}
    </div>
  );
}

function PlayStoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 0 1 0 1.38l-2.302 2.302L15.198 12l2.5-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z"/>
    </svg>
  );
}
