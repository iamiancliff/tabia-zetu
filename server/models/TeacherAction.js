import mongoose from 'mongoose'

const TeacherActionSchema = new mongoose.Schema({
  // Teacher information
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Action details
  actionType: {
    type: String,
    enum: [
      'schedule_meeting',
      'review_incidents',
      'review_curriculum',
      'adjust_schedule',
      'celebrate_behavior',
      'implement_prevention',
      'generate_report',
      'contact_parents',
      'apply_recommendation',
      'apply_suggestion',
      'other'
    ],
    required: true
  },
  
  // Action description
  title: {
    type: String,
    required: true
  },
  description: String,
  details: mongoose.Schema.Types.Mixed,
  
  // Related AI recommendations
  relatedInsight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIInsight'
  },
  relatedPrediction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BehaviorPrediction'
  },
  
  // Action status
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'cancelled', 'failed'],
    default: 'planned'
  },
  
  // Implementation details
  plannedAt: Date,
  startedAt: Date,
  completedAt: Date,
  duration: Number, // minutes
  
  // Priority and urgency
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Outcomes and results
  outcome: {
    success: Boolean,
    impact: {
      type: String,
      enum: ['positive', 'negative', 'neutral', 'unknown']
    },
    notes: String,
    metrics: mongoose.Schema.Types.Mixed
  },
  
  // Follow-up actions
  followUpActions: [{
    action: String,
    dueDate: Date,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    }
  }],
  
  // Resources and support
  resources: [{
    type: String,
    name: String,
    url: String,
    description: String
  }],
  
  // Collaboration
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    contribution: String
  }],
  
  // Feedback and evaluation
  feedback: {
    effectiveness: {
      type: Number,
      min: 1,
      max: 5
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5
    },
    timeInvestment: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    feedbackAt: Date
  },
  
  // Metadata
  tags: [String],
  category: String,
  subcategory: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
TeacherActionSchema.index({ teacher: 1, status: 1 });
TeacherActionSchema.index({ actionType: 1, priority: 1 });
TeacherActionSchema.index({ relatedInsight: 1 });
TeacherActionSchema.index({ relatedPrediction: 1 });
TeacherActionSchema.index({ plannedAt: 1, dueDate: 1 });
TeacherActionSchema.index({ tags: 1, category: 1 });

export default mongoose.model('TeacherAction', TeacherActionSchema);
