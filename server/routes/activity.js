const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');

// @route   GET api/activity
// @desc    Get user activity feed
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(activities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/activity
// @desc    Create activity log
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { type, projectId, projectName, metadata } = req.body;
    
    const activity = new Activity({
      user: req.user.id,
      type,
      projectId,
      projectName,
      metadata,
    });

    await activity.save();
    res.json(activity);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
