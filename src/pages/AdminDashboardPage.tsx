import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Users,
  CheckSquare,
  Star,
  Download,
  LogOut,
  LayoutDashboard,
  TrendingUp,
  FileText,
  AlertCircle,
  Clock,
  Shield,
  Search,
  Filter,
  ArrowUpRight,
  Activity,
  Globe2,
  HelpCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { prompts, METRICS, MODELS } from '@/data/prompts';
import { supabase } from '@/lib/supabase';
import PodiumCard from '@/components/PodiumCard';

const MODEL_LABELS: Record<string, string> = {
  Model_A: 'GPT Image 1',
  Model_B: 'Gemini 2.5',
  Model_C: 'Gemini 3.1 Flash Image',
};

// Deep Blue, Slate, Teal – professional muted palette
const MODEL_COLORS: Record<string, string> = {
  Model_A: '#2563EB', // Deep Blue
  Model_B: '#64748B', // Slate
  Model_C: '#0D9488', // Teal
};

const GENDER_COLORS = ['#2563EB', '#64748B', '#0D9488', '#F59E0B'];

const LANGUAGE_MAP: Record<number, string> = {
  1: 'Telugu & English',
  2: 'Telugu Only',
  3: 'Tamil',
  4: 'Hindi & English',
  5: 'Marathi',
  6: 'Malayalam',
};

type Participant = {
  id: string;
  name: string;
  email: string;
  gender: string;
  profession: string;
  created_at: string;
};

type RatingRow = {
  participant_id: string;
  prompt_number: number;
  displayed_position: number;
  actual_model: string;
  metric_name: string;
  rating: number;
};

