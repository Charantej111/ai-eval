import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { prompts, MODELS, METRICS } from '@/data/prompts';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [profession, setProfession] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmailDuplicate, setIsEmailDuplicate] = useState(false);

  const canContinue =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    gender !== '' &&
    profession.trim().length > 0 &&
    ageConfirmed &&
    consent &&
    !loading;

  // Removed findFirstIncomplete as we no longer resume session using email lookup

  const handleSubmit = async () => {
    if (!canContinue || isEmailDuplicate) return;
    setError('');
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        throw new Error('Please enter a valid email address.');
      }

      // --- Check if email already exists via RPC ---
      const { data: emailExists, error: checkError } = await supabase
        .rpc('check_participant_email', { check_email: normalizedEmail });

      if (checkError) {
        throw new Error('Unable to verify your email. Please try again.');
      }

      if (emailExists) {
        setIsEmailDuplicate(true);
        return;
      }

      // --- New user — create participant ---
      const { data, error: dbError } = await supabase
        .from('participants')
        .insert([{ name: name.trim(), email: normalizedEmail, gender, profession: profession.trim(), consent }])
        .select('id')
        .single();

      if (dbError) {
        if (dbError.code === '23505') {
           setIsEmailDuplicate(true);
           return;
        }
        throw new Error('Registration failed. Please try again.');
      }

      localStorage.setItem('participantId', data.id);
      navigate('/instructions');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '12px',
    color: '#171717',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(4px)',
  };

  const focusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#2563EB';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)';
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
  };

  const blurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 py-12 dashboard-gradient-bg">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full glass-card p-6 md:p-8 space-y-6 rounded-[24px]"
      >
        <div className="space-y-1">
          <h1 className="text-[22px] font-bold tracking-tight text-[#171717]">Get Started</h1>
          <p className="text-[12px] font-medium text-[#2563EB]">
            Step 1 of 3 · Participant Profile
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="reg-name" className="block text-[12px] font-medium mb-1.5 text-[#6B7280]">
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full border px-4 py-2.5 text-sm outline-none transition placeholder:text-[#D1D1CF]"
              style={inputStyle}
              onFocus={focusHandler}
              onBlur={blurHandler}
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-[12px] font-medium mb-1.5 text-[#6B7280]">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full border px-4 py-2.5 text-sm outline-none transition placeholder:text-[#D1D1CF]"
              style={inputStyle}
              onFocus={focusHandler}
              onBlur={blurHandler}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-gender" className="block text-[12px] font-medium mb-1.5 text-[#6B7280]">
                Gender
              </label>
              <select
                id="reg-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border px-3 py-2.5 text-sm outline-none transition bg-white/40 backdrop-blur-xs"
                style={inputStyle}
                onFocus={focusHandler}
                onBlur={blurHandler}
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label htmlFor="reg-profession" className="block text-[12px] font-medium mb-1.5 text-[#6B7280]">
                Profession
              </label>
              <input
                id="reg-profession"
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="e.g. Designer"
                className="w-full border px-4 py-2.5 text-sm outline-none transition placeholder:text-[#D1D1CF]"
                style={inputStyle}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>
          </div>

          {/* Consent */}
          <div className="pt-4 space-y-3 border-t border-white/50">
            <label className="flex items-start gap-3 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded cursor-pointer transition"
                style={{ accentColor: '#2563EB' }}
              />
              <span className="text-xs leading-relaxed group-hover:text-[#3A3A3A] transition text-[#6B7280]">
                I confirm that I am <strong>18 years of age or older</strong>.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 rounded cursor-pointer transition"
                style={{ accentColor: '#2563EB' }}
              />
              <span className="text-xs leading-relaxed group-hover:text-[#3A3A3A] transition text-[#6B7280]">
                I consent to participating in this research study and understand my anonymous ratings will be used for evaluating AI image generation models.
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <AnimatePresence mode="wait">
            {isEmailDuplicate ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col items-center justify-center p-5 space-y-3 text-center bg-emerald-50/80 backdrop-blur-md border border-emerald-200/50 rounded-xl mb-4 overflow-hidden"
              >
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[#15803D] font-medium text-sm leading-relaxed">
                    It looks like you've already participated in this evaluation. Thank you for your valuable contribution!
                  </p>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-xs px-4 py-2.5 font-medium text-red-700 bg-red-50/50 backdrop-blur-xs border border-red-200/50 rounded-xl"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {!canContinue && !error && !isEmailDuplicate && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-center font-medium text-[#9CA3AF]"
            >
              Complete all fields to continue.
            </motion.p>
          )}

          <motion.button
            whileHover={{ y: canContinue && !isEmailDuplicate ? -1 : 0 }}
            whileTap={{ scale: canContinue && !isEmailDuplicate ? 0.98 : 1 }}
            type="button"
            onClick={handleSubmit}
            disabled={!canContinue || isEmailDuplicate}
            className="w-full inline-flex items-center justify-center font-medium text-[14px] py-3 transition-all"
            style={{
              backgroundColor: canContinue && !isEmailDuplicate ? '#2563EB' : '#E8E8E6',
              color: canContinue && !isEmailDuplicate ? '#FFFFFF' : '#9CA3AF',
              borderRadius: '12px',
              cursor: canContinue && !isEmailDuplicate ? 'pointer' : 'not-allowed',
              boxShadow: canContinue && !isEmailDuplicate ? '0 1px 3px rgba(37,99,235,0.3)' : 'none',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <span>Continue to Instructions</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
