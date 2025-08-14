import mongoose from 'mongoose'

const AISystemMetricsSchema = new mongoose.Schema({
  // System health metrics
  systemHealth: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    status: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'needs_attention', 'critical'],
      required: true
    },
    dataQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      required: true
    },
    aiPerformance: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      required: true
    }
  },
  
  // Data metrics
  dataMetrics: {
    totalBehaviors: Number,
    totalStudents: Number,
    positiveBehaviors: Number,
    negativeBehaviors: Number,
    neutralBehaviors: Number,
    dataFreshness: Number, // days since last data update
    dataCompleteness: Number // percentage of complete records
  },
  
  // AI performance metrics
  aiPerformance: {
    totalInsights: Number,
    totalPredictions: Number,
    highPriorityItems: Number,
    averageConfidence: Number,
    analysisSuccessRate: Number,
    predictionAccuracy: Number,
    recommendationAdoptionRate: Number
  },
  
  // System activity
  activityMetrics: {
    lastAnalysisRun: Date,
    analysisDuration: Number, // milliseconds
    insightsGenerated: Number,
    predictionsGenerated: Number,
    activeUsers: Number,
    systemUptime: Number // percentage
  },
  
  // Error tracking
  errors: [{
    type: String,
    message: String,
    stack: String,
    timestamp: Date,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  }],
  
  // Performance trends
  trends: {
    behaviorTrend: {
      direction: String, // 'increasing', 'decreasing', 'stable'
      percentage: Number,
      period: String
    },
    insightTrend: {
      direction: String,
      percentage: Number,
      period: String
    },
    predictionTrend: {
      direction: String,
      percentage: Number,
      period: String
    }
  },
  
  // Metadata
  recordedAt: {
    type: Date,
    default: Date.now
  },
  analysisVersion: String,
  environment: {
    type: String,
    enum: ['development', 'staging', 'production'],
    default: 'development'
  },
  
  // Configuration snapshot
  configSnapshot: {
    aiModels: [String],
    analysisParameters: mongoose.Schema.Types.Mixed,
    thresholds: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
AISystemMetricsSchema.index({ recordedAt: -1 });
AISystemMetricsSchema.index({ 'systemHealth.status': 1 });
AISystemMetricsSchema.index({ 'systemHealth.overallScore': -1 });
AISystemMetricsSchema.index({ environment: 1 });

export default mongoose.model('AISystemMetrics', AISystemMetricsSchema);
