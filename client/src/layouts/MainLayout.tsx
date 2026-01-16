import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, Sparkles, X, CheckCheck, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    return (
    <aside className="w-72 bg-dark-900/80 backdrop-blur-xl border-r border-dark-700/50 flex flex-col">
        <div className="p-8 border-b border-dark-700/50">
            <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-4xl font-display font-bold text-center cursor-pointer"
                onClick={() => navigate('/')}
            >
                <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
                    SynthAug
                </span>
            </motion.h1>
            <p className="text-xs text-center text-gray-500 mt-2">AI Dataset Augmentation</p>
        </div>
        <nav className="flex-grow p-8">
            <div className="space-y-4">
                <div className="glass-panel p-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">How it works</h3>
                    <div className="space-y-3 text-sm text-gray-500">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">1</div>
                            <span>Upload your dataset as ZIP</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">2</div>
                            <span>AI processes and augments</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">3</div>
                            <span>Download enhanced dataset</span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        <div className="p-6 border-t border-dark-700/50 space-y-3">
            <button
                onClick={() => navigate('/settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    location.pathname === '/settings'
                        ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-500/30 text-primary-400'
                        : 'text-gray-400 hover:bg-dark-800 hover:text-gray-300'
                }`}
            >
                <SettingsIcon size={18} />
                <span className="font-medium">Settings</span>
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-600 px-4">
                <Sparkles size={14} className="text-primary-500" />
                <span>Powered by Projected GAN</span>
            </div>
        </div>
    </aside>
)};

const TopBar = () => {
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    
    const { notifications, fetchNotifications, markAsRead, markAllAsRead, clearNotification, getUnreadCount } = useNotificationStore();
    const unreadCount = getUnreadCount();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };
    
    const handleNotificationClick = (notif: any) => {
        markAsRead(notif._id);
        navigate(`/project/${notif.projectId}`);
        setShowNotifications(false);
    };

    return (
    <header className="h-16 bg-dark-900/60 backdrop-blur-xl border-b border-dark-700/50 flex items-center justify-end px-6">
        <div className="flex items-center gap-6">
            <div className="relative" ref={notificationRef}>
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative text-gray-400 hover:text-primary-400 transition-colors"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
                <AnimatePresence>
                    {showNotifications && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 glass-panel p-4 z-50 max-h-96 overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-semibold text-gray-200">Notifications</h3>
                                {notifications.length > 0 && (
                                    <button 
                                        onClick={markAllAsRead}
                                        className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                                    >
                                        <CheckCheck size={14} />
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            
                            {notifications.length === 0 ? (
                                <p className="text-xs text-gray-500 text-center py-4">No notifications</p>
                            ) : (
                                <div className="space-y-2">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif._id}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                                notif.read 
                                                    ? 'bg-dark-800/30 border-dark-700' 
                                                    : 'bg-gradient-to-r from-primary-500/10 to-accent-500/10 border-primary-500/30'
                                            }`}
                                            onClick={() => handleNotificationClick(notif)}
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-200">{notif.projectName}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{notif.message}</p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {new Date(notif.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        clearNotification(notif._id);
                                                    }}
                                                    className="text-gray-600 hover:text-gray-400"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-white text-sm">
                    U
                </div>
                <span className="text-sm font-medium text-gray-300">User</span>
            </div>
            <button 
                onClick={handleLogout} 
                title="Logout" 
                className="text-gray-400 hover:text-red-400 transition-colors"
            >
                <LogOut size={20} />
            </button>
        </div>
    </header>
)};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen flex bg-dark-950 text-gray-300 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-mesh opacity-20"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl"></div>
            
            <Sidebar />
            <div className="flex-1 flex flex-col relative z-10">
                <TopBar />
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
