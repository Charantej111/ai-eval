import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 dashboard-gradient-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full glass-card p-10 md:p-12 text-center flex flex-col items-center space-y-6 rounded-[32px] relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 404 Illustration / Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="w-24 h-24 bg-white/40 backdrop-blur-md rounded-[24px] border border-white/60 shadow-lg flex items-center justify-center relative z-10"
        >
          <Search className="w-10 h-10 text-[#4B5563]" />
          <div className="absolute -top-2 -right-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full border border-red-200/50 shadow-sm">
            404
          </div>
        </motion.div>

        <div className="space-y-3 relative z-10">
          <h1 className="text-3xl font-black text-[#171717] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-[#6B7280] text-[14px] leading-relaxed max-w-[280px] mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
        </div>

        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/')}
          className="mt-4 flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-xl font-medium text-sm shadow-sm transition-all hover:bg-[#1D4ED8] hover:shadow relative z-10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
