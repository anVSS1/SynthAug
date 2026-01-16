import { motion } from 'framer-motion';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';

interface ProgressVisualizationProps {
  status: 'idle' | 'uploading' | 'training' | 'completed' | 'failed';
  progress?: number;
}

const stages = [
  { key: 'uploading', label: 'Uploading', color: 'from-blue-500 to-blue-600' },
  { key: 'training', label: 'Training', color: 'from-yellow-500 to-orange-500' },
  { key: 'completed', label: 'Completed', color: 'from-green-500 to-emerald-500' },
];

const ProgressVisualization = ({ status, progress = 0 }: ProgressVisualizationProps) => {
  if (status === 'idle') return null;

  const getCurrentStageIndex = () => {
    if (status === 'uploading') return 0;
    if (status === 'training') return 1;
    if (status === 'completed' || status === 'failed') return 2;
    return 0;
  };

  const currentStageIndex = getCurrentStageIndex();
  const isFailed = status === 'failed';

  return (
    <div className="glass-panel p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-6">Processing Pipeline</h3>
      
      {/* Progress Bar */}
      <div className="relative h-2 bg-dark-700 rounded-full mb-8 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ 
            width: isFailed ? '100%' : `${((currentStageIndex + 1) / stages.length) * 100}%` 
          }}
          transition={{ duration: 0.5 }}
          className={`h-full bg-gradient-to-r ${
            isFailed ? 'from-red-500 to-red-600' : stages[currentStageIndex].color
          }`}
        />
      </div>

      {/* Stages */}
      <div className="flex justify-between">
        {stages.map((stage, index) => {
          const isActive = index === currentStageIndex;
          const isCompleted = index < currentStageIndex;
          const isCurrentFailed = isFailed && index === currentStageIndex;

          return (
            <div key={stage.key} className="flex flex-col items-center flex-1">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isActive ? 1.1 : 1 }}
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  isCurrentFailed
                    ? 'bg-red-500'
                    : isCompleted
                    ? 'bg-green-500'
                    : isActive
                    ? `bg-gradient-to-br ${stage.color}`
                    : 'bg-dark-700'
                }`}
              >
                {isCurrentFailed ? (
                  <AlertCircle className="text-white" size={24} />
                ) : isCompleted ? (
                  <CheckCircle className="text-white" size={24} />
                ) : isActive ? (
                  <Loader className="text-white animate-spin" size={24} />
                ) : (
                  <span className="text-gray-500 font-bold">{index + 1}</span>
                )}
              </motion.div>
              <p className={`text-sm font-medium ${
                isActive ? 'text-primary-400' : isCompleted ? 'text-green-400' : 'text-gray-600'
              }`}>
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Status Message */}
      {status === 'training' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-400">
            Training in progress... This may take several minutes
          </p>
          {progress > 0 && (
            <p className="text-xs text-gray-600 mt-1">{progress}% complete</p>
          )}
        </motion.div>
      )}

      {isFailed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
        >
          <p className="text-sm text-red-400 text-center">
            Processing failed. Please check the logs and try again.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ProgressVisualization;
