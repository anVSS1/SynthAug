import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FolderOpen,
  Loader,
  AlertTriangle,
  CheckCircle,
  Zap,
  AlertCircle,
  Clock,
  UploadCloud,
  Trash2,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";
import NewProjectModal from "../components/NewProjectModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import ActivityFeed from "../components/ActivityFeed";

const statusConfig = {
  completed: {
    icon: <CheckCircle />,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  training: { icon: <Zap />, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  failed: { icon: <AlertCircle />, color: "text-red-400", bg: "bg-red-500/10" },
  uploading: {
    icon: <UploadCloud />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  idle: { icon: <Clock />, color: "text-gray-400", bg: "bg-gray-500/10" },
};

const ProjectCard = ({
  project,
  index,
  onDelete,
}: {
  project: any;
  index: number;
  onDelete: (id: string) => void;
}) => {
  const navigate = useNavigate();
  const config = statusConfig[project.status] || statusConfig.idle;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/projects/${project._id}`);
      onDelete(project._id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project");
    }
  };

  return (
    <>
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        projectName={project.name}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -5, scale: 1.02 }}
        onClick={() => navigate(`/project/${project._id}`)}
        className="glass-panel p-6 cursor-pointer flex flex-col justify-between h-52 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

        {/* Status Badge */}
        <div
          className={`absolute top-4 right-4 h-10 w-10 rounded-xl flex items-center justify-center ${config.bg}`}
        >
          <div className={config.color}>
            {React.cloneElement(config.icon, { size: 20 })}
          </div>
        </div>

        {/* Delete Button - Shows on hover */}
        <button
          onClick={handleDeleteClick}
          className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-400 bg-dark-900/80 backdrop-blur-sm p-2 rounded-lg z-20"
          title="Delete project"
        >
          <Trash2 size={16} />
        </button>

        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-3">
            <FolderOpen className="text-white" size={24} />
          </div>
          <h3 className="font-bold text-lg text-gray-200 truncate pr-12">
            {project.name}
          </h3>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-gray-400 capitalize">{project.status}</p>
          <p className="text-xs text-gray-600">
            {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    </>
  );
};

const NewProjectCard = ({ onClick }: { onClick: () => void }) => {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative cursor-pointer flex flex-col justify-center items-center text-center p-6 h-52 bg-dark-800/30 border-2 border-dashed border-dark-700 rounded-2xl hover:border-primary-500 transition-all"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <Plus
        className="text-gray-500 group-hover:text-primary-400 mb-3 transition-colors relative z-10"
        size={40}
      />
      <h3 className="font-bold text-lg text-gray-300 relative z-10">
        New Project
      </h3>
      <p className="text-sm text-gray-600 relative z-10">Create a dataset</p>
    </motion.div>
  );
};

const Dashboard = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching projects...");
        const res = await api.get("/projects");
        console.log("Projects fetched:", res.data);
        setProjects(res.data);
        setFilteredProjects(res.data);
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load projects. Please ensure the backend server is running.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.status.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredProjects(filtered);
    }
  }, [searchQuery, projects]);

  const handleProjectCreated = (newProject: any) => {
    setProjects([newProject, ...projects]);
    setModalOpen(false);
  };

  const handleProjectDeleted = (projectId: string) => {
    setProjects(projects.filter((p) => p._id !== projectId));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <NewProjectModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onProjectCreated={handleProjectCreated}
        />

        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Your Projects
            </span>
          </h1>
          <p className="text-gray-400">
            Manage your dataset augmentation projects
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search projects by name or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-800/50 border border-dark-700 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-200 placeholder:text-gray-600"
            />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin text-primary-400" size={48} />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-64 glass-panel">
            <AlertTriangle className="text-red-500 mb-4" size={48} />
            <h3 className="text-xl text-gray-200">An Error Occurred</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <NewProjectCard onClick={() => setModalOpen(true)} />
            {filteredProjects.map((p, i) => (
              <ProjectCard
                key={p._id}
                project={p}
                index={i + 1}
                onDelete={handleProjectDeleted}
              />
            ))}
          </div>
        )}

        {!loading &&
          !error &&
          filteredProjects.length === 0 &&
          projects.length > 0 && (
            <div className="text-center py-16 glass-panel mt-6">
              <h3 className="text-xl text-gray-200 mb-2">No Results Found</h3>
              <p className="text-gray-400">Try a different search term</p>
            </div>
          )}

        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-16 glass-panel mt-6">
            <h3 className="text-xl text-gray-200 mb-2">No Projects Yet</h3>
            <p className="text-gray-400">
              Create your first project to get started
            </p>
          </div>
        )}
      </div>

      {/* Activity Feed Sidebar */}
      <div className="lg:col-span-1">
        <ActivityFeed />
      </div>
    </div>
  );
};

export default Dashboard;
