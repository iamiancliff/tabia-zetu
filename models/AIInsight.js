import mongoose from 'mongoose'

const AIInsightSchema = new mongoose.Schema({
  // Basic insight information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['pattern', 'intervention', 'curriculum', 'scheduling', 'alert', 'opportunity'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  
  // AI analysis data
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  data: [{
    label: String,
    value: mongoose.Schema.Types.Mixed,
    percentage: Number,
    type: String
  }],
  
  // Action recommendations
  actions: [{
    type: String,
    required: true
  }],
  
  // Implementation tracking
  isApplied: {
    type: Boolean,
    default: false
  },
  appliedAt: Date,
  appliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  appliedAction: String,
  
  // Teacher feedback
  teacherFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    feedbackAt: Date
  },
  
  // Metadata
  generatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Related data references
  relatedBehaviors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "BehaviorLog"
  }],
  relatedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }],
  
  // Analysis context
  analysisVersion: String,
  dataSnapshot: {
    totalBehaviors: Number,
    totalStudents: Number,
    timeRange: {
      start: Date,
      end: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
AIInsightSchema.index({ type: 1, priority: 1, isActive: 1 });
AIInsightSchema.index({ generatedAt: -1 });
AIInsightSchema.index({ relatedStudents: 1 });
AIInsightSchema.index({ isApplied: 1, appliedAt: -1 });

export default mongoose.model('AIInsight', AIInsightSchema);
