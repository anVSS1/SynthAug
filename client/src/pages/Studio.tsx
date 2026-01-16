import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore, ProjectStatus } from '../store/useProjectStore';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import Terminal from '../components/Terminal';
import ProgressVisualization from '../components/ProgressVisualization';
import { UploadCloud, Settings, Download, Loader, Server, CheckCircle, Zap, AlertCircle, Clock, Sparkles, ArrowLeft, Edit2, Check, X, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const statusConfig: { [key in ProjectStatus]: { icon: React.ReactNode; color: string; label: string } } = {
    completed: { icon: <CheckCircle />, color: 'text-green-400', label: 'Completed' },
    training: { icon: <Zap />, color: 'text-yellow-400 animate-pulse', label: 'Training' },
    failed: { icon: <AlertCircle />, color: 'text-red-400', label: 'Failed' },
    uploading: { icon: <UploadCloud />, color: 'text-blue-400 animate-pulse', label: 'Uploading' },
    idle: { icon: <Clock />, color: 'text-gray-400', label: 'Idle' },
};

const Studio = () => {
    const { id: projectId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuthStore.getState();
    const {
        name, status, config, logs, files,
        fetchProject, setStatus, addLog, setFiles, setConfig, setName,
    } = useProjectStore();
    
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');

    useEffect(() => {
        if (projectId) {
            fetchProject(projectId);
        }
    }, [projectId, fetchProject]);
    
    const handleStartEdit = () => {
        setEditedName(name);
        setIsEditingName(true);
    };
    
    const handleSaveName = async () => {
        if (!editedName.trim() || !projectId) return;
        try {
            await api.put(`/projects/${projectId}`, { name: editedName });
            setName(editedName);
            setIsEditingName(false);
        } catch (error) {
            console.error('Error updating name:', error);
            alert('Failed to update project name');
        }
    };
    
    const handleCancelEdit = () => {
        setIsEditingName(false);
        setEditedName('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.endsWith('.zip')) {
                setFiles([file]);
                addLog(`File selected: ${file.name}`);
            } else {
                addLog("Error: Please select a .zip file.");
                setFiles([]);
            }
        }
    };
    
    const handleUpload = async () => {
        if (files.length === 0 || !projectId) return;

        setStatus('uploading');
        addLog(`Starting upload for ${files[0].name}...`);
        const formData = new FormData();
        formData.append('file', files[0]); 

        try {
            const res = await api.post(`/proxy/${projectId}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            addLog(res.data.message || 'Upload successful.');
            setStatus('idle');
        } catch (error: any) {
            addLog(`Error during upload: ${error.message}`);
            setStatus('failed');
        }
    };

    const handleInitiateSequence = async () => {
        if (!projectId) return;
        
        const trainingConfig = { ...config };
        
        addLog('Initiating training sequence...');
        addLog(`Protocol: ${trainingConfig.preset}, Yield: ${trainingConfig.count}`);
        
        try {
            await useProjectStore.getState().startTraining(projectId);
        } catch (error: any) {
             addLog(`Error initiating training: ${error.message}`);
             setStatus('failed');
        }
    };

    const handleDownload = (type: 'generated' | 'merged' = 'generated') => {
        if (!projectId || !token) return;
        addLog(`Preparing ${type === 'merged' ? 'merged' : 'generated'} download...`);
        const downloadUrl = `${api.defaults.baseURL}/proxy/${projectId}/download?type=${type}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `${name || 'project'}_${type}.zip`);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addLog('Download started.');
    };

    const handleConfigChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setConfig({ [name]: name === 'count' ? parseInt(value, 10) : value });
    };

    const isProcessing = status === 'training' || status === 'uploading';
    const isCompleted = status === 'completed';

    if (!name && status !== 'failed') {
        return <div className="flex justify-center items-center h-full"><Loader className="animate-spin text-primary-400" size={48} /></div>
    }
    
    const currentStatusConfig = statusConfig[status] || statusConfig.idle;

    return (
        <div className="h-full flex flex-col">
            <header className="flex-shrink-0 flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm">Back to Projects</span>
                    </button>
                    <div className="w-px h-6 bg-dark-700"></div>
                    {isEditingName ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveName();
                                    if (e.key === 'Escape') handleCancelEdit();
                                }}
                                className="text-2xl font-display font-bold bg-dark-800 border border-primary-500 rounded-lg px-3 py-1 text-gray-200 outline-none"
                                autoFocus
                            />
                            <button onClick={handleSaveName} className="text-green-400 hover:text-green-300">
                                <Check size={20} />
                            </button>
                            <button onClick={handleCancelEdit} className="text-red-400 hover:text-red-300">
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent truncate">{name}</h1>
                            <button
                                onClick={handleStartEdit}
                                className="text-gray-600 hover:text-primary-400 transition-colors"
                                title="Rename project"
                            >
                                <Edit2 size={18} />
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 glass-panel px-4 py-2">
                    <div className={currentStatusConfig.color}>{currentStatusConfig.icon}</div>
                    <span className="text-sm text-gray-300 font-medium capitalize">{currentStatusConfig.label}</span>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow min-h-0">
                {/* Full Width: Progress Visualization */}
                {(status === 'uploading' || status === 'training' || status === 'failed') && (
                    <div className="lg:col-span-12">
                        <ProgressVisualization status={status} />
                    </div>
                )}
                
                {/* Left Column: Data */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3 glass-panel p-5 flex flex-col min-h-0">
                    <h2 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2"><UploadCloud size={20} className="text-primary-400"/> Data Input</h2>
                    <div className="flex-grow border-2 border-dashed border-dark-700 rounded-xl flex flex-col items-center justify-center p-4 hover:border-primary-500 transition-colors bg-dark-800/30">
                        <input type="file" accept=".zip,application/zip,application/x-zip-compressed" onChange={handleFileChange} id="file-upload" className="hidden" disabled={isProcessing} />
                        <label htmlFor="file-upload" className={`cursor-pointer text-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center">
                                <UploadCloud className="text-primary-400" size={24}/>
                            </div>
                            <p className="text-sm font-medium text-gray-300">Click to upload</p>
                            <p className="text-xs text-gray-600">ZIP file only</p>
                        </label>
                    </div>
                    <div className="mt-4">
                        {files.length > 0 && <div className="text-sm text-primary-400 truncate">{files[0].name}</div>}
                    </div>
                    <button onClick={handleUpload} disabled={files.length === 0 || status !== 'idle'} className="mt-4 w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {status === 'uploading' && <Loader size={16} className="animate-spin" />}
                        {status === 'uploading' ? 'Uploading...' : 'Upload File'}
                    </button>
                </motion.div>

                {/* Center Column: Output */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-6 glass-panel min-h-0">
                   {status === 'idle' && logs.length < 2 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                           <div className="w-16 h-16 mb-4 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-2xl flex items-center justify-center">
                               <Server size={32} className="text-primary-400" />
                           </div>
                           <h3 className="text-lg font-bold text-gray-300">System Ready</h3>
                           <p className="text-sm text-gray-500">Upload data and configure settings to begin</p>
                        </div>
                   ) : (
                        <Terminal />
                   )}
                </motion.div>

                {/* Right Column: Config */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-3 glass-panel p-5 flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2"><Settings size={20} className="text-primary-400"/> Configuration</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Quality Mode</label>
                                <select name="preset" value={config.preset} onChange={handleConfigChange} disabled={isProcessing} className="w-full bg-dark-800/50 border border-dark-700 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition disabled:opacity-50 text-gray-300">
                                    <option value="draft">Draft (Fast)</option>
                                    <option value="studio">Studio (Quality)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Images: <span className="text-primary-400">{config.count}</span></label>
                                <input name="count" type="range" min="50" max="1000" step="50" value={config.count} onChange={handleConfigChange} disabled={isProcessing} className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3 pt-4">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleInitiateSequence}
                            disabled={isProcessing || isCompleted || status === 'failed' || files.length === 0}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Sparkles size={20}/>
                            START TRAINING
                        </motion.button>
                        {isCompleted && (
                            <>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleDownload('generated')}
                                    className="w-full btn-primary flex items-center justify-center gap-2"
                                >
                                    <Download size={20}/>
                                    Generated Only
                                </motion.button>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleDownload('merged')}
                                    className="w-full btn-secondary flex items-center justify-center gap-2"
                                >
                                    <Package size={20}/>
                                    Original + Generated
                                </motion.button>
                            </>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Studio;
