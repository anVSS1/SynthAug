const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['project_created', 'project_deleted', 'upload_started', 'training_started', 'training_completed', 'training_failed', 'download'],
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  projectName: String,
  metadata: {
    imageCount: Number,
    preset: String,
    processingTime: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Activity', ActivitySchema);
