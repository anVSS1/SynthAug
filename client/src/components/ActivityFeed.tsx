import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, FolderPlus, Trash2, Upload, Zap, CheckCircle, XCircle, Download } from 'lucide-react';
import api from '../services/api';

const activityIcons = {
  project_created: <FolderPlus size={16} className="text-primary-400" />,
  project_deleted: <Trash2 size={16} className="text-red-400" />,
  upload_started: <Upload size={16} className="text-blue-400" />,
  training_started: <Zap size={16} className="text-yellow-400" />,
  training_completed: <CheckCircle size={16} className="text-green-400" />,
  training_failed: <XCircle size={16} className="text-red-400" />,
  download: <Download size={16} className="text-accent-400" />,
};

const activityLabels = {
  project_created: 'Created project',
  project_deleted: 'Deleted project',
  upload_started: 'Started upload',
  training_started: 'Started training',
  training_completed: 'Training completed',
  training_failed: 'Training failed',
  download: 'Downloaded results',
};

const ActivityFeed = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await api.get('/activity');
      setActivities(res.data.slice(0, 10)); // Show last 10
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="glass-panel p-6 sticky top-8">
      <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <Activity size={20} className="text-primary-400" />
        Recent Activity
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-dark-800/50 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No activity yet</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <motion.div
              key={activity._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-dark-800/30 hover:bg-dark-800/50 transition-colors"
            >
              <div className="mt-0.5">{activityIcons[activity.type]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 truncate">
                  {activityLabels[activity.type]}
                </p>
                {activity.projectName && (
                  <p className="text-xs text-gray-500 truncate">{activity.projectName}</p>
                )}
                <p className="text-xs text-gray-600 mt-1">{getTimeAgo(activity.createdAt)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
