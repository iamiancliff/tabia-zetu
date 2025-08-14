import mongoose from 'mongoose'

const BehaviorPredictionSchema = new mongoose.Schema({
  // Student information
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  
  // Prediction details
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Prediction content
  predictedBehavior: {
    type: String,
    required: true
  },
  likelihood: {
    type: Number,
    min: 0,
    max: 100
  },
  timeframe: {
    type: String,
    enum: ['immediate', 'within_day', 'within_week', 'within_month'],
    default: 'within_week'
  },
  
  // Risk factors
  riskFactors: [{
    factor: String,
    weight: Number,
    description: String
  }],
  
  // Prevention strategies
  preventionStrategies: [{
    strategy: String,
    priority: String,
    description: String,
    expectedOutcome: String
  }],
  
  // Implementation tracking
  isImplemented: {
    type: Boolean,
    default: false
  },
  implementedAt: Date,
  implementedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  implementedStrategies: [String],
  
  // Outcome tracking
  outcome: {
    occurred: Boolean,
    occurredAt: Date,
    actualBehavior: String,
    severity: String,
    notes: String
  },
  
  // Accuracy tracking
  predictionAccuracy: {
    type: String,
    enum: ['correct', 'incorrect', 'partially_correct'],
    default: null
  },
  accuracyNotes: String,
  
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
  
  // Analysis context
  analysisVersion: String,
  dataSnapshot: {
    totalBehaviors: Number,
    recentBehaviors: Number,
    behaviorPatterns: [String],
    timeRange: {
      start: Date,
      end: Date
    }
  },
  
  // Related data
  relatedBehaviors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "BehaviorLog"
  }],
  relatedInsights: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "AIInsight"
  }]
}, {
  timestamps: true
});

// Indexes for efficient querying
BehaviorPredictionSchema.index({ student: 1, riskLevel: 1, isActive: 1 });
BehaviorPredictionSchema.index({ riskScore: -1, generatedAt: -1 });
BehaviorPredictionSchema.index({ isImplemented: 1, implementedAt: -1 });
BehaviorPredictionSchema.index({ predictionAccuracy: 1 });
BehaviorPredictionSchema.index({ expiresAt: 1 });

export default mongoose.model('BehaviorPrediction', BehaviorPredictionSchema);
