import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProjectStore, ProjectStatus } from "../store/useProjectStore";
import { useAuthStore } from "../store/useAuthStore";
import api from "../services/api";
import Terminal from "../components/Terminal";
import ProgressVisualization from "../components/ProgressVisualization";
import {
  UploadCloud,
  Settings,
  Download,
  Loader,
  Server,
  CheckCircle,
  Zap,
  AlertCircle,
  Clock,
  Sparkles,
  Edit2,
  Check,
  X,
  Package,
  Database,
  Table,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

const statusConfig: {
  [key in ProjectStatus]: {
    icon: React.ReactNode;
    color: string;
    label: string;
  };
} = {
  completed: {
    icon: <CheckCircle />,
    color: "text-green-400",
    label: "Completed",
  },
  training: {
    icon: <Zap />,
    color: "text-yellow-400 animate-pulse",
    label: "Training",
  },
  failed: { icon: <AlertCircle />, color: "text-red-400", label: "Failed" },
  uploading: {
    icon: <UploadCloud />,
    color: "text-blue-400 animate-pulse",
    label: "Uploading",
  },
  idle: { icon: <Clock />, color: "text-gray-400", label: "Idle" },
};

const Studio = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore.getState();
  const {
    name,
    status,
    config,
    logs,
    files,
    fetchProject,
    setStatus,
    addLog,
    setFiles,
    setConfig,
    setName,
  } = useProjectStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [csvSampleRows, setCsvSampleRows] = useState<string[][]>([]);
  const tableScrollRef = useRef<HTMLDivElement>(null);

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
      console.error("Error updating name:", error);
      alert("Failed to update project name");
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName("");
  };

  const parseCsvPreview = (content: string) => {
    const lines = content
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);
    if (lines.length === 0) return { columns: [], rows: [] };

    const parseRow = (row: string) => {
      const cells: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < row.length; i += 1) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
          continue;
        }
        if (char === "," && !inQuotes) {
          cells.push(current.trim());
          current = "";
          continue;
        }
        current += char;
      }
      cells.push(current.trim());
      return cells;
    };

    const columns = parseRow(lines[0]);
    const rows = lines.slice(1, 6).map(parseRow);
    return { columns, rows };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const isTabular = config.dataType === "tabular";
      const isZip =
        file.type === "application/zip" ||
        file.type === "application/x-zip-compressed" ||
        file.name.endsWith(".zip");
      const isCsv = file.type === "text/csv" || file.name.endsWith(".csv");

      if ((isTabular && isCsv) || (!isTabular && isZip)) {
        setFiles([file]);
        addLog(`File selected: ${file.name}`);

        if (isTabular) {
          const reader = new FileReader();
          reader.onload = () => {
            const result =
              typeof reader.result === "string" ? reader.result : "";
            const preview = parseCsvPreview(result);
            setCsvColumns(preview.columns);
            setCsvSampleRows(preview.rows);
          };
          reader.readAsText(file.slice(0, 20000));
        } else {
          setCsvColumns([]);
          setCsvSampleRows([]);
        }
      } else {
        addLog(`Error: Please select a ${isTabular ? ".csv" : ".zip"} file.`);
        setFiles([]);
        setCsvColumns([]);
        setCsvSampleRows([]);
      }
    }
  };

  const handleUpload = async () => {
    if (files.length === 0 || !projectId) return;

    setStatus("uploading");
    addLog(`Starting upload for ${files[0].name}...`);
    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const res = await api.post(`/proxy/${projectId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addLog(res.data.message || "Upload successful.");
      setStatus("idle");
    } catch (error: any) {
      addLog(`Error during upload: ${error.message}`);
      setStatus("failed");
    }
  };

  const handleInitiateSequence = async () => {
    if (!projectId) return;

    const trainingConfig = { ...config };

    // For tabular projects, auto-upload CSV first if not already uploaded
    if (trainingConfig.dataType === "tabular" && files.length > 0) {
      addLog("Auto-uploading CSV before training...");
      try {
        const formData = new FormData();
        formData.append("file", files[0]);
        const uploadRes = await api.post(
          `/proxy/${projectId}/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        addLog(uploadRes.data.message || "CSV uploaded successfully.");
      } catch (error: any) {
        addLog(`Upload failed: ${error.message}`);
        setStatus("failed");
        return;
      }
    }

    addLog("Initiating training sequence...");
    addLog(
      trainingConfig.dataType === "tabular"
        ? `Protocol: ${trainingConfig.tabularModel}, Rows: ${trainingConfig.count}`
        : `Protocol: ${trainingConfig.preset}, Yield: ${trainingConfig.count}`,
    );

    try {
      await useProjectStore.getState().startTraining(projectId);
    } catch (error: any) {
      addLog(`Error initiating training: ${error.message}`);
      setStatus("failed");
    }
  };

  const handleDownload = async (type: "generated" | "merged" = "generated") => {
    if (!projectId || !token) return;
    addLog(
      `Preparing ${type === "merged" ? "merged" : "generated"} download...`,
    );

    try {
      const response = await api.get(
        `/proxy/${projectId}/download?type=${type}`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      const extension = config.dataType === "tabular" ? "csv" : "zip";
      link.setAttribute(
        "download",
        `${name || "project"}_${type}.${extension}`,
      );
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      addLog("Download complete.");
    } catch (error: any) {
      addLog(`Download failed: ${error.message}`);
    }
  };

  const handleConfigChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "count") {
      const parsed = parseInt(value, 10);
      setConfig({ count: Number.isNaN(parsed) ? 0 : parsed });
      return;
    }
    setConfig({ [name]: value });
  };

  const scrollPreview = (dx: number, dy: number) => {
    if (!tableScrollRef.current) return;
    tableScrollRef.current.scrollBy({ left: dx, top: dy, behavior: "smooth" });
  };

  const isProcessing = status === "training" || status === "uploading";
  const isCompleted = status === "completed";
  const isTabular = config.dataType === "tabular";

  if (!name && status !== "failed") {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader className="animate-spin text-primary-400" size={48} />
      </div>
    );
  }

  const currentStatusConfig = statusConfig[status] || statusConfig.idle;

  return (
    <div className="h-full flex flex-col">
      <header className="flex-shrink-0 flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
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
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                className="text-2xl font-display font-bold bg-dark-800 border border-primary-500 rounded-lg px-3 py-1 text-gray-200 outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="text-green-400 hover:text-green-300"
              >
                <Check size={20} />
              </button>
              <button
                onClick={handleCancelEdit}
                className="text-red-400 hover:text-red-300"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent truncate">
                {name}
              </h1>
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
          <div className={currentStatusConfig.color}>
            {currentStatusConfig.icon}
          </div>
          <span className="text-sm text-gray-300 font-medium capitalize">
            {currentStatusConfig.label}
          </span>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow min-h-0">
        {/* Full Width: Progress Visualization */}
        {(status === "uploading" ||
          status === "training" ||
          status === "failed") && (
          <div className="lg:col-span-12">
            <ProgressVisualization status={status} />
          </div>
        )}

        {/* Left Column: Data */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 glass-panel p-5 flex flex-col min-h-0"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2">
            <UploadCloud
              size={20}
              className={isTabular ? "text-emerald-400" : "text-primary-400"}
            />
            {isTabular ? "CSV Input" : "Image Input"}
          </h2>
          <div
            className={`flex-grow border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 transition-colors ${
              isTabular
                ? "border-emerald-700/60 hover:border-emerald-500 bg-emerald-900/10"
                : "border-dark-700 hover:border-primary-500 bg-dark-800/30"
            }`}
          >
            <input
              type="file"
              accept={
                isTabular
                  ? ".csv,text/csv"
                  : ".zip,application/zip,application/x-zip-compressed"
              }
              onChange={handleFileChange}
              id="file-upload"
              className="hidden"
              disabled={isProcessing}
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer text-center ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div
                className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                  isTabular
                    ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20"
                    : "bg-gradient-to-br from-primary-500/20 to-accent-500/20"
                }`}
              >
                {isTabular ? (
                  <Database className="text-emerald-400" size={24} />
                ) : (
                  <UploadCloud className="text-primary-400" size={24} />
                )}
              </div>
              <p className="text-sm font-medium text-gray-300">
                Click to upload
              </p>
              <p className="text-xs text-gray-600">
                {isTabular ? "CSV file only" : "ZIP file only"}
              </p>
            </label>
          </div>
          <div className="mt-4">
            {files.length > 0 && (
              <div
                className={
                  isTabular
                    ? "text-sm text-emerald-400 truncate"
                    : "text-sm text-primary-400 truncate"
                }
              >
                {files[0].name}
              </div>
            )}
            {isTabular && csvColumns.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                {csvColumns.length} columns detected
              </div>
            )}
          </div>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || status !== "idle"}
            className={`mt-4 w-full ${isTabular ? "btn-secondary" : "btn-secondary"} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {status === "uploading" && (
              <Loader size={16} className="animate-spin" />
            )}
            {status === "uploading" ? "Uploading..." : "Upload File"}
          </button>
        </motion.div>

        {/* Center Column: Output */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`lg:col-span-6 ${isTabular ? "" : "glass-panel"} min-h-0`}
        >
          {isTabular ? (
            <div className="h-full flex flex-col gap-4 min-h-0">
              <div className="glass-panel p-5 flex-1 min-h-0 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Table size={18} className="text-emerald-400" />
                    <h3 className="text-lg font-semibold text-gray-200">
                      Schema Preview
                    </h3>
                  </div>
                  <span className="text-xs text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-full">
                    Numeric Lab
                  </span>
                </div>
                {csvColumns.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
                      <Database size={26} className="text-emerald-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-300">
                      Upload a CSV to inspect columns
                    </p>
                    <p className="text-xs text-gray-600">
                      We will preview the first rows here
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 min-h-0">
                    <div className="flex flex-wrap gap-2 max-h-20 overflow-auto pr-1">
                      {csvColumns.map((col) => (
                        <span
                          key={col}
                          className="text-xs text-emerald-200 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full"
                        >
                          {col || "Unnamed"}
                        </span>
                      ))}
                    </div>
                    {csvSampleRows.length > 0 && (
                      <div className="relative border border-dark-800 rounded-xl bg-dark-950/40">
                        <div
                          ref={tableScrollRef}
                          className="max-h-64 overflow-auto"
                        >
                          <table className="min-w-full text-xs text-gray-300">
                            <thead className="bg-dark-900/70 sticky top-0">
                              <tr>
                                {csvColumns.map((col) => (
                                  <th
                                    key={col}
                                    className="px-3 py-2 text-left font-semibold text-gray-400 whitespace-nowrap"
                                  >
                                    {col || "Unnamed"}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {csvSampleRows.map((row, rowIndex) => (
                                <tr
                                  key={`row-${rowIndex}`}
                                  className="border-t border-dark-800"
                                >
                                  {csvColumns.map((col, colIndex) => (
                                    <td
                                      key={`${col}-${colIndex}`}
                                      className="px-3 py-2 text-gray-300 whitespace-nowrap"
                                    >
                                      {row[colIndex] || ""}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="absolute right-2 bottom-2 flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => scrollPreview(0, -120)}
                            className="h-7 w-7 rounded-lg border border-emerald-500/30 bg-dark-900/80 text-emerald-200 hover:text-white hover:border-emerald-400 transition"
                            aria-label="Scroll up"
                          >
                            <ArrowUp size={14} className="mx-auto" />
                          </button>
                          <button
                            type="button"
                            onClick={() => scrollPreview(0, 120)}
                            className="h-7 w-7 rounded-lg border border-emerald-500/30 bg-dark-900/80 text-emerald-200 hover:text-white hover:border-emerald-400 transition"
                            aria-label="Scroll down"
                          >
                            <ArrowDown size={14} className="mx-auto" />
                          </button>
                        </div>
                        <div className="absolute left-2 bottom-2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => scrollPreview(-120, 0)}
                            className="h-7 w-7 rounded-lg border border-emerald-500/30 bg-dark-900/80 text-emerald-200 hover:text-white hover:border-emerald-400 transition"
                            aria-label="Scroll left"
                          >
                            <ArrowLeft size={14} className="mx-auto" />
                          </button>
                          <button
                            type="button"
                            onClick={() => scrollPreview(120, 0)}
                            className="h-7 w-7 rounded-lg border border-emerald-500/30 bg-dark-900/80 text-emerald-200 hover:text-white hover:border-emerald-400 transition"
                            aria-label="Scroll right"
                          >
                            <ArrowRight size={14} className="mx-auto" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="glass-panel p-4 flex-1 min-h-0">
                {status === "idle" && logs.length < 2 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 mb-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
                      <Server size={24} className="text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-300">
                      Ready for synthesis
                    </h3>
                    <p className="text-xs text-gray-600">
                      Upload data, tune model, then start training
                    </p>
                  </div>
                ) : (
                  <Terminal />
                )}
              </div>
            </div>
          ) : status === "idle" && logs.length < 2 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 glass-panel">
              <div className="w-16 h-16 mb-4 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-2xl flex items-center justify-center">
                <Server size={32} className="text-primary-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-300">System Ready</h3>
              <p className="text-sm text-gray-500">
                Upload data and configure settings to begin
              </p>
            </div>
          ) : (
            <div className="glass-panel h-full">
              <Terminal />
            </div>
          )}
        </motion.div>

        {/* Right Column: Config */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 glass-panel p-5 flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2">
              <Settings
                size={20}
                className={isTabular ? "text-emerald-400" : "text-primary-400"}
              />
              {isTabular ? "Generation Settings" : "Configuration"}
            </h2>
            <div className="space-y-6">
              {isTabular ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Model
                    </label>
                    <select
                      name="tabularModel"
                      value={config.tabularModel}
                      onChange={handleConfigChange}
                      disabled={isProcessing}
                      className="w-full bg-dark-800/50 border border-emerald-500/30 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition disabled:opacity-50 text-gray-300"
                    >
                      <option value="ctgan">CTGAN (Best Quality)</option>
                      <option value="gaussian">
                        Gaussian Copula (Fast CPU)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rows to Generate
                    </label>
                    <input
                      name="count"
                      type="number"
                      min="10"
                      max="100000"
                      step="10"
                      value={config.count}
                      onChange={handleConfigChange}
                      disabled={isProcessing}
                      className="w-full bg-dark-800/50 border border-emerald-500/30 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition disabled:opacity-50 text-gray-300"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      CPU-friendly: start with 1k–5k rows
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quality Mode
                    </label>
                    <select
                      name="preset"
                      value={config.preset}
                      onChange={handleConfigChange}
                      disabled={isProcessing}
                      className="w-full bg-dark-800/50 border border-dark-700 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition disabled:opacity-50 text-gray-300"
                    >
                      <option value="draft">Draft (Fast)</option>
                      <option value="studio">Studio (Quality)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Images:{" "}
                      <span className="text-primary-400">{config.count}</span>
                    </label>
                    <input
                      name="count"
                      type="range"
                      min="50"
                      max="1000"
                      step="50"
                      value={config.count}
                      onChange={handleConfigChange}
                      disabled={isProcessing}
                      className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="space-y-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleInitiateSequence}
              disabled={
                isProcessing ||
                isCompleted ||
                status === "failed" ||
                files.length === 0
              }
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              START TRAINING
            </motion.button>
            {isCompleted && (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDownload("generated")}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  {isTabular ? "Generated CSV" : "Generated Only"}
                </motion.button>
                {!isTabular && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownload("merged")}
                    className="w-full btn-secondary flex items-center justify-center gap-2"
                  >
                    <Package size={20} />
                    Original + Generated
                  </motion.button>
                )}
                {isTabular && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownload("merged")}
                    className="w-full btn-secondary flex items-center justify-center gap-2"
                  >
                    <Package size={20} />
                    Original + Generated CSV
                  </motion.button>
                )}
              </>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Studio;