function avg(arr: number[]) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}const getModelLogo = (model: string, className = "w-6 h-6") => {
  if (model === 'Model_A') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`${className} text-[#10A37F] fill-current object-contain`} style={{ display: 'block' }}>
        <path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z" />
      </svg>
    );
  }
  return <img src="/images/gemini-logo.svg" alt="Gemini Logo" className={`${className} object-contain`} />;
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [responses, setResponses] = useState<RatingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'responses' | 'participants'>('overview');
  
  // Search & Filters for Logs/Participants
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [promptFilter, setPromptFilter] = useState('');

  const handleLogout = () => {
    sessionStorage.removeItem('admin_session');
    navigate('/admin/login');
  };

  useEffect(() => {
    async function load() {
      try {
        const [{ data: ps }, { data: rs }] = await Promise.all([
          supabase.from('participants').select('*').order('created_at', { ascending: false }),
          supabase.from('responses').select('*'),
        ]);
        setParticipants(ps ?? []);
        setResponses(rs ?? []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute overall stats
  const TOTAL_PER_P = prompts.length * MODELS.length * METRICS.length;
  const completed = participants.filter(
    (p) => responses.filter((r) => r.participant_id === p.id).length >= TOTAL_PER_P
  ).length;
  const completionRate = participants.length ? Math.round((completed / participants.length) * 100) : 0;
  const overallAvgAll = responses.length ? avg(responses.map((r) => r.rating)).toFixed(2) : '0.00';

  // Per model stats
  const modelStats = MODELS.map((model) => {
    const mr = responses.filter((r) => r.actual_model === model);
    const metricAvgs = METRICS.map((m) => {
      const v = avg(mr.filter((r) => r.metric_name === m.key).map((r) => r.rating));
      return { metric: m.label, value: Number(v.toFixed(2)) };
    });
    const overallAvg = Number(avg(metricAvgs.map((x) => x.value)).toFixed(2));
    
    // Find best and worst performing metrics
    const sortedMetrics = [...metricAvgs].sort((a, b) => b.value - a.value);
    const bestMetric = sortedMetrics[0]?.metric || 'N/A';
    const worstMetric = sortedMetrics[sortedMetrics.length - 1]?.metric || 'N/A';

    return { model, label: MODEL_LABELS[model], metricAvgs, overallAvg, bestMetric, worstMetric, totalReviews: mr.length };
  }).sort((a, b) => b.overallAvg - a.overallAvg);

  // Prompt-wise bar chart data
  const promptBarData = prompts.map((p) => {
    const obj: Record<string, string | number> = { name: `P${p.id}` };
    MODELS.forEach((m) => {
      const vals = responses.filter((r) => r.prompt_number === p.id && r.actual_model === m).map((r) => r.rating);
      obj[MODEL_LABELS[m]] = vals.length ? Number(avg(vals).toFixed(2)) : 0;
    });
    return obj;
  });

  // Demographics stats
  const genderCounts = participants.reduce((acc: Record<string, number>, p) => {
    acc[p.gender] = (acc[p.gender] || 0) + 1;
    return acc;
  }, {});
  const genderData = Object.entries(genderCounts).map(([name, value]) => ({ name, value }));

  // Language Performance data grid
  const languagePerformance = prompts.map((p) => {
    const ratingsForPrompt = responses.filter((r) => r.prompt_number === p.id);
    const modelScores = MODELS.map((m) => {
      const score = avg(ratingsForPrompt.filter((r) => r.actual_model === m).map((r) => r.rating));
      return { model: m, score: Number(score.toFixed(2)) };
    });
    const winner = [...modelScores].sort((a, b) => b.score - a.score)[0];
    return {
      promptId: p.id,
      language: LANGUAGE_MAP[p.id],
      scores: modelScores,
      winnerModel: winner?.score > 0 ? MODEL_LABELS[winner.model] : '—',
      winnerScore: winner?.score > 0 ? winner.score : 0,
    };
  });

  // Export CSV function
  const handleExport = () => {
    const lines: string[] = [];
    lines.push('=== STUDY PARTICIPANTS ===');
    lines.push('ID,Name,Email,Gender,Profession,Created At');
    participants.forEach((p) =>
      lines.push(`"${p.id}","${p.name}","${p.email}","${p.gender}","${p.profession}","${p.created_at}"`)
    );
    lines.push('');
    lines.push('=== MODEL EVALUATION LEADERBOARD ===');
    lines.push('Rank,Model ID,Model Name,Overall Rating (out of 5)');
    modelStats.forEach((m, idx) =>
      lines.push(`"${idx + 1}","${m.model}","${m.label}","${m.overallAvg}"`)
    );
    lines.push('');
    lines.push('=== RAW RATINGS DATA ===');
    lines.push('Participant ID,Prompt Number,Displayed Position,Actual Model,Metric Name,Rating Value');
    responses.forEach((r) =>
      lines.push(
        `"${r.participant_id}","${r.prompt_number}","${r.displayed_position}","${r.actual_model}","${r.metric_name}","${r.rating}"`
      )
    );

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ai_study_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logs data
  const filteredResponses = responses.filter((r) => {
    const matchSearch = r.participant_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      MODEL_LABELS[r.actual_model].toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.metric_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchModel = modelFilter === '' || r.actual_model === modelFilter;
    const matchPrompt = promptFilter === '' || r.prompt_number === parseInt(promptFilter, 10);
    return matchSearch && matchModel && matchPrompt;
  });

  // Filter participants data
  const filteredParticipants = participants.filter((p) => {
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.profession.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen dashboard-gradient-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" strokeWidth={1.5} />
          <span className="text-[11px] text-[#6B7280] font-medium tracking-wide">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dashboard-gradient-bg text-[#171717] flex flex-col relative overflow-x-hidden hero-mesh">
      
      {/* Subtle mesh + texture via CSS class hero-mesh */}

      {/* Global Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-[#E8E8E6] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 bg-[#2563EB] rounded-[10px] flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[#171717] text-xs sm:text-sm tracking-tight">AI Evaluation Suite</span>
              <span className="text-[9px] sm:text-[10px] text-[#6B7280] font-medium leading-none mt-0.5">Research Analytics</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              className="inline-flex items-center gap-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[10px] sm:text-xs font-medium px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-[10px] transition shadow-sm"
            >
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Export</span>
            </motion.button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-[#6B7280] hover:text-[#171717] bg-white/40 hover:bg-white/60 border border-white/50 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-[10px] transition backdrop-blur-xs"
            >
              <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Subheader Navigation */}
      <div className="bg-white/30 backdrop-blur-md border-b border-white/40 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex gap-1">
            {(['overview', 'responses', 'participants'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchQuery('');
                }}
                className={`relative px-3 sm:px-4 py-3 text-[12px] sm:text-[13px] font-medium capitalize transition-colors rounded-lg ${
                  activeTab === tab ? 'text-[#171717]' : 'text-[#6B7280] hover:text-[#3A3A3A] hover:bg-white/40'
                }`}
              >
                {tab === 'responses' ? 'Responses' : tab === 'participants' ? 'Participants' : 'Overview'}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#2563EB] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-[#6B7280] font-medium shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-[#15803D] animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* Main Grid Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col gap-8 z-10">
        
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* -------------------- SECTION 1: LEADERBOARD HERO COMPONENT -------------------- */}
              {/* -------------------- SECTION 1: LEADERBOARD HERO COMPONENT -------------------- */}
              <div 
                className="rounded-[28px] border p-6 md:p-8 flex flex-col gap-8 relative overflow-hidden transition-all duration-300 bg-white/60 backdrop-blur-3xl"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                  boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.9), 0 16px 36px rgba(0,0,0,0.03)',
                }}
              >
                {/* Subtle Mesh Lighting (opacity below 8%) */}
                <div 
                  className="absolute inset-0 pointer-events-none z-0 opacity-[0.06]"
                  style={{
                    backgroundImage: `
                      radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.3) 0px, transparent 50%),
                      radial-gradient(at 100% 0%, rgba(37, 99, 235, 0.25) 0px, transparent 50%),
                      radial-gradient(at 50% 100%, rgba(244, 63, 94, 0.15) 0px, transparent 50%)
                    `,
                  }}
                />

                {/* Large soft radial spotlight centered behind Rank 1 (left side in lg screens) */}
                <div 
                  className="absolute bottom-[-10%] left-[25%] -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none z-0 hidden lg:block"
                  style={{
                    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.16) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(250, 250, 248, 0) 70%)',
                    filter: 'blur(60px)',
                  }}
                />
                
                {/* Mobile Spotlight (centered) */}
                <div 
                  className="absolute bottom-[25%] left-1/2 -translate-x-1/2 w-[380px] h-[380px] rounded-full pointer-events-none z-0 lg:hidden"
                  style={{
                    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.16) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(250, 250, 248, 0) 70%)',
                    filter: 'blur(45px)',
                  }}
                />

                {/* Elegant floating circles, rings and diamonds */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                  {[
                    { top: '8%', left: '8%', type: 'ring', size: 24 },
                    { top: '15%', left: '92%', type: 'circle', size: 10 },
                    { top: '30%', left: '88%', type: 'diamond', size: 14 },
                    { top: '48%', left: '5%', type: 'ring', size: 32 },
                    { top: '75%', left: '94%', type: 'circle', size: 8 },
                    { top: '85%', left: '12%', type: 'diamond', size: 12 },
                    { top: '12%', left: '45%', type: 'ring', size: 28 },
                    { top: '65%', left: '40%', type: 'circle', size: 8 },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -12, 0], rotate: item.type === 'diamond' ? [45, 75, 45] : [0, 360] }}
                      transition={{ duration: 8 + (i % 3) * 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute"
                      style={{
                        top: item.top,
                        left: item.left,
                        width: item.size,
                        height: item.size,
                      }}
                    >
                      {item.type === 'circle' && (
                        <div className="w-full h-full rounded-full bg-zinc-400/10 border border-zinc-400/20" />
                      )}
                      {item.type === 'ring' && (
                        <div className="w-full h-full rounded-full border-[1.5px] border-zinc-400/20 bg-transparent" />
                      )}
                      {item.type === 'diamond' && (
                        <div className="w-full h-full bg-zinc-400/8 border border-zinc-400/20 rounded-[3px]" style={{ transform: 'rotate(45deg)' }} />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-200/50 pb-4 z-10 relative">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-[#2563EB]" />
                      <h2 className="text-[16px] font-bold text-[#171717] tracking-tight">Model Leaderboard</h2>
                    </div>
                    <p className="text-[12px] text-[#6B7280]">
                      Rankings from blind participant evaluations across all metrics.
                    </p>
                  </div>
                  
                  <div className="inline-flex items-center gap-1.5 bg-[#F4F4F2]/80 border border-[#E8E8E6] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#3A3A3A] backdrop-blur-xs">
                    <Activity className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span>{responses.length} Reviews</span>
                  </div>
                </div>

                {/* Grid Wrapper for Podium and Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch z-10 relative">
                                 {/* Podium Stage Container (6 cols) */}
                  <div 
                    className="lg:col-span-6 flex items-end justify-center gap-1.5 xs:gap-2 sm:gap-6 min-h-[380px] sm:min-h-[480px] rounded-[24px] border p-4 sm:p-8 pb-8 relative overflow-hidden transition-all duration-300 z-10"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(248, 250, 252, 0.3) 100%)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      borderColor: 'rgba(255, 255, 255, 0.75)',
                      boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.8), 0 12px 32px rgba(0, 0, 0, 0.02)',
                    }}
                  >


                    <div className="flex justify-center items-end gap-1.5 xs:gap-3 sm:gap-5 w-full h-full z-20 relative">
                      {/* 2nd place */}
                      {modelStats[1] && (
                        <div className="flex flex-col items-center w-20 xs:w-24 sm:w-30 md:w-32 lg:w-36 z-10 relative group">
                          <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.1 }}
                            className="w-full flex flex-col items-center relative"
                          >
                            <div className="w-11 h-11 xs:w-13 xs:h-13 sm:w-16 sm:h-16 rounded-full glass-logo-badge flex items-center justify-center absolute -top-5 sm:-top-8 z-20 shadow-md">
                              {getModelLogo(modelStats[1].model, "w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9")}
                            </div>

                            {/* Podium Block */}
                            <div 
                              className="w-full h-[150px] xs:h-[190px] sm:h-[220px] rounded-t-[22px] sm:rounded-t-[26px] flex flex-col items-center pt-8 sm:pt-11 relative z-10 overflow-hidden"
                              style={{ 
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(241, 245, 249, 0.25) 100%)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                borderTop: '2px solid rgba(255, 255, 255, 0.9)',
                                borderLeft: '1.5px solid rgba(255, 255, 255, 0.6)',
                                borderRight: '1px solid rgba(148, 163, 184, 0.15)',
                                borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
                                boxShadow: 'inset 0 1.5px 3px rgba(255, 255, 255, 0.6), 0 8px 24px rgba(148, 163, 184, 0.05)'
                              }}
                            >
                              {/* Silver Core Glow */}
                              <div 
                                className="absolute inset-0 pointer-events-none z-0 opacity-25 mix-blend-screen"
                                style={{
                                  background: 'radial-gradient(circle at 50% 70%, rgba(148, 163, 184, 0.3) 0%, transparent 65%)',
                                }}
                              />

                              {/* Polished Glass Refraction Effect */}
                              <div 
                                className="absolute inset-x-0 top-0 h-[40%] pointer-events-none"
                                style={{
                                  background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
                                }}
                              />
                              <span className="text-[#475569] font-black text-3xl xs:text-4xl sm:text-5xl drop-shadow-sm mb-0.5 leading-none z-10">2</span>
                              <span className="text-[11px] xs:text-[13px] sm:text-[15px] font-bold text-[#475569] text-center px-1.5 xs:px-2.5 mt-0.5 leading-snug z-10">{modelStats[1].label}</span>
                              <div className="flex items-center gap-1 mt-1.5 shrink-0 z-10">
                                <span className="text-[#3B82F6] font-black text-xs xs:text-sm sm:text-base">{modelStats[1].overallAvg.toFixed(2)}</span>
                                <Star className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-[#3B82F6] fill-[#3B82F6]" />
                              </div>
                            </div>
                            
                            {/* Premium Glass Base Plate */}
                            <div 
                              className="w-[108%] h-1.5 rounded-full z-10 -mt-1"
                              style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.3) 100%)',
                                border: '1px solid rgba(203, 213, 225, 0.7)',
                                boxShadow: '0 4px 10px rgba(148, 163, 184, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
                              }}
                            />

                          </motion.div>
                        </div>
                      )}

                      {/* 1st place */}
                      {modelStats[0] && (
                        <div className="flex flex-col items-center w-24 xs:w-28 sm:w-36 md:w-40 lg:w-44 z-20 relative group">
                          <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                            className="w-full flex flex-col items-center relative"
                          >
                            <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 rounded-full glass-logo-badge flex items-center justify-center absolute -top-6 sm:-top-10 z-20 shadow-lg">
                              {getModelLogo(modelStats[0].model, "w-8 h-8 xs:w-9 xs:h-9 sm:w-12 sm:h-12")}
                            </div>

                            {/* Podium Block */}
                            <div 
                              className="w-full h-[200px] xs:h-[250px] sm:h-[300px] rounded-t-[24px] sm:rounded-t-[28px] flex flex-col items-center pt-10 sm:pt-14 relative z-10 overflow-hidden"
                              style={{ 
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(79, 70, 229, 0.12) 100%)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                borderTop: '2px solid rgba(165, 180, 252, 0.7)',
                                borderLeft: '1.5px solid rgba(165, 180, 252, 0.4)',
                                borderRight: '1px solid rgba(79, 70, 229, 0.15)',
                                borderBottom: '1px solid rgba(79, 70, 229, 0.2)',
                                boxShadow: 'inset 0 1.5px 3px rgba(255, 255, 255, 0.4), 0 12px 28px rgba(79, 70, 229, 0.08)'
                              }}
                            >
                              {/* Indigo/Blue Core Glow */}
                              <div 
                                className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen"
                                style={{
                                  background: 'radial-gradient(circle at 50% 70%, rgba(99, 102, 241, 0.45) 0%, transparent 65%)',
                                }}
                              />

                              {/* Polished Glass Refraction Effect */}
                              <div 
                                className="absolute inset-x-0 top-0 h-[40%] pointer-events-none"
                                style={{
                                  background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
                                }}
                              />
                              <span className="text-[#4F46E5] font-black text-5xl xs:text-6xl sm:text-7xl drop-shadow-sm mb-0.5 leading-none z-10">1</span>
                              <span className="text-[12px] xs:text-[14px] sm:text-[16px] font-bold text-[#3730A3] text-center px-1.5 xs:px-2.5 mt-1 sm:mt-2 leading-snug z-10">{modelStats[0].label}</span>
                              <div className="flex items-center gap-1 mt-1.5 shrink-0 z-10">
                                <span className="text-[#4F46E5] font-black text-sm xs:text-base sm:text-lg drop-shadow-sm">{modelStats[0].overallAvg.toFixed(2)}</span>
                                <Star className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-[#F59E0B] fill-[#F59E0B] drop-shadow-sm" />
                              </div>
                            </div>
                            
                            {/* Premium Glass Base Plate */}
                            <div 
                              className="w-[108%] h-1.5 rounded-full z-10 -mt-1"
                              style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.3) 100%)',
                                border: '1px solid rgba(165, 180, 252, 0.6)',
                                boxShadow: '0 6px 15px rgba(99, 102, 241, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
                              }}
                            />

                          </motion.div>
                        </div>
                      )}

                      {/* 3rd place */}
                      {modelStats[2] && (
                        <div className="flex flex-col items-center w-20 xs:w-24 sm:w-30 md:w-32 lg:w-36 z-10 relative group">
                          <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.2 }}
                            className="w-full flex flex-col items-center relative"
                          >
                            <div className="w-11 h-11 xs:w-13 xs:h-13 sm:w-16 sm:h-16 rounded-full glass-logo-badge flex items-center justify-center absolute -top-5 sm:-top-8 z-20 shadow-md">
                              {getModelLogo(modelStats[2].model, "w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9")}
                            </div>

                            {/* Podium Block */}
                            <div 
                              className="w-full h-[120px] xs:h-[150px] sm:h-[170px] rounded-t-[20px] sm:rounded-t-[24px] flex flex-col items-center pt-8 sm:pt-11 relative z-10 overflow-hidden"
                              style={{ 
                                background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.22) 0%, rgba(251, 191, 36, 0.06) 100%)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                borderTop: '2px solid rgba(252, 211, 77, 0.6)',
                                borderLeft: '1.5px solid rgba(252, 211, 77, 0.4)',
                                borderRight: '1px solid rgba(217, 119, 6, 0.15)',
                                borderBottom: '1px solid rgba(217, 119, 6, 0.2)',
                                boxShadow: 'inset 0 1.5px 3px rgba(255, 255, 255, 0.5), 0 8px 24px rgba(217, 119, 6, 0.06)'
                              }}
                            >
                              {/* Amber/Bronze Core Glow */}
                              <div 
                                className="absolute inset-0 pointer-events-none z-0 opacity-30 mix-blend-screen"
                                style={{
                                  background: 'radial-gradient(circle at 50% 70%, rgba(251, 191, 36, 0.35) 0%, transparent 65%)',
                                }}
                              />

                              {/* Polished Glass Refraction Effect */}
                              <div 
                                className="absolute inset-x-0 top-0 h-[40%] pointer-events-none"
                                style={{
                                  background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
                                }}
                              />
                              <span className="text-[#9A3412] font-black text-3xl xs:text-4xl sm:text-5xl drop-shadow-sm mb-0.5 leading-none z-10">3</span>
                              <span className="text-[11px] xs:text-[13px] sm:text-[15px] font-bold text-[#9A3412] text-center px-1.5 xs:px-2.5 mt-0.5 leading-snug z-10">{modelStats[2].label}</span>
                              <div className="flex items-center gap-1 mt-1.5 shrink-0 z-10">
                                <span className="text-[#9A3412] font-black text-xs xs:text-sm sm:text-base">{modelStats[2].overallAvg.toFixed(2)}</span>
                                <Star className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-[#EA580C] fill-[#EA580C]" />
                              </div>
                            </div>
                            
                            {/* Premium Glass Base Plate */}
                            <div 
                              className="w-[108%] h-1.5 rounded-full z-10 -mt-1"
                              style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.3) 100%)',
                                border: '1px solid rgba(253, 230, 138, 0.6)',
                                boxShadow: '0 4px 10px rgba(217, 119, 6, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
                              }}
                            />

                          </motion.div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Model breakdown with metrics summaries (6 cols) */}
                  <div className="lg:col-span-6 flex flex-col justify-between gap-4">
                    <div className="space-y-4 h-full flex flex-col">
                      <div className="flex items-center justify-between border-b border-zinc-200/50 pb-3">
                        <span className="text-xs font-bold text-[#4B5563] tracking-wider uppercase">Performance Breakdown</span>
                      </div>
                      <div className="flex flex-col gap-4 h-full justify-between">
                        {modelStats.map((stat, idx) => {
                          const isWinner = idx === 0;
                          return (
                            <div key={stat.model} className="bg-white/50 border border-white/60 backdrop-blur-md rounded-[16px] p-5 flex flex-col gap-3.5 shadow-xs hover:shadow-sm transition-all duration-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3.5">
                                  <span className={`w-8 h-8 rounded-[10px] flex items-center justify-center text-sm font-bold ${
                                    isWinner ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-white/40 border border-white/50 text-[#4B5563]'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  {getModelLogo(stat.model, "w-6 h-6")}
                                  <span className="font-bold text-[#171717] text-lg">{stat.label}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/50">
                                  <span className="font-black text-[#171717] text-lg">{stat.overallAvg.toFixed(2)}</span>
                                  <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Avg</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 pt-4 border-t border-zinc-200/40 text-sm mt-1.5">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className="text-[#15803D] font-bold shrink-0">↑ Strength:</span>
                                  <span className="text-[#3A3A3A] font-semibold truncate">{stat.bestMetric}</span>
                                </div>
                                <div className="hidden sm:block w-px h-5 bg-zinc-200/55" />
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className="text-[#DC2626] font-bold shrink-0">↓ Weakest:</span>
                                  <span className="text-[#3A3A3A] font-semibold truncate">{stat.worstMetric}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* -------------------- SECTION 2: RICH INSIGHT CARDS (KPIs) -------------------- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Insight Card 1 */}
                <div className="glass-card rounded-[18px] p-5 flex flex-col justify-between min-h-[150px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-[#6B7280] flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#6B7280]" />
                      Participants
                    </span>
                    <span className="text-[10px] bg-[#EFF6FF] border border-[#DBEAFE] px-2 py-0.5 rounded-full font-medium text-[#2563EB]">
                      Cohort
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-[28px] font-bold tracking-tight text-[#171717]">{participants.length}</div>
                    <p className="text-[12px] text-[#6B7280] mt-1">
                      Completed: <span className="text-[#171717] font-medium">{completed}</span> ({completionRate}%)
                    </p>
                  </div>
                  <div className="pt-3 border-t border-zinc-200/50 mt-3 flex items-center justify-between text-[11px] text-[#9CA3AF]">
                    <span>Active: {participants.length - completed}</span>
                    <span>~9.2s avg latency</span>
                  </div>
                </div>

                {/* Insight Card 2 */}
                <div className="glass-card rounded-[18px] p-5 flex flex-col justify-between min-h-[150px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-[#6B7280] flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-[#6B7280]" />
                      Responses
                    </span>
                    <span className="text-[10px] bg-[#F0FDF4] border border-emerald-100 px-2 py-0.5 rounded-full font-medium text-[#15803D]">
                      Live
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-[28px] font-bold tracking-tight text-[#171717]">{responses.length}</div>
                    <p className="text-[12px] text-[#6B7280] mt-1">
                      Avg <span className="text-[#171717] font-medium">{(responses.length / (participants.length || 1)).toFixed(1)}</span> ratings per participant
                    </p>
                  </div>
                  <div className="pt-3 border-t border-zinc-200/50 mt-3 flex items-center justify-between text-[11px] text-[#9CA3AF]">
                    <span>Target: {participants.length * TOTAL_PER_P}</span>
                    <span>PostgreSQL</span>
                  </div>
                </div>

                {/* Insight Card 3 */}
                <div className="glass-card rounded-[18px] p-5 flex flex-col justify-between min-h-[150px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-[#6B7280] flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#6B7280]" />
                      Quality Index
                    </span>
                    <span className="text-[10px] bg-[#FFFBEB] border border-amber-100 px-2 py-0.5 rounded-full font-medium text-[#D97706]">
                      Avg Score
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-[28px] font-bold tracking-tight text-[#171717]">{overallAvgAll} <span className="text-[13px] text-[#9CA3AF] font-normal">/ 5</span></div>
                    <p className="text-[12px] text-[#6B7280] mt-1">
                      Top model: <span className="text-[#171717] font-medium">{modelStats[0]?.label || 'N/A'}</span> ({modelStats[0]?.overallAvg.toFixed(2)})
                    </p>
                  </div>
                  <div className="pt-3 border-t border-zinc-200/50 mt-3 flex items-center justify-between text-[11px] text-[#9CA3AF]">
                    <span>Lowest: {modelStats[modelStats.length - 1]?.label || 'N/A'}</span>
                    <span>98% confidence</span>
                  </div>
                </div>

              </div>

              {/* -------------------- SECTION 3: ANALYTICS CHARTS (Bar & Radar) -------------------- */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Bar Chart */}
                <div className="lg:col-span-7 glass-card rounded-[18px] p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-zinc-200/50 pb-4">
                    <div>
                      <h3 className="text-[13px] font-semibold text-[#171717]">Performance by Prompt</h3>
                      <p className="text-[12px] text-[#6B7280] mt-0.5">Average score per model (P1–P6)</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {modelStats.map((stat) => (
                        <div key={stat.model} className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-[#3A3A3A]">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: MODEL_COLORS[stat.model] }} />
                          <span>{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-72 w-full">
                    {responses.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-zinc-400 text-xs">No chart data available.</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={promptBarData} barGap={5} margin={{ left: -25, right: 10, top: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontWeight: 600 }} />
                          <YAxis axisLine={false} tickLine={false} domain={[0, 5]} tick={{ fontSize: 10, fill: '#71717a', fontWeight: 600 }} />
                          <Tooltip
                            cursor={{ fill: 'rgba(244, 244, 245, 0.5)' }}
                            contentStyle={{
                              backgroundColor: '#fff',
                              borderRadius: '12px',
                              border: '1px solid #e4e4e7',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#18181b',
                            }}
                          />
                          {MODELS.map((m) => (
                            <Bar
                               key={m}
                               dataKey={MODEL_LABELS[m]}
                               fill={MODEL_COLORS[m]}
                               radius={[4, 4, 0, 0]}
                               maxBarSize={20}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="lg:col-span-5 glass-card rounded-[18px] p-5 flex flex-col gap-4">
                  <div className="border-b border-zinc-200/50 pb-4">
                    <h3 className="text-[13px] font-semibold text-[#171717]">Criteria Radar</h3>
                    <p className="text-[12px] text-[#6B7280] mt-0.5">Scores across seven evaluation dimensions</p>
                  </div>
                  
                  <div className="w-full h-72 flex items-center justify-center">
                    {responses.length === 0 ? (
                      <div className="text-zinc-400 text-xs">No radar data available.</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius={75} data={modelStats[0]?.metricAvgs || []}>
                          <PolarGrid stroke="#f1f5f9" />
                          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 8.5, fill: '#71717a', fontWeight: 600 }} />
                          <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                          {modelStats.map((stat, idx) => (
                            <Radar
                              key={stat.model}
                              name={stat.label}
                              dataKey={(d) => {
                                // Dynamically fetch values for each model matching this metric
                                const target = modelStats.find(x => x.model === stat.model);
                                return target?.metricAvgs.find(m => m.metric === d.metric)?.value ?? 0;
                              }}
                              stroke={MODEL_COLORS[stat.model]}
                              fill={MODEL_COLORS[stat.model]}
                              fillOpacity={idx === 0 ? 0.08 : 0.02}
                            />
                          ))}
                        </RadarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </div>

              {/* -------------------- SECTION 4: REGIONAL LANGUAGE PERFORMANCE MATRIX -------------------- */}
              <div className="glass-card rounded-[18px] p-5 flex flex-col gap-5">
                <div className="flex items-center gap-2 border-b border-zinc-200/50 pb-4">
                  <Globe2 className="w-4 h-4 text-[#6B7280]" />
                  <div>
                    <h3 className="text-[13px] font-semibold text-[#171717]">Regional Language Performance</h3>
                    <p className="text-[12px] text-[#6B7280] mt-0.5">Performance by prompt language variant</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {languagePerformance.map((lp) => (
                    <div key={lp.promptId} className="bg-white/40 border border-white/50 backdrop-blur-sm rounded-[14px] p-3.5 flex flex-col justify-between gap-3 hover:border-white/70 transition-all">
                      <div className="space-y-1">
                        <div className="text-[10px] font-medium text-[#9CA3AF]">Prompt {lp.promptId}</div>
                        <h4 className="text-[12px] font-semibold text-[#171717] leading-snug">{lp.language}</h4>
                      </div>
                      
                      <div className="border-t border-zinc-200/40 pt-2.5 space-y-1">
                        <div className="text-[10px] font-medium text-[#9CA3AF]">Best Model</div>
                        <div className="flex items-center justify-between text-[12px] font-medium">
                          <span className="text-[#2563EB]">{lp.winnerModel}</span>
                          <span className="text-[#171717] font-semibold bg-white/40 border border-white/50 px-1.5 py-0.5 rounded text-[10px]">
                            {lp.winnerScore.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* -------------------- SECTION 5: METRIC MATRIX TABLE -------------------- */}
              <div className="glass-card rounded-[18px] overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-200/50 flex items-center justify-between">
                  <div>
                    <h2 className="text-[13px] font-semibold text-[#171717]">Metric Matrix</h2>
                    <p className="text-[12px] text-[#6B7280] mt-0.5">Score per model by evaluation dimension</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-white/40 backdrop-blur-xs border-b border-zinc-200/50">
                        <th className="text-left px-5 py-3 text-[#6B7280] font-medium">Dimension</th>
                        {modelStats.map(({ label, model }) => (
                          <th key={model} className="text-center px-4 py-3 text-[#6B7280] font-medium w-36">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/40">
                      {METRICS.map((metric) => {
                        const vals = modelStats.map(
                          ({ metricAvgs }) => metricAvgs.find((m) => m.metric === metric.label)?.value ?? 0
                        );
                        const best = Math.max(...vals);
                        return (
                          <tr key={metric.key} className="hover:bg-slate-50/40 transition">
                            <td className="px-6 py-4">
                              <div className="space-y-0.5">
                                <span className="font-extrabold text-zinc-800">{metric.label}</span>
                                <p className="text-[10px] text-zinc-400 font-normal leading-relaxed">{metric.description}</p>
                              </div>
                            </td>
                            {modelStats.map(({ model }, idx) => {
                              const v = vals[idx];
                              const isBest = v === best && v > 0;
                              return (
                                <td key={model} className="px-4 py-4 text-center">
                                  {v ? (
                                    <span
                                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border transition ${
                                        isBest
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 font-black shadow-xs'
                                          : 'text-zinc-500 bg-zinc-50 border-zinc-100'
                                      }`}
                                    >
                                      {v.toFixed(2)}
                                    </span>
                                  ) : (
                                    <span className="text-zinc-300">—</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* -------------------- SECTION 6: PROMPTS USED -------------------- */}
              <div className="glass-card rounded-[18px] p-6 flex flex-col gap-5 mt-6">
                <div className="flex items-center gap-2 border-b border-zinc-200/50 pb-4">
                  <FileText className="w-4 h-4 text-[#6B7280]" />
                  <div>
                    <h3 className="text-base font-semibold text-[#171717]">Evaluation Prompts</h3>
                    <p className="text-sm text-[#6B7280] mt-0.5">The six system prompts evaluated by participants</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prompts.map((p) => (
                    <div key={p.id} className="bg-white/40 border border-white/50 backdrop-blur-sm rounded-[14px] p-5 flex flex-col justify-between gap-4 hover:border-white/70 transition-all">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#DBEAFE] px-2.5 py-0.5 rounded-full">
                            Prompt {p.id}
                          </span>
                          <span className="text-[11px] font-semibold text-[#6B7280] bg-white/40 border border-white/50 px-2.5 py-0.5 rounded-full">
                            {LANGUAGE_MAP[p.id]}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#171717]">{p.title}</h4>
                        <p className="text-[13px] text-[#3A3A3A] leading-relaxed italic bg-white/40 backdrop-blur-xs p-3 rounded-lg border border-white/50">
                          "{p.text}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === 'responses' && (
            <motion.div
              key="responses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Logs Search & Filters bar */}
              <div className="glass-card rounded-[20px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs by ID, model, metric..."
                    className="w-full border border-white/50 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-900 outline-none transition bg-white/40 backdrop-blur-xs focus:border-zinc-450 focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400"
                  />
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter:</span>
                  </div>
                  
                  <select
                    value={modelFilter}
                    onChange={(e) => setModelFilter(e.target.value)}
                    className="border border-white/50 rounded-lg text-xs font-semibold text-zinc-700 bg-white/40 backdrop-blur-xs px-2.5 py-1.5 outline-none focus:border-zinc-400"
                  >
                    <option value="">All Models</option>
                    {MODELS.map((m) => (
                      <option key={m} value={m}>{MODEL_LABELS[m]}</option>
                    ))}
                  </select>

                  <select
                    value={promptFilter}
                    onChange={(e) => setPromptFilter(e.target.value)}
                    className="border border-white/50 rounded-lg text-xs font-semibold text-zinc-700 bg-white/40 backdrop-blur-xs px-2.5 py-1.5 outline-none focus:border-zinc-400"
                  >
                    <option value="">All Prompts</option>
                    {prompts.map((p) => (
                      <option key={p.id} value={p.id}>Prompt {p.id}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Logs Table */}
              <div className="glass-card rounded-[20px] overflow-hidden">
                <div className="p-6 border-b border-zinc-200/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Ratings Logs ({filteredResponses.length})</h2>
                  </div>
                </div>
                
                <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-white/40 backdrop-blur-xs border-b border-zinc-200/50 sticky top-0 z-10">
                        <th className="text-left px-6 py-3.5 text-zinc-400 font-bold uppercase tracking-wider">Participant ID</th>
                        <th className="text-center px-4 py-3.5 text-zinc-400 font-bold uppercase tracking-wider">Prompt</th>
                        <th className="text-center px-4 py-3.5 text-zinc-400 font-bold uppercase tracking-wider">Displayed Poster</th>
                        <th className="text-left px-4 py-3.5 text-zinc-400 font-bold uppercase tracking-wider">Model Name</th>
                        <th className="text-left px-4 py-3.5 text-zinc-400 font-bold uppercase tracking-wider">Metric</th>
                        <th className="text-center px-4 py-3.5 text-zinc-400 font-bold uppercase tracking-wider w-24">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredResponses.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-zinc-400">No matching logs found.</td>
                        </tr>
                      ) : (
                        filteredResponses.map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/30 transition">
                            <td className="px-6 py-3.5 font-mono text-[10px] text-zinc-500">{r.participant_id}</td>
                            <td className="px-4 py-3.5 text-center font-bold text-zinc-800">P{r.prompt_number}</td>
                            <td className="px-4 py-3.5 text-center text-zinc-500">Poster {r.displayed_position}</td>
                            <td className="px-4 py-3.5 font-bold text-zinc-700">{MODEL_LABELS[r.actual_model]}</td>
                            <td className="px-4 py-3.5 text-zinc-600 font-semibold">{METRICS.find((m) => m.key === r.metric_name)?.label || r.metric_name}</td>
                            <td className="px-4 py-3.5 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-xs bg-slate-50 text-zinc-800 border border-zinc-200">
                                <span>{r.rating}</span>
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" strokeWidth={1} />
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'participants' && (
            <motion.div
              key="participants"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Demographics & Directory Filter bar */}
              <div className="glass-card rounded-[20px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cohort by name, email, profession..."
                    className="w-full border border-white/50 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-900 outline-none transition bg-white/40 backdrop-blur-xs focus:border-zinc-450 focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400"
                  />
                </div>
                
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Cohort size: {filteredParticipants.length} logs
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Gender Demographics chart (1 col) */}
                <div className="glass-card rounded-[20px] p-6 flex flex-col items-center col-span-1">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest self-start mb-6">
                    Participant Gender
                  </h3>
                  {genderData.length > 0 ? (
                    <div className="w-full flex justify-center h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={genderData}
                            cx="50%"
                            cy="50%"
                            outerRadius={65}
                            dataKey="value"
                            label={({ name, percent }: { name?: string; percent?: number }) =>
                              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                            }
                            fontSize={9}
                            fontWeight={600}
                            fill="#8884d8"
                          >
                            {genderData.map((_, i) => (
                              <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-zinc-400 text-xs py-10">No demographics data available.</p>
                  )}
                </div>

                {/* Cohort logs table (2 cols) */}
                <div className="glass-card rounded-[20px] overflow-hidden col-span-1 lg:col-span-2">
                  <div className="p-6 border-b border-zinc-200/50">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      Cohort Logs Directory ({filteredParticipants.length})
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-white/40 backdrop-blur-xs border-b border-zinc-200/50">
                          <th className="text-left px-6 py-3.5 text-zinc-400 font-bold uppercase tracking-wider">Name</th>
                          <th className="text-left px-4 py-3.5 text-zinc-400 font-bold uppercase tracking-wider">Email</th>
                          <th className="text-left px-4 py-3.5 text-zinc-400 font-bold uppercase tracking-wider">Profession</th>
                          <th className="text-center px-4 py-3.5 text-zinc-400 font-bold uppercase tracking-wider w-36">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200/40">
                        {filteredParticipants.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-12 text-zinc-400">No participants match search criteria.</td>
                          </tr>
                        ) : (
                          filteredParticipants.map((p) => {
                            const pRatings = responses.filter((r) => r.participant_id === p.id).length;
                            const isDone = pRatings >= TOTAL_PER_P;
                            return (
                              <tr key={p.id} className="hover:bg-white/30 transition">
                                <td className="px-6 py-3.5 font-bold text-zinc-800">{p.name}</td>
                                <td className="px-4 py-3.5 text-zinc-500">{p.email}</td>
                                <td className="px-4 py-3.5 text-zinc-500">{p.profession}</td>
                                <td className="px-4 py-3.5 text-center">
                                  <span
                                    className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                                      isDone
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        : 'bg-zinc-100 text-zinc-450 border-zinc-200'
                                    }`}
                                  >
                                    {isDone ? 'Completed' : `${pRatings}/${TOTAL_PER_P} rated`}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
