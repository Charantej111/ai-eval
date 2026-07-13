import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';

export default function ThankYouPage() {
  // Clear session so the participant can't re-enter the evaluation flow
  useEffect(() => {
    localStorage.removeItem('participantId');
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center p-6 dashboard-gradient-bg">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full glass-card p-8 md:p-10 text-center space-y-6 rounded-[24px]"
      >
        {/* Animated check circle */}
        <div className="relative w-16 h-16 mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-full h-full rounded-full flex items-center justify-center shadow-xs bg-green-50/50 backdrop-blur-xs text-green-700 border border-green-200"
          >
            <Check className="w-8 h-8" strokeWidth={2.5} />
          </motion.div>
        </div>

        <div className="space-y-3">
          <h1 className="text-[22px] font-bold text-[#171717]">Evaluation Completed!</h1>
          <p className="text-[12px] font-medium text-[#2563EB]">
            Thank you for your response
          </p>
          <p className="text-[14px] leading-relaxed pt-2 text-[#6B7280]">
            Your feedback has been saved successfully. Your valuable ratings will directly help build culturally accurate and legible AI generation models for small businesses.
          </p>
        </div>

        <div className="pt-6 flex items-center justify-center gap-1.5 text-xs font-medium border-t border-white/50 text-[#9CA3AF]">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>You may now safely close this window.</span>
        </div>
      </motion.div>
    </div>
  );
}
