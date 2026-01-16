const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['idle', 'uploading', 'training', 'completed', 'failed'],
    default: 'idle',
  },
  config: {
    preset: {
      type: String,
      enum: ['draft', 'studio'],
      default: 'draft',
    },
    count: {
      type: Number,
      default: 500,
    },
  },
  metadata: {
    originalFileSize: Number,
    originalFileCount: Number,
    resultFileSize: Number,
    processingTime: Number,
    uploadedAt: Date,
    completedAt: Date,
  },
  logs: {
    type: [String],
    default: [],
    validate: [arrayLimit, '{PATH} exceeds the limit of 100'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

function arrayLimit(val) {
  return val.length <= 100;
}

ProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);
