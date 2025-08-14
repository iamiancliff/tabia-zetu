import express from 'express'
import BehaviorPrediction from '../models/BehaviorPrediction.js'
import TeacherAction from '../models/TeacherAction.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Create a new behavior prediction
router.post('/', protect, async (req, res) => {
  try {
    const predictionData = req.body;
    
    // Add metadata
    predictionData.generatedAt = new Date();
    predictionData.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    
    const prediction = new BehaviorPrediction(predictionData);
    await prediction.save();

    const populatedPrediction = await BehaviorPrediction.findById(prediction._id)
      .populate('student', 'name grade')
      .populate('relatedBehaviors', 'behaviorType severity date');

    res.status(201).json(populatedPrediction);
  } catch (error) {
    console.error('Error creating behavior prediction:', error);
    res.status(500).json({ message: 'Error creating behavior prediction', error: error.message });
  }
});

// Get all behavior predictions
router.get('/', protect, async (req, res) => {
  try {
    const { 
      riskLevel, 
      isImplemented, 
      student,
      limit = 20, 
      page = 1,
      sortBy = 'generatedAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isActive: true };
    if (riskLevel) filter.riskLevel = riskLevel;
    if (isImplemented !== undefined) filter.isImplemented = isImplemented === 'true';
    if (student) filter.student = student;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const predictions = await BehaviorPrediction.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('student', 'name grade')
      .populate('implementedBy', 'name email')
      .populate('relatedBehaviors', 'behaviorType severity date');

    const total = await BehaviorPrediction.countDocuments(filter);

    // Always return a proper JSON structure
    res.json({
      predictions: predictions || [],
      pagination: {
        total: total || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((total || 0) / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching behavior predictions:', error);
    res.status(500).json({ 
      predictions: [], 
      pagination: { total: 0, page: 1, limit: 20, pages: 0 },
      message: 'Error fetching behavior predictions', 
      error: error.message 
    });
  }
});

// Get prediction by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const prediction = await BehaviorPrediction.findById(req.params.id)
      .populate('student', 'name grade')
      .populate('relatedBehaviors', 'behaviorType severity date')
      .populate('implementedBy', 'name email')
      .populate('relatedInsights', 'title type priority');

    if (!prediction) {
      return res.status(404).json({ message: 'Behavior prediction not found' });
    }

    res.json(prediction);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching behavior prediction', error: error.message });
  }
});

// Implement a prediction
router.post('/:id/implement', protect, async (req, res) => {
  try {
    const { implementedStrategies, notes } = req.body;
    
    const prediction = await BehaviorPrediction.findById(req.params.id);
    if (!prediction) {
      return res.status(404).json({ message: 'Behavior prediction not found' });
    }

    // Update prediction as implemented
    prediction.isImplemented = true;
    prediction.implementedAt = new Date();
    prediction.implementedBy = req.user.id;
    prediction.implementedStrategies = implementedStrategies;

    await prediction.save();

    // Create teacher action record
    const teacherAction = new TeacherAction({
      teacher: req.user.id,
      actionType: 'implement_prevention',
      title: `Implemented prevention for ${prediction.predictedBehavior}`,
      description: `Implemented prevention strategies for ${prediction.student.name}`,
      relatedPrediction: prediction._id,
      status: 'completed',
      completedAt: new Date(),
      priority: prediction.riskLevel === 'high' || prediction.riskLevel === 'critical' ? 'high' : 'medium',
      urgency: prediction.riskLevel === 'critical' ? 'critical' : 'high',
      details: {
        implementedStrategies,
        notes,
        riskLevel: prediction.riskLevel,
        predictedBehavior: prediction.predictedBehavior
      },
      outcome: {
        success: true,
        impact: 'positive',
        notes: `Prevention strategies implemented: ${implementedStrategies.join(', ')}`
      }
    });

    await teacherAction.save();

    res.json({ 
      message: 'Prediction implemented successfully',
      prediction,
      teacherAction
    });
  } catch (error) {
    res.status(500).json({ message: 'Error implementing prediction', error: error.message });
  }
});

// Update prediction outcome
router.post('/:id/outcome', protect, async (req, res) => {
  try {
    const { occurred, actualBehavior, severity, notes } = req.body;
    
    const prediction = await BehaviorPrediction.findById(req.params.id);
    if (!prediction) {
      return res.status(404).json({ message: 'Behavior prediction not found' });
    }

    prediction.outcome = {
      occurred,
      occurredAt: occurred ? new Date() : null,
      actualBehavior,
      severity,
      notes
    };

    // Calculate prediction accuracy
    if (occurred !== undefined) {
      if (occurred && prediction.predictedBehavior === actualBehavior) {
        prediction.predictionAccuracy = 'correct';
      } else if (occurred && prediction.predictedBehavior !== actualBehavior) {
        prediction.predictionAccuracy = 'partially_correct';
      } else {
        prediction.predictionAccuracy = 'incorrect';
      }
    }

    await prediction.save();

    res.json({ message: 'Outcome updated successfully', prediction });
  } catch (error) {
    res.status(500).json({ message: 'Error updating outcome', error: error.message });
  }
});

// Get predictions by student
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const predictions = await BehaviorPrediction.find({
      student: req.params.studentId,
      isActive: true
    })
    .sort({ generatedAt: -1 })
    .populate('relatedBehaviors', 'behaviorType severity date')
    .populate('relatedInsights', 'title type priority');

    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student predictions', error: error.message });
  }
});

