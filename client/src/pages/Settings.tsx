import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, BarChart3, Image, Clock, Save, Loader, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Settings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/user/profile');
            setUserData(res.data);
            setFormData({
                username: res.data.username,
                email: res.data.email,
                bio: res.data.profile?.bio || '',
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put('/user/profile', formData);
            await fetchUserData();
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader className="animate-spin text-primary-400" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-primary-400 transition-colors mb-6"
            >
                <ArrowLeft size={20} />
                Back to Dashboard
            </button>
            
            <div className="mb-8">
                <h1 className="text-4xl font-display font-bold mb-2">
                    <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                        Settings
                    </span>
                </h1>
                <p className="text-gray-400">Manage your account and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 glass-panel p-6"
                >
                    <h2 className="text-xl font-semibold text-gray-200 mb-6 flex items-center gap-2">
                        <User size={20} className="text-primary-400" />
                        Profile Information
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full bg-dark-800/50 border border-dark-700 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full bg-dark-800/30 border border-dark-700 rounded-xl p-3 text-gray-500 cursor-not-allowed"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                                    Cannot be changed
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Bio
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                placeholder="Tell us about yourself..."
                                className="w-full bg-dark-800/50 border border-dark-700 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-200 resize-none"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader size={20} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Save Changes
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    {/* Account Info */}
                    <div className="glass-panel p-6">
                        <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                            <Mail size={20} className="text-primary-400" />
                            Account
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Calendar size={16} />
                                <span>Joined {new Date(userData?.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${userData?.subscription?.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                                <span className="text-gray-300 capitalize">{userData?.subscription?.plan || 'Free'} Plan</span>
                            </div>
                        </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="glass-panel p-6">
                        <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                            <BarChart3 size={20} className="text-primary-400" />
                            Usage Stats
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-400 flex items-center gap-2">
                                        <Image size={16} />
                                        Total Projects
                                    </span>
                                    <span className="text-lg font-bold text-primary-400">
                                        {userData?.stats?.totalProjects || 0}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-400 flex items-center gap-2">
                                        <Image size={16} />
                                        Images Generated
                                    </span>
                                    <span className="text-lg font-bold text-accent-400">
                                        {userData?.stats?.totalImagesGenerated?.toLocaleString() || 0}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-400 flex items-center gap-2">
                                        <Clock size={16} />
                                        Processing Time
                                    </span>
                                    <span className="text-lg font-bold text-gray-300">
                                        {Math.round((userData?.stats?.totalProcessingTime || 0) / 60)}m
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Settings;
