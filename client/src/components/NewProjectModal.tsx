import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const NewProjectModal = ({ isOpen, onClose, onProjectCreated }: { isOpen: boolean, onClose: () => void, onProjectCreated: (project: any) => void }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            setError('Project name is required.');
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const res = await api.post('/projects', { name });
            onProjectCreated(res.data); // Pass new project data back to dashboard
            navigate(`/project/${res.data._id}`); // Navigate to new project
        } catch (err: any) {
            setError(err.response?.data?.errors?.[0]?.msg || 'Failed to create project.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="glass-panel w-full max-w-md p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-display font-bold">
                                <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                                    Create New Project
                                </span>
                            </h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <p className="text-sm text-gray-400 mb-4">
                                Give your project a name to get started.
                            </p>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., 'Soda Bottles Dataset'"
                                className="w-full bg-dark-800/50 border border-dark-700 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition placeholder:text-gray-600"
                                disabled={loading}
                            />
                            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="btn-primary disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading && <Loader2 size={16} className="animate-spin" />}
                                    {loading ? 'Creating...' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NewProjectModal;

