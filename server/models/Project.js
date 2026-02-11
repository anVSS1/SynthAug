const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["idle", "uploading", "training", "completed", "failed"],
    default: "idle",
  },
  config: {
    dataType: {
      type: String,
      enum: ["image", "tabular"],
      default: "image",
    },
    preset: {
      type: String,
      enum: ["draft", "studio"],
      default: "draft",
    },
    count: {
      type: Number,
      default: 500,
    },
    tabularModel: {
      type: String,
      enum: ["ctgan", "gaussian"],
      default: "ctgan",
    },
  },
  metadata: {
    originalFileSize: Number,
    originalFileCount: Number,
    resultFileSize: Number,
    generatedRows: Number,
    columnCount: Number,
    processingTime: Number,
    uploadedAt: Date,
    completedAt: Date,
  },
  logs: {
    type: [String],
    default: [],
    validate: [arrayLimit, "{PATH} exceeds the limit of 100"],
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

ProjectSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Project", ProjectSchema);
