const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const auth = require("../middleware/auth");
const Project = require("../models/Project");
const Notification = require("../models/Notification");

const router = express.Router();

// AI Engine URLs from environment variables
const aiEngineUrl = process.env.AI_ENGINE_URL;
const tabularEngineUrl = process.env.TABULAR_ENGINE_URL;
const aiEngineSecret = process.env.AI_ENGINE_SECRET;

if (!aiEngineUrl) {
  console.error(
    "FATAL ERROR: AI_ENGINE_URL is not defined. Image proxy will not work.",
  );
}

if (!tabularEngineUrl) {
  console.warn(
    "WARNING: TABULAR_ENGINE_URL is not defined. Tabular proxy will not work.",
  );
}

const createEngineProxy = (target) => {
  if (!target) return null;
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      const newPath = path.split("/").slice(4).join("/");
      return `/${newPath}`;
    },
    onProxyReq: (proxyReq, req, res) => {
      if (!req.body || !Object.keys(req.body).length) {
        return;
      }

      const contentType = proxyReq.getHeader("Content-Type");
      let bodyData;

      if (contentType && contentType.includes("application/json")) {
        bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    logLevel: "debug",
  });
};

const aiProxy = createEngineProxy(aiEngineUrl);
const tabularProxy = createEngineProxy(tabularEngineUrl);

// Middleware to find the project and attach it to the request
// Also ensures that the user making the request is the owner of the project.
const findProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }
    // req.user is from the 'auth' middleware
    if (project.owner.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: "User not authorized for this project" });
    }
    req.project = project;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const findProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    req.project = project;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const forwardToEngine = (req, res, next) => {
  const isTabular = req.project?.config?.dataType === "tabular";
  const proxy = isTabular ? tabularProxy : aiProxy;

  if (!proxy) {
    return res.status(500).json({
      msg: isTabular
        ? "Tabular engine is not configured on the server."
        : "AI Engine is not configured on the server.",
    });
  }

  req.headers["x-project-id"] = req.params.projectId;
  return proxy(req, res, next);
};

const isPrivateIp = (ip) => {
  if (!ip) return false;
  if (ip.startsWith("::ffff:")) {
    return isPrivateIp(ip.replace("::ffff:", ""));
  }
  if (ip === "::1" || ip === "127.0.0.1") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("172.")) {
    const parts = ip.split(".");
    const second = Number(parts[1]);
    return second >= 16 && second <= 31;
  }
  return false;
};

const isLocalRequest = (req) => {
  const ip = req.ip || req.connection?.remoteAddress || "";
  const forwarded = req.headers["x-forwarded-for"] || "";
  const forwardedIp =
    typeof forwarded === "string" ? forwarded.split(",")[0].trim() : "";
  return isPrivateIp(ip) || isPrivateIp(forwardedIp);
};

// Special handler for /train endpoint to inject project config
router.post(
  "/:projectId/train",
  auth,
  findProject,
  async (req, res, next) => {
    const isTabular = req.project?.config?.dataType === "tabular";

    req.body = isTabular
      ? {
          count: req.project.config.count,
          model: req.project.config.tabularModel,
        }
      : {
          preset: req.project.config.preset,
          count: req.project.config.count,
        };

    req.headers["content-type"] = "application/json";

    try {
      req.project.status = "training";
      req.project.logs.push(
        `Training started (${isTabular ? "tabular" : "image"})...`,
      );
      await req.project.save();
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: "Failed to update project status." });
    }

    next();
  },
  forwardToEngine,
);

router.post(
  "/:projectId/upload",
  auth,
  findProject,
  async (req, res, next) => {
    try {
      req.project.status = "uploading";
      req.project.logs.push("Uploading dataset...");
      await req.project.save();
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: "Failed to update project status." });
    }

    next();
  },
  forwardToEngine,
);

// Webhook endpoint for AI engine to notify completion (MUST be before catch-all)
router.post(
  "/:projectId/webhook",
  findProjectById,
  async (req, res, next) => {
    if (aiEngineSecret) {
      const incomingSecret = req.headers["x-ai-secret"];
      if (incomingSecret !== aiEngineSecret) {
        const ip = req.ip || req.connection?.remoteAddress || "";
        const forwarded = req.headers["x-forwarded-for"] || "";
        const localAllowed = isLocalRequest(req);
        if (!localAllowed) {
          console.warn(
            "Webhook rejected: secret mismatch.",
            `ip=${ip}`,
            `x-forwarded-for=${forwarded}`,
            `incomingSecret=${incomingSecret ? "present" : "missing"}`,
          );
          return res.status(401).json({ msg: "Invalid AI engine secret." });
        }
        console.warn(
          "Webhook secret mismatch from local request. Allowing for local engine.",
          `ip=${ip}`,
          `x-forwarded-for=${forwarded}`,
        );
      }
    }

    next();
  },
  async (req, res) => {
    try {
      const { status, message, metadata } = req.body;
      const project = req.project;
      const normalizedStatus =
        status === "complete"
          ? "completed"
          : status === "error"
            ? "failed"
            : status;

      // Update project status
      project.status = normalizedStatus;
      if (message) {
        project.logs.push(message);
      }
      if (metadata) {
        project.metadata = { ...project.metadata, ...metadata };
      }
      await project.save();

      // Update user stats if completed
      if (
        normalizedStatus === "completed" &&
        metadata?.generatedCount &&
        project.config.dataType === "image"
      ) {
        await require("../models/User").findByIdAndUpdate(project.owner, {
          $inc: {
            "stats.totalImagesGenerated": metadata.generatedCount,
            "stats.totalProcessingTime": metadata.processingTime || 0,
          },
        });
      }

      // Create notification
      const notification = new Notification({
        user: project.owner,
        projectId: project._id,
        projectName: project.name,
        message:
          normalizedStatus === "completed"
            ? "Training completed! Your dataset is ready to download."
            : "Training failed. Please try again.",
        type: normalizedStatus === "completed" ? "success" : "error",
      });
      await notification.save();

      res.json({ msg: "Webhook received" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  },
);

// Apply auth, project lookup, and then the proxy for all routes in this file
// IMPORTANT: This catch-all MUST be last, after all explicit routes
router.use(
  "/:projectId",
  auth,
  findProject,
  (req, res, next) => {
    next();
  },
  forwardToEngine,
);

module.exports = router;
