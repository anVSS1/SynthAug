const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

const router = express.Router();

// AI Engine URL from environment variables
const aiEngineUrl = process.env.AI_ENGINE_URL;

if (!aiEngineUrl) {
    console.error("FATAL ERROR: AI_ENGINE_URL is not defined. The proxy will not work.");
}

const aiProxy = createProxyMiddleware({
    target: aiEngineUrl,
    changeOrigin: true,
    pathRewrite: (path, req) => {
        const newPath = path.split('/').slice(4).join('/');
        return `/${newPath}`;
    },
    onProxyReq: (proxyReq, req, res) => {
        if (!req.body || !Object.keys(req.body).length) {
            return;
        }

        const contentType = proxyReq.getHeader('Content-Type');
        let bodyData;

        if (contentType && contentType.includes('application/json')) {
            bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    },
    logLevel: 'debug',
});

// Middleware to find the project and attach it to the request
// Also ensures that the user making the request is the owner of the project.
const findProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        // req.user is from the 'auth' middleware
        if (project.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized for this project' });
        }
        req.project = project;
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}

// Special handler for /train endpoint to inject project config
router.post('/:projectId/train', auth, findProject, (req, res, next) => {
    if (!aiEngineUrl) {
        return res.status(500).json({ msg: 'AI Engine is not configured on the server.' });
    }
    
    // Inject project config into request body
    req.body = {
        preset: req.project.config.preset,
        count: req.project.config.count
    };
    
    // Ensure Content-Type is set
    req.headers['content-type'] = 'application/json';
    
    next();
}, aiProxy);

// Apply auth, project lookup, and then the proxy for all routes in this file
router.use('/:projectId', auth, findProject, (req, res, next) => {
    if (!aiEngineUrl) {
        return res.status(500).json({ msg: 'AI Engine is not configured on the server.' });
    }
    // Continue to the specific proxy handler
    next();
}, aiProxy);

// Webhook endpoint for AI engine to notify completion
router.post('/:projectId/webhook', auth, findProject, async (req, res) => {
    try {
        const { status, message, metadata } = req.body;
        const project = req.project;
        
        // Update project status
        project.status = status;
        if (message) {
            project.logs.push(message);
        }
        if (metadata) {
            project.metadata = { ...project.metadata, ...metadata };
        }
        await project.save();
        
        // Update user stats if completed
        if (status === 'completed' && metadata?.generatedCount) {
            await require('../models/User').findByIdAndUpdate(project.owner, {
                $inc: { 
                    'stats.totalImagesGenerated': metadata.generatedCount,
                    'stats.totalProcessingTime': metadata.processingTime || 0
                }
            });
        }
        
        // Create notification
        const notification = new Notification({
            user: project.owner,
            projectId: project._id,
            projectName: project.name,
            message: status === 'completed' 
                ? 'Training completed! Your dataset is ready to download.'
                : 'Training failed. Please try again.',
            type: status === 'completed' ? 'success' : 'error',
        });
        await notification.save();
        
        res.json({ msg: 'Webhook received' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
