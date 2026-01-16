import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  projectName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal = ({ isOpen, projectName, onConfirm, onCancel }: DeleteConfirmModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="glass-panel w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="text-red-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-gray-200">
                  Delete Project?
                </h2>
                <p className="text-sm text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-semibold text-primary-400">"{projectName}"</span>? 
              All data associated with this project will be permanently removed.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-all"
              >
                Delete Project
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;