// Get high-risk predictions
router.get('/high-risk/active', protect, async (req, res) => {
  try {
    const highRiskPredictions = await BehaviorPrediction.find({
      riskLevel: { $in: ['high', 'critical'] },
      isActive: true,
      isImplemented: false
    })
    .sort({ riskScore: -1, generatedAt: -1 })
    .populate('student', 'name grade')
    .populate('relatedBehaviors', 'behaviorType severity date');

    res.json(highRiskPredictions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching high-risk predictions', error: error.message });
  }
});

// Get prediction statistics
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const stats = await BehaviorPrediction.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalPredictions: { $sum: 1 },
          implementedPredictions: { $sum: { $cond: ['$isImplemented', 1, 0] } },
          highRiskPredictions: { $sum: { $cond: [{ $in: ['$riskLevel', ['high', 'critical']] }, 1, 0] } },
          averageRiskScore: { $avg: '$riskScore' },
          averageConfidence: { $avg: '$confidence' },
          byRiskLevel: {
            $push: {
              riskLevel: '$riskLevel',
              isImplemented: '$isImplemented',
              predictionAccuracy: '$predictionAccuracy'
            }
          }
        }
      }
    ]);

    const riskLevelBreakdown = await BehaviorPrediction.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 },
          implemented: { $sum: { $cond: ['$isImplemented', 1, 0] } },
          averageRiskScore: { $avg: '$riskScore' }
        }
      }
    ]);

    const accuracyBreakdown = await BehaviorPrediction.aggregate([
      { $match: { isActive: true, predictionAccuracy: { $ne: null } } },
      {
        $group: {
          _id: '$predictionAccuracy',
          count: { $sum: 1 }
        }
      }
    ]);

    // Always return a proper JSON structure
    res.json({
      overview: stats[0] || {
        totalPredictions: 0,
        implementedPredictions: 0,
        highRiskPredictions: 0,
        averageRiskScore: 0,
        averageConfidence: 0,
        byRiskLevel: []
      },
      riskLevelBreakdown: riskLevelBreakdown || [],
      accuracyBreakdown: accuracyBreakdown || []
    });
  } catch (error) {
    console.error('Error fetching prediction statistics:', error);
    res.status(500).json({ 
      overview: {
        totalPredictions: 0,
        implementedPredictions: 0,
        highRiskPredictions: 0,
        averageRiskScore: 0,
        averageConfidence: 0,
        byRiskLevel: []
      },
      riskLevelBreakdown: [],
      accuracyBreakdown: [],
      message: 'Error fetching prediction statistics', 
      error: error.message 
    });
  }
});

// Deactivate a prediction
router.delete('/:id', protect, async (req, res) => {
  try {
    const prediction = await BehaviorPrediction.findById(req.params.id);
    if (!prediction) {
      return res.status(404).json({ message: 'Behavior prediction not found' });
    }

    prediction.isActive = false;
    await prediction.save();

    res.json({ message: 'Behavior prediction deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating behavior prediction', error: error.message });
  }
});

export default router
