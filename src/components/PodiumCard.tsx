import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

type PodiumCardProps = {
  rank: number;
  modelLabel: string;
  overallAvg: string | number;
  isWinner: boolean;
};

export default function PodiumCard({ rank, modelLabel, overallAvg, isWinner }: PodiumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1, duration: 0.5 }}
      className="flex flex-col items-center"
    >
      <div
        className="flex items-center justify-center w-12 h-12 bg-white"
        style={{
          border: `2px solid var(--border-primary)`,
          borderRadius: '50%',
          backgroundColor: 'var(--surface-2)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Animated rank number */}
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {rank}
        </motion.span>
      </div>
      <div
        className="mt-2 text-center px-4 py-2"
        style={{
          backgroundColor: 'var(--surface-1)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          border: `1px solid var(--border-primary)`,
        }}
      >
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{modelLabel}</h3>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{overallAvg} ★</p>
        {isWinner && (
          <Crown className="mt-1 mx-auto" size={16} color="var(--accent)" strokeWidth={2} />
        )}
      </div>
    </motion.div>
  );
}
