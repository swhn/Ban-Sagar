import React from 'react';
import {
  BookOpen, Star, Heart, Eye, Lightbulb, Award, TrendingUp, MessageSquare,
  Users, Target, Crown, Flame, Globe, PenLine, Rocket, Zap, Gem, BadgeCheck
} from 'lucide-react';

export interface ContributorStats {
  author_id: string;
  author_name: string;
  avatar_url: string | null;
  approved_count: number;
  total_count: number;
  total_upvotes: number;
  total_views: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  check: (stats: ContributorStats) => boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'legendary';
}

export const ACHIEVEMENTS: Achievement[] = [
  // Bronze
  { id: 'first_word', title: 'First Word', description: 'Submit your first slang', icon: <BookOpen className="w-5 h-5" />, color: 'from-sky-400 to-blue-500', check: (s) => s.total_count >= 1, tier: 'bronze' },
  { id: 'wordsmith', title: 'Wordsmith', description: '5 slangs approved', icon: <Star className="w-5 h-5" />, color: 'from-emerald-400 to-green-500', check: (s) => s.approved_count >= 5, tier: 'bronze' },
  { id: 'crowd_favorite', title: 'Crowd Favorite', description: '10 total upvotes', icon: <Heart className="w-5 h-5" />, color: 'from-pink-400 to-rose-500', check: (s) => s.total_upvotes >= 10, tier: 'bronze' },
  { id: 'first_glance', title: 'First Glance', description: '50 total views', icon: <Eye className="w-5 h-5" />, color: 'from-teal-400 to-cyan-500', check: (s) => s.total_views >= 50, tier: 'bronze' },
  { id: 'getting_started', title: 'Getting Started', description: '3 slangs approved', icon: <Lightbulb className="w-5 h-5" />, color: 'from-yellow-400 to-amber-500', check: (s) => s.approved_count >= 3, tier: 'bronze' },
  // Silver
  { id: 'slang_scholar', title: 'Slang Scholar', description: '15 slangs approved', icon: <Award className="w-5 h-5" />, color: 'from-violet-400 to-purple-500', check: (s) => s.approved_count >= 15, tier: 'silver' },
  { id: 'trending', title: 'Trending', description: '50 total upvotes', icon: <TrendingUp className="w-5 h-5" />, color: 'from-fuchsia-400 to-purple-500', check: (s) => s.total_upvotes >= 50, tier: 'silver' },
  { id: 'viral', title: 'Viral', description: '100+ total views', icon: <Eye className="w-5 h-5" />, color: 'from-cyan-400 to-blue-500', check: (s) => s.total_views >= 100, tier: 'silver' },
  { id: 'contributor', title: 'Active Contributor', description: '10 slangs submitted', icon: <MessageSquare className="w-5 h-5" />, color: 'from-indigo-400 to-blue-500', check: (s) => s.total_count >= 10, tier: 'silver' },
  { id: 'community_voice', title: 'Community Voice', description: '25 total upvotes', icon: <Users className="w-5 h-5" />, color: 'from-emerald-400 to-teal-500', check: (s) => s.total_upvotes >= 25, tier: 'silver' },
  // Gold
  { id: 'dictionary_builder', title: 'Dictionary Builder', description: '30 slangs approved', icon: <Target className="w-5 h-5" />, color: 'from-amber-400 to-orange-500', check: (s) => s.approved_count >= 30, tier: 'gold' },
  { id: 'slang_master', title: 'Slang Master', description: '50 slangs approved', icon: <Crown className="w-5 h-5" />, color: 'from-rose-400 to-pink-500', check: (s) => s.approved_count >= 50, tier: 'gold' },
  { id: 'on_fire', title: 'On Fire', description: '100 total upvotes', icon: <Flame className="w-5 h-5" />, color: 'from-orange-400 to-red-500', check: (s) => s.total_upvotes >= 100, tier: 'gold' },
  { id: 'globe_trotter', title: 'Globe Trotter', description: '500+ total views', icon: <Globe className="w-5 h-5" />, color: 'from-blue-400 to-indigo-500', check: (s) => s.total_views >= 500, tier: 'gold' },
  { id: 'prolific', title: 'Prolific Writer', description: '25 slangs submitted', icon: <PenLine className="w-5 h-5" />, color: 'from-violet-400 to-fuchsia-500', check: (s) => s.total_count >= 25, tier: 'gold' },
  // Legendary
  { id: 'legendary', title: 'Legendary', description: '100 slangs approved', icon: <Rocket className="w-5 h-5" />, color: 'from-yellow-300 to-amber-500', check: (s) => s.approved_count >= 100, tier: 'legendary' },
  { id: 'hall_of_fame', title: 'Hall of Fame', description: '1000+ total views', icon: <Zap className="w-5 h-5" />, color: 'from-yellow-300 to-orange-500', check: (s) => s.total_views >= 1000, tier: 'legendary' },
  { id: 'diamond', title: 'Diamond Contributor', description: '200 total upvotes', icon: <Gem className="w-5 h-5" />, color: 'from-cyan-300 to-blue-500', check: (s) => s.total_upvotes >= 200, tier: 'legendary' },
  { id: 'verified_legend', title: 'Verified Legend', description: '50 slangs & 100 upvotes', icon: <BadgeCheck className="w-5 h-5" />, color: 'from-purple-300 to-pink-500', check: (s) => s.approved_count >= 50 && s.total_upvotes >= 100, tier: 'legendary' },
];

export const TIER_STYLES = {
  bronze: 'ring-amber-700/20 bg-amber-900/10',
  silver: 'ring-slate-400/20 bg-slate-500/[0.06]',
  gold: 'ring-yellow-500/25 bg-yellow-500/[0.06]',
  legendary: 'ring-purple-500/25 bg-gradient-to-br from-purple-500/[0.06] to-amber-500/[0.06]',
};
