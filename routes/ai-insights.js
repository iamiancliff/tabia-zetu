import express from 'express'
import AIInsight from '../models/AIInsight.js'
import TeacherAction from '../models/TeacherAction.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Create a new AI insight
router.post('/', protect, async (req, res) => {
  try {
    const insightData = req.body;
    
    // Add metadata
    insightData.generatedAt = new Date();
    insightData.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    
    const insight = new AIInsight(insightData);
    await insight.save();

    const populatedInsight = await AIInsight.findById(insight._id)
      .populate('relatedStudents', 'name grade')
      .populate('relatedBehaviors', 'behaviorType severity date');

    res.status(201).json(populatedInsight);
  } catch (error) {
    res.status(500).json({ message: 'Error creating AI insight', error: error.message });
  }
});

// Get all AI insights
router.get('/', protect, async (req, res) => {
  try {
    const { 
      type, 
      priority, 
      isApplied, 
      limit = 20, 
      page = 1,
      sortBy = 'generatedAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isActive: true };
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (isApplied !== undefined) filter.isApplied = isApplied === 'true';

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const insights = await AIInsight.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('relatedStudents', 'name grade')
      .populate('appliedBy', 'name email');

    const total = await AIInsight.countDocuments(filter);

    // Always return a proper JSON structure
    res.json({
      insights: insights || [],
      pagination: {
        total: total || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((total || 0) / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    res.status(500).json({ 
      insights: [], 
      pagination: { total: 0, page: 1, limit: 20, pages: 0 },
      message: 'Error fetching AI insights', 
      error: error.message 
    });
  }
});

// Get AI insight by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const insight = await AIInsight.findById(req.params.id)
      .populate('relatedStudents', 'name grade')
      .populate('relatedBehaviors', 'behaviorType severity date')
      .populate('appliedBy', 'name email');

    if (!insight) {
      return res.status(404).json({ message: 'AI insight not found' });
    }

    res.json(insight);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching AI insight', error: error.message });
  }
});

// Apply an AI insight
router.post('/:id/apply', protect, async (req, res) => {
  try {
    const { appliedAction, feedback } = req.body;
    
    const insight = await AIInsight.findById(req.params.id);
    if (!insight) {
      return res.status(404).json({ message: 'AI insight not found' });
    }

    // Update insight as applied
    insight.isApplied = true;
    insight.appliedAt = new Date();
    insight.appliedBy = req.user.id;
    insight.appliedAction = appliedAction;
    
    if (feedback) {
      insight.teacherFeedback = {
        rating: feedback.rating,
        comment: feedback.comment,
        feedbackAt: new Date()
      };
    }

    await insight.save();

    // Create teacher action record
    const teacherAction = new TeacherAction({
      teacher: req.user.id,
      actionType: 'apply_recommendation',
      title: `Applied: ${insight.title}`,
      description: `Applied AI insight: ${appliedAction}`,
      relatedInsight: insight._id,
      status: 'completed',
      completedAt: new Date(),
      priority: insight.priority,
      urgency: insight.priority === 'high' || insight.priority === 'critical' ? 'high' : 'medium',
      outcome: {
        success: true,
        impact: 'positive',
        notes: `Successfully applied AI recommendation: ${appliedAction}`
      }
    });

    await teacherAction.save();

    res.json({ 
      message: 'AI insight applied successfully',
      insight,
      teacherAction
    });
  } catch (error) {
    res.status(500).json({ message: 'Error applying AI insight', error: error.message });
  }
});

// Provide feedback on AI insight
router.post('/:id/feedback', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const insight = await AIInsight.findById(req.params.id);
    if (!insight) {
      return res.status(404).json({ message: 'AI insight not found' });
    }

    insight.teacherFeedback = {
      rating,
      comment,
      feedbackAt: new Date()
    };

    await insight.save();

    res.json({ message: 'Feedback submitted successfully', insight });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting feedback', error: error.message });
  }
});

// Get insights by student
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const insights = await AIInsight.find({
      relatedStudents: req.params.studentId,
      isActive: true
    })
    .sort({ generatedAt: -1 })
    .populate('relatedBehaviors', 'behaviorType severity date');

    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student insights', error: error.message });
  }
});

// Get insights statistics
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const stats = await AIInsight.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalInsights: { $sum: 1 },
          appliedInsights: { $sum: { $cond: ['$isApplied', 1, 0] } },
          highPriorityInsights: { $sum: { $cond: [{ $in: ['$priority', ['high', 'critical']] }, 1, 0] } },
          averageConfidence: { $avg: '$confidence' },
          byType: {
            $push: {
              type: '$type',
              priority: '$priority',
              isApplied: '$isApplied'
            }
          }
        }
      }
    ]);

    const typeBreakdown = await AIInsight.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          applied: { $sum: { $cond: ['$isApplied', 1, 0] } }
        }
      }
    ]);

    const priorityBreakdown = await AIInsight.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          applied: { $sum: { $cond: ['$isApplied', 1, 0] } }
        }
      }
    ]);

    // Always return a proper JSON structure
    res.json({
      overview: stats[0] || {
        totalInsights: 0,
        appliedInsights: 0,
        highPriorityInsights: 0,
        averageConfidence: 0,
        byType: []
      },
      typeBreakdown: typeBreakdown || [],
      priorityBreakdown: priorityBreakdown || []
    });
  } catch (error) {
    console.error('Error fetching insights statistics:', error);
    res.status(500).json({ 
      overview: {
        totalInsights: 0,
        appliedInsights: 0,
        highPriorityInsights: 0,
        averageConfidence: 0,
        byType: []
      },
      typeBreakdown: [],
      priorityBreakdown: [],
      message: 'Error fetching insights statistics', 
      error: error.message 
    });
  }
});

// Deactivate an insight
router.delete('/:id', protect, async (req, res) => {
  try {
    const insight = await AIInsight.findById(req.params.id);
    if (!insight) {
      return res.status(404).json({ message: 'AI insight not found' });
    }

    insight.isActive = false;
    await insight.save();

    res.json({ message: 'AI insight deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating AI insight', error: error.message });
  }
});

export default router
