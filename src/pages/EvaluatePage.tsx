import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Loader2, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { prompts, METRICS, MODELS } from '@/data/prompts';
import { supabase } from '@/lib/supabase';
import ImageWithFallback from '@/components/ImageWithFallback';
import NotFoundPage from './NotFoundPage';

// Deterministic shuffle: same seed → same order, so navigating back keeps order
function seededShuffle(arr: string[], seed: string): string[] {
  const a = [...arr];
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  for (let i = a.length - 1; i > 0; i--) {
    h = (Math.imul(h, 1664525) + 1013904223) | 0;
    const j = Math.abs(h) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className={`transition-colors select-none ${
            star <= (hover || value)
              ? 'text-amber-400'
              : 'text-zinc-200 hover:text-zinc-300'
          }`}
        >
          <Star className="w-5.5 h-5.5 fill-current" strokeWidth={1.5} />
        </motion.button>
      ))}
      {value > 0 && (
        <span className="text-[10px] font-bold bg-white/40 border border-white/50 text-zinc-500 px-2 py-0.5 rounded-full ml-2">
          {value}/5
        </span>
      )}
    </div>
  );
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function EvaluatePage() {
  const { promptId } = useParams<{ promptId: string }>();
  const navigate = useNavigate();
  const promptNumber = parseInt(promptId ?? '1', 10);
  const prompt = prompts.find((p) => p.id === promptNumber);

  const [participantId, setParticipantId] = useState<string | null>(null);
  const [shuffledModels, setShuffledModels] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isVerifying, setIsVerifying] = useState(true);
  const [firstIncompleteId, setFirstIncompleteId] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      if (!prompt) return; // Skips if invalid prompt

      const pid = localStorage.getItem('participantId');
      if (!pid) {
        if (isMounted) navigate('/register', { replace: true });
        return;
      }

      try {
        const { data: allResponses, error } = await supabase
          .rpc('get_participant_responses', { pid });

        if (error) throw error;

        const counts: Record<number, number> = {};
        const currentPromptRatings: Record<string, number> = {};

        if (allResponses) {
          (allResponses as any[]).forEach((r: any) => {
            counts[r.prompt_number] = (counts[r.prompt_number] || 0) + 1;
            if (r.prompt_number === promptNumber) {
              currentPromptRatings[`${r.actual_model}::${r.metric_name}`] = r.rating;
            }
          });
        }

        const TOTAL_PER_PROMPT = MODELS.length * METRICS.length;

        // Find first prompt not yet fully completed — clean array-find approach
        const firstIncomplete = prompts.find((p) => (counts[p.id] || 0) < TOTAL_PER_PROMPT);
        const firstIncompletePromptId = firstIncomplete ? firstIncomplete.id : -1;

        if (isMounted) {
          if (firstIncompletePromptId === -1) {
            navigate('/thankyou', { replace: true });
            return;
          }

          if (promptNumber !== firstIncompletePromptId) {
            navigate(`/evaluate/${firstIncompletePromptId}`, { replace: true });
            return;
          }

          setParticipantId(pid);
          setShuffledModels(seededShuffle(MODELS, `${pid}-${promptNumber}`));
          setRatings(currentPromptRatings);
          setSaveStatus('idle');
          setFirstIncompleteId(firstIncompletePromptId);
          setIsVerifying(false);
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        if (isMounted) setIsVerifying(false);
      }
    }

    setIsVerifying(true);
    initializeSession();

    return () => {
      isMounted = false;
    };
  }, [promptNumber, navigate, prompt]);

  const handleRating = useCallback(
    async (model: string, metric: string, value: number, displayPos: number) => {
      const key = `${model}::${metric}`;
      setRatings((prev) => ({ ...prev, [key]: value }));
      setSaveStatus('saving');
      try {
        const { error } = await supabase.from('responses').upsert(
          [
            {
              participant_id: participantId,
              prompt_number: promptNumber,
              displayed_position: displayPos,
              actual_model: model,
              metric_name: metric,
              rating: value,
            },
          ],
          { onConflict: 'participant_id,prompt_number,actual_model,metric_name' }
        );
        if (error) throw error;
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1500);
      } catch {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    },
    [participantId, promptNumber]
  );

  if (!prompt) {
    return <NotFoundPage />;
  }

  if (isVerifying || !shuffledModels.length || !participantId) {
    return (
      <div className="min-h-screen dashboard-gradient-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  const totalRequired = shuffledModels.length * METRICS.length;
  const totalRated = Object.keys(ratings).length;
  const isComplete = totalRated >= totalRequired;
  const progressPct = Math.round((totalRated / totalRequired) * 100);

  return (
    <div className="min-h-screen pb-24 font-sans dashboard-gradient-bg">
      {/* Sticky Header */}
      <div className="bg-white/40 backdrop-blur-md border-b border-white/50 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          {/* Prompt Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-0.5 hide-scrollbar">
            {prompts.map((p) => {
              const isLocked = p.id > firstIncompleteId;
              return (
                <Link
                  key={p.id}
                  to={isLocked ? '#' : `/evaluate/${p.id}`}
                  onClick={isLocked ? (e) => e.preventDefault() : undefined}
                  aria-disabled={isLocked}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    p.id === promptNumber
                      ? 'bg-zinc-900 text-zinc-50 shadow-sm border border-zinc-950'
                      : isLocked
                      ? 'bg-white/10 text-zinc-300 border border-white/10 cursor-not-allowed'
                      : 'bg-white/30 text-zinc-500 hover:bg-white/50 hover:text-zinc-800 border border-white/20'
                  }`}
                >
                  P{p.id}
                </Link>
              );
            })}
          </div>

          {/* Sync & Progress Status */}
          <div className="flex items-center gap-4 shrink-0 font-medium">
            <AnimatePresence mode="wait">
              {saveStatus !== 'idle' && (
                <motion.span
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className={`text-xs font-bold flex items-center gap-1 ${
                    saveStatus === 'saving' ? 'text-[#2563EB]' : saveStatus === 'error' ? 'text-red-600' : 'text-[#15803D]'
                  }`}
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving</span>
                    </>
                  ) : saveStatus === 'error' ? (
                    <span>Unable to save your rating. Please try again.</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved</span>
                    </>
                  )}
                </motion.span>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2">
              <div className="w-16 bg-white/20 border border-white/40 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ backgroundColor: '#2563EB', width: `${progressPct}%` }}
                />
              </div>
              <span className="text-[10px] font-bold" style={{ color: '#2563EB' }}>{progressPct}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Main Prompt Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/30 backdrop-blur-xs rounded-3xl border border-white/50 shadow-xs p-6 space-y-1.5"
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Prompt {promptNumber} of {prompts.length}
          </div>
          <h2 className="text-xl font-bold text-zinc-900 leading-snug">
            "{prompt.text}"
          </h2>
        </motion.div>

        {/* Poster evaluation cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {shuffledModels.map((model, index) => {
            const displayPos = index + 1;
            const ratedCount = METRICS.filter((m) => ratings[`${model}::${m.key}`]).length;

            return (
              <motion.div
                key={model}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card rounded-[24px] overflow-hidden flex flex-col"
              >
                {/* Poster Image Area */}
                <div className="relative h-[320px] sm:h-[400px] md:h-[440px] bg-white/20 backdrop-blur-xs p-4 sm:p-5 border-b border-white/50 flex items-center justify-center">
                  <div className={`relative h-full max-w-full bg-white/50 backdrop-blur-xs rounded-[16px] p-3 shadow-xs border border-white/50 flex items-center justify-center transition-all duration-300 hover:scale-[1.02] ${
                    model === 'Model_C' ? 'aspect-[768/1376]' : 'aspect-square'
                  }`}>
                    <div className="relative w-full h-full bg-white overflow-hidden rounded-[8px]">
                      <ImageWithFallback
                        model={model}
                        promptNumber={promptNumber}
                        displayPos={displayPos}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 flex items-center justify-center w-7 h-7 rounded-full bg-white/60 border border-white/60 text-zinc-800 font-bold text-xs shadow-xs z-10">
                    {displayPos}
                  </div>
                  <div className="absolute top-4 right-4 z-20 bg-zinc-950/80 backdrop-blur-xs text-zinc-50 shadow-xs text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.2 rounded-full border border-zinc-800">
                    {ratedCount} / {METRICS.length} rated
                  </div>
                </div>

                {/* Star Ratings list */}
                <div className="p-6 divide-y divide-white/40 flex-1 space-y-4">
                  {METRICS.map((metric) => {
                    const key = `${model}::${metric.key}`;
                    return (
                      <div key={metric.key} className="pt-4 first:pt-0 space-y-2">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-zinc-800">{metric.label}</div>
                          <div className="text-[11px] text-zinc-400 leading-relaxed">{metric.description}</div>
                        </div>
                        <StarRating
                          value={ratings[key] ?? 0}
                          onChange={(v) => handleRating(model, metric.key, v, displayPos)}
                        />
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action Navigation Bar */}
        <div className="flex items-center justify-between gap-4 pt-6">
          <Link
            to={promptNumber > 1 ? `/evaluate/${promptNumber - 1}` : '/instructions'}
            className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-xs border border-white/50 text-zinc-600 hover:text-zinc-900 font-bold text-xs px-5 py-3.5 rounded-xl transition shadow-xs hover:bg-white/60"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{promptNumber > 1 ? `Prompt ${promptNumber - 1}` : 'Instructions'}</span>
          </Link>

          {!isComplete && (
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider text-center hidden md:block">
              {totalRequired - totalRated} rating{totalRequired - totalRated !== 1 ? 's' : ''} left for this prompt
            </p>
          )}

          <motion.button
            whileHover={{ y: isComplete ? -1 : 0 }}
            whileTap={{ scale: isComplete ? 0.98 : 1 }}
            type="button"
            disabled={!isComplete}
            onClick={() =>
              navigate(
                promptNumber < prompts.length
                  ? `/evaluate/${promptNumber + 1}`
                  : '/thankyou'
              )
            }
            className="inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-900 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed text-zinc-50 font-bold text-xs px-5 py-3.5 rounded-xl transition shadow-md"
          >
            <span>
              {promptNumber < prompts.length
                ? `Continue to Prompt ${promptNumber + 1}`
                : 'Submit Study'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
