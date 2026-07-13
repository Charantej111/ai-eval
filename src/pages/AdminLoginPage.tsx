import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!password) return;
    setLoading(true);
    setError('');

    setTimeout(() => {
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD as string;
      if (password === adminPassword) {
        sessionStorage.setItem('admin_session', 'authenticated');
        navigate('/admin');
      } else {
        setError('Invalid password. Please check and try again.');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 dashboard-gradient-bg">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-sm w-full glass-card p-8 space-y-6 rounded-[24px]"
      >
        <div className="text-center space-y-3">
          <div className="w-11 h-11 rounded-[12px] flex items-center justify-center mx-auto bg-blue-600/10 text-blue-600 border border-blue-200/50 shadow-xs">
            <KeyRound className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#171717]">Admin Console</h1>
          <p className="text-[13px] text-[#6B7280]">
            Enter your credentials to access analytics
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="admin-password"
              className="block text-[12px] font-medium mb-1.5 text-[#6B7280]"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="w-full border px-4 py-2.5 text-sm outline-none transition placeholder:text-[#D1D1CF]"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '12px',
                color: '#171717',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(4px)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2563EB';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
              }}
            />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-xs px-4 py-2.5 font-medium text-red-700 bg-red-50/50 backdrop-blur-xs border border-red-200/50 rounded-xl"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ y: password && !loading ? -1 : 0 }}
            whileTap={{ scale: password && !loading ? 0.98 : 1 }}
            type="button"
            onClick={handleLogin}
            disabled={loading || !password}
            className="w-full inline-flex items-center justify-center text-white font-medium text-[13px] py-3 transition-all"
            style={{
              backgroundColor: loading || !password ? '#E8E8E6' : '#2563EB',
              color: loading || !password ? '#9CA3AF' : '#FFFFFF',
              borderRadius: '12px',
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              boxShadow: loading || !password ? 'none' : '0 1px 3px rgba(37,99,235,0.3)',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authorizing...</span>
              </span>
            ) : (
              'Access Dashboard'
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
