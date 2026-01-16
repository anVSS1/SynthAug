const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const Project = require('../models/Project');
const User = require('../models/User');
const Activity = require('../models/Activity');

// @route   GET api/projects
// @desc    Get all projects for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/projects
// @desc    Create a new project
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, config } = req.body;

    try {
      const newProject = new Project({
        name,
        config,
        owner: req.user.id,
      });

      const project = await newProject.save();
      
      // Update user stats
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { 'stats.totalProjects': 1 }
      });
      
      // Log activity
      await Activity.create({
        user: req.user.id,
        type: 'project_created',
        projectId: project._id,
        projectName: project.name,
      });
      
      res.json(project);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Make sure user owns project
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/projects/:id
// @desc    Update project name
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [check('name', 'Name is required').not().isEmpty()]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ msg: 'Project not found' });
      }

      if (project.owner.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
      }

      project.name = req.body.name;
      await project.save();

      res.json(project);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await project.deleteOne();

    // Log activity
    await Activity.create({
      user: req.user.id,
      type: 'project_deleted',
      projectName: project.name,
    });

    res.json({ msg: 'Project deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
