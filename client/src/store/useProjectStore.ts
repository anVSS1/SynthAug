import { create } from 'zustand';
import api from '../services/api';
import { useNotificationStore } from './useNotificationStore';

export type ProjectStatus = 'idle' | 'uploading' | 'training' | 'completed' | 'failed';

export interface ProjectConfig {
    preset: 'draft' | 'studio';
    count: number;
}

interface ProjectState {
    id: string | null;
    name: string;
    status: ProjectStatus;
    config: ProjectConfig;
    logs: string[];
    files: File[];
    
    setId: (id: string) => void;
    setName: (name: string) => void;
    setStatus: (status: ProjectStatus) => void;
    setConfig: (config: Partial<ProjectConfig>) => void;
    addLog: (log: string) => void;
    setFiles: (files: File[]) => void;
    fetchProject: (projectId: string) => Promise<void>;
    startTraining: (projectId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    id: null,
    name: "Untitled Project",
    status: 'idle',
    config: {
        preset: 'draft',
        count: 500,
    },
    logs: [],
    files: [],

    setId: (id) => set({ id }),
    setName: (name) => set({ name }),
    setStatus: (status) => set({ status }),
    setConfig: (newConfig) => set((state) => ({ config: { ...state.config, ...newConfig } })),
    addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
    setFiles: (files) => set({ files }),

    fetchProject: async (projectId) => {
        try {
            const response = await api.get(`/projects/${projectId}`);
            const projectData = response.data;
            
            set({
                id: projectData._id,
                name: projectData.name,
                status: projectData.status,
                config: projectData.config,
                logs: projectData.logs,
            });

        } catch (error) {
            console.error("Error fetching project:", error);
            set({ status: 'failed' });
            get().addLog(`Error: Could not load project ${projectId}.`);
        }
    },
    
    startTraining: async (projectId) => {
        try {
            set({ status: 'training' });
            await api.post(`/proxy/${projectId}/train`);
            
            let pollCount = 0;
            const maxPolls = 360; // 30 minutes max (360 * 5 seconds)
            
            // Poll for completion
            const pollInterval = setInterval(async () => {
                try {
                    pollCount++;
                    
                    if (pollCount > maxPolls) {
                        clearInterval(pollInterval);
                        set({ status: 'failed' });
                        get().addLog('Training timeout - exceeded maximum time.');
                        return;
                    }
                    
                    const statusRes = await api.get(`/projects/${projectId}`);
                    const currentStatus = statusRes.data.status;
                    const projectName = statusRes.data.name;
                    
                    if (currentStatus === 'completed') {
                        set({ status: 'completed' });
                        get().addLog('Training completed successfully!');
                        
                        // Add notification
                        useNotificationStore.getState().addNotification({
                            projectId,
                            projectName,
                            message: 'Training completed! Your dataset is ready to download.',
                            type: 'success',
                        });
                        
                        clearInterval(pollInterval);
                    } else if (currentStatus === 'failed') {
                        set({ status: 'failed' });
                        get().addLog('Training failed.');
                        
                        // Add notification
                        useNotificationStore.getState().addNotification({
                            projectId,
                            projectName,
                            message: 'Training failed. Please try again.',
                            type: 'error',
                        });
                        
                        clearInterval(pollInterval);
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                    clearInterval(pollInterval);
                }
            }, 5000);
            
            // Store interval ID to allow cleanup
            (window as any).__trainingPollInterval = pollInterval;
            
        } catch (error: any) {
            set({ status: 'failed' });
            get().addLog(`Error: ${error.message}`);
        }
    },
}));
