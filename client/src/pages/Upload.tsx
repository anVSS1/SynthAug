import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, Download, Loader, CheckCircle, AlertCircle, Sparkles, Zap } from 'lucide-react';
import api from '../services/api';

const Upload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'failed'>('idle');
    const [progress, setProgress] = useState(0);
    const [imageCount, setImageCount] = useState(500);
    const [quality, setQuality] = useState<'draft' | 'studio'>('draft');
    const [projectId, setProjectId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === 'application/zip' || selectedFile.type === 'application/x-zip-compressed' || selectedFile.name.endsWith('.zip')) {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Please select a .zip file');
                setFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setStatus('uploading');
            setError(null);

            // Create project
            const projectRes = await api.post('/projects', {
                name: file.name.replace('.zip', ''),
                config: { preset: quality, count: imageCount }
            });
            const newProjectId = projectRes.data._id;
            setProjectId(newProjectId);

            // Upload file
            const formData = new FormData();
            formData.append('file', file);
            await api.post(`/proxy/${newProjectId}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setStatus('processing');
            
            // Start training
            await api.post(`/proxy/${newProjectId}/train`);

            // Poll for completion
            const pollInterval = setInterval(async () => {
                try {
                    const statusRes = await api.get(`/projects/${newProjectId}`);
                    const currentStatus = statusRes.data.status;
                    
                    if (currentStatus === 'completed') {
                        setStatus('completed');
                        clearInterval(pollInterval);
                    } else if (currentStatus === 'failed') {
                        setStatus('failed');
                        setError('Processing failed. Please try again.');
                        clearInterval(pollInterval);
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                }
            }, 5000);

        } catch (err: any) {
            setStatus('failed');
            setError(err.response?.data?.msg || 'Upload failed. Please try again.');
        }
    };

    const handleDownload = () => {
        if (!projectId) return;
        const downloadUrl = `${api.defaults.baseURL}/proxy/${projectId}/download`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `augmented_${file?.name || 'dataset.zip'}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReset = () => {
        setFile(null);
        setStatus('idle');
        setProgress(0);
        setProjectId(null);
        setError(null);
    };

    const isProcessing = status === 'uploading' || status === 'processing';

    return (
        <div className="min-h-full flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-block mb-4"
                    >
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <Sparkles className="text-white" size={40} />
                        </div>
                    </motion.div>
                    <h1 className="text-5xl font-display font-bold mb-3">
                        <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                            Dataset Augmentation
                        </span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Upload your dataset and let AI generate synthetic variations
                    </p>
                </div>

                <div className="glass-panel p-8">
                    {status === 'idle' && (
                        <>
                            <div className="border-2 border-dashed border-dark-700 rounded-2xl p-12 text-center hover:border-primary-500 transition-all duration-300 bg-dark-800/30">
                                <input 
                                    type="file" 
                                    accept=".zip" 
                                    onChange={handleFileChange} 
                                    id="file-upload" 
                                    className="hidden" 
                                />
                                <label htmlFor="file-upload" className="cursor-pointer block">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center">
                                        <UploadIcon className="text-primary-400" size={32} />
                                    </div>
                                    <p className="text-lg font-semibold text-gray-200 mb-2">
                                        {file ? file.name : 'Click to upload or drag and drop'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        ZIP file containing your images
                                    </p>
                                </label>
                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                                        Quality Mode
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setQuality('draft')}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                quality === 'draft'
                                                    ? 'border-primary-500 bg-gradient-to-br from-primary-500/20 to-accent-500/20 text-white shadow-lg'
                                                    : 'border-dark-700 text-gray-400 hover:border-dark-600 bg-dark-800/50'
                                            }`}
                                        >
                                            <Zap className="mx-auto mb-2" size={24} />
                                            <div className="font-semibold">Draft</div>
                                            <div className="text-xs opacity-75">Fast processing</div>
                                        </button>
                                        <button
                                            onClick={() => setQuality('studio')}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                quality === 'studio'
                                                    ? 'border-primary-500 bg-gradient-to-br from-primary-500/20 to-accent-500/20 text-white shadow-lg'
                                                    : 'border-dark-700 text-gray-400 hover:border-dark-600 bg-dark-800/50'
                                            }`}
                                        >
                                            <Sparkles className="mx-auto mb-2" size={24} />
                                            <div className="font-semibold">Studio</div>
                                            <div className="text-xs opacity-75">High quality</div>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                                        Generated Images: <span className="text-primary-400">{imageCount}</span>
                                    </label>
                                    <input 
                                        type="range" 
                                        min="50" 
                                        max="1000" 
                                        step="50" 
                                        value={imageCount} 
                                        onChange={(e) => setImageCount(parseInt(e.target.value))}
                                        className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                    />
                                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                                        <span>50</span>
                                        <span>1000</span>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleUpload}
                                disabled={!file}
                                className="w-full mt-8 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Sparkles size={20} />
                                Start Augmentation
                            </motion.button>
                        </>
                    )}

                    {isProcessing && (
                        <div className="text-center py-16">
                            <div className="relative inline-block mb-6">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                <Loader className="relative animate-spin text-primary-400" size={56} />
                            </div>
                            <h3 className="text-2xl font-display font-bold mb-2">
                                <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                                    {status === 'uploading' ? 'Uploading...' : 'Processing...'}
                                </span>
                            </h3>
                            <p className="text-gray-400">
                                {status === 'uploading' 
                                    ? 'Uploading your dataset to the cloud'
                                    : 'AI is generating synthetic images. This may take a few minutes.'
                                }
                            </p>
                        </div>
                    )}

                    {status === 'completed' && (
                        <div className="text-center py-16">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', duration: 0.6 }}
                                className="inline-block mb-6"
                            >
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                    <CheckCircle className="text-white" size={40} />
                                </div>
                            </motion.div>
                            <h3 className="text-2xl font-display font-bold mb-2">
                                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                    Augmentation Complete!
                                </span>
                            </h3>
                            <p className="text-gray-400 mb-8">
                                Your augmented dataset is ready to download
                            </p>
                            <div className="flex gap-4 justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDownload}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Download size={20} />
                                    Download Dataset
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleReset}
                                    className="btn-secondary"
                                >
                                    New Upload
                                </motion.button>
                            </div>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                                <AlertCircle className="text-white" size={40} />
                            </div>
                            <h3 className="text-2xl font-display font-bold mb-2">
                                <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                                    Processing Failed
                                </span>
                            </h3>
                            <p className="text-gray-400 mb-8">
                                {error || 'Something went wrong. Please try again.'}
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleReset}
                                className="btn-primary"
                            >
                                Try Again
                            </motion.button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Upload;
