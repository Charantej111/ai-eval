import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 dashboard-gradient-bg">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full glass-card p-8 md:p-10 text-center flex flex-col justify-between min-h-[520px] rounded-[24px]"
      >
        {/* Header */}
        <div className="space-y-7">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 border border-white/50 rounded-full px-3.5 py-1 text-xs font-medium mx-auto bg-white/40 backdrop-blur-xs text-[#4B5563] shadow-xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#2563EB' }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#2563EB' }}></span>
            </span>
            Research Study · AI Image Evaluation
          </motion.div>

          <div className="space-y-3">
            <h1 className="text-[28px] font-bold tracking-tight leading-tight text-[#171717]">
              Festival Poster <br />
              <span className="text-[#2563EB]">
                Evaluation Study
              </span>
            </h1>
            <p className="text-[14px] max-w-xs mx-auto leading-relaxed text-[#6B7280]">
              Help us evaluate the cultural and linguistic quality of AI-generated festival posters for local Indian businesses.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="my-7 py-5 grid grid-cols-3 gap-4 border-t border-b border-white/50">
          {[
            { val: '6', label: 'Prompts' },
            { val: '3', label: 'Models' },
            { val: '7', label: 'Metrics' },
          ].map((s, i) => (
            <div key={i} className={`space-y-0.5 ${i === 1 ? 'border-l border-r border-white/50' : ''}`}>
              <div className="text-xl font-bold text-[#2563EB]">{s.val}</div>
              <div className="text-[10px] uppercase tracking-wider font-medium text-[#9CA3AF]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/register"
              className="w-full inline-flex items-center justify-center text-white font-medium text-[14px] px-6 py-3 transition-all"
              style={{ backgroundColor: '#2563EB', borderRadius: '12px', boxShadow: '0 1px 3px rgba(37,99,235,0.3)' }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
            >
              Start Evaluation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
          
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#9CA3AF]">
            <Clock className="w-3.5 h-3.5" />
            <span>Takes about 10–15 minutes</span>
          </div>

          <div className="pt-4 flex flex-col gap-2 border-t border-white/50">
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/admin/login"
                className="w-full inline-flex items-center justify-center font-semibold text-[13px] px-6 py-2.5 transition-all border border-white/60 bg-white/40 hover:bg-white/60 backdrop-blur-xs text-[#3A3A3A] rounded-[10px] shadow-xs"
              >
                <Shield className="w-4 h-4 mr-2 text-[#6B7280]" />
                Admin Login
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
