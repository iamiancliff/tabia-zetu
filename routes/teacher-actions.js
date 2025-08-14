import express from 'express'
import TeacherAction from '../models/TeacherAction.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Get all teacher actions
router.get('/', protect, async (req, res) => {
  try {
    const { 
      actionType, 
      status, 
      priority,
      limit = 20, 
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { teacher: req.user.id };
    if (actionType) filter.actionType = actionType;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const actions = await TeacherAction.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('relatedInsight', 'title type priority')
      .populate('relatedPrediction', 'predictedBehavior riskLevel')
      .populate('collaborators.user', 'name email');

    const total = await TeacherAction.countDocuments(filter);

    // Always return a proper JSON structure
    res.json({
      actions: actions || [],
      pagination: {
        total: total || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((total || 0) / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching teacher actions:', error);
    res.status(500).json({ 
      actions: [], 
      pagination: { total: 0, page: 1, limit: 20, pages: 0 },
      message: 'Error fetching teacher actions', 
      error: error.message 
    });
  }
});

// Get action by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const action = await TeacherAction.findById(req.params.id)
      .populate('relatedInsight', 'title type priority actions')
      .populate('relatedPrediction', 'predictedBehavior riskLevel preventionStrategies')
      .populate('collaborators.user', 'name email')
      .populate('followUpActions.assignedTo', 'name email');

    if (!action) {
      return res.status(404).json({ message: 'Teacher action not found' });
    }

    // Ensure only the owner can view the action
    if (action.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(action);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher action', error: error.message });
  }
});

// Create a new teacher action
router.post('/', protect, async (req, res) => {
  try {
    const {
      actionType,
      title,
      description,
      details,
      priority,
      urgency,
      plannedAt,
      relatedInsight,
      relatedPrediction,
      tags,
      category,
      subcategory
    } = req.body;

    const action = new TeacherAction({
      teacher: req.user.id,
      actionType,
      title,
      description,
      details,
      priority: priority || 'medium',
      urgency: urgency || 'medium',
      plannedAt: plannedAt ? new Date(plannedAt) : null,
      relatedInsight,
      relatedPrediction,
      tags: tags || [],
      category,
      subcategory
    });

    await action.save();

    const populatedAction = await TeacherAction.findById(action._id)
      .populate('relatedInsight', 'title type priority')
      .populate('relatedPrediction', 'predictedBehavior riskLevel');

    res.status(201).json({
      message: 'Teacher action created successfully',
      action: populatedAction
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating teacher action', error: error.message });
  }
});

// Update action status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, startedAt, completedAt, duration } = req.body;
    
    const action = await TeacherAction.findById(req.params.id);
    if (!action) {
      return res.status(404).json({ message: 'Teacher action not found' });
    }

    // Ensure only the owner can update the action
    if (action.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    action.status = status;
    
    if (status === 'in_progress' && startedAt) {
      action.startedAt = new Date(startedAt);
    }
    
    if (status === 'completed' && completedAt) {
      action.completedAt = new Date(completedAt);
      if (action.startedAt) {
        action.duration = Math.round((action.completedAt - action.startedAt) / (1000 * 60)); // Convert to minutes
      }
    }
    
    if (duration) {
      action.duration = duration;
    }

    await action.save();

    res.json({ message: 'Action status updated successfully', action });
  } catch (error) {
    res.status(500).json({ message: 'Error updating action status', error: error.message });
  }
});

// Update action outcome
router.patch('/:id/outcome', protect, async (req, res) => {
  try {
    const { success, impact, notes, metrics } = req.body;
    
    const action = await TeacherAction.findById(req.params.id);
    if (!action) {
      return res.status(404).json({ message: 'Teacher action not found' });
    }

    // Ensure only the owner can update the action
    if (action.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    action.outcome = {
      success,
      impact,
      notes,
      metrics
    };

    await action.save();

    res.json({ message: 'Action outcome updated successfully', action });
  } catch (error) {
    res.status(500).json({ message: 'Error updating action outcome', error: error.message });
  }
});

// Add follow-up action
router.post('/:id/follow-up', protect, async (req, res) => {
  try {
    const { action, dueDate, assignedTo } = req.body;
    
    const teacherAction = await TeacherAction.findById(req.params.id);
    if (!teacherAction) {
      return res.status(404).json({ message: 'Teacher action not found' });
    }

    // Ensure only the owner can add follow-up actions
    if (teacherAction.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    teacherAction.followUpActions.push({
      action,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo
    });

    await teacherAction.save();

    res.json({ message: 'Follow-up action added successfully', action: teacherAction });
  } catch (error) {
    res.status(500).json({ message: 'Error adding follow-up action', error: error.message });
  }
});

// Update follow-up action status
router.patch('/:id/follow-up/:followUpId', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    const teacherAction = await TeacherAction.findById(req.params.id);
    if (!teacherAction) {
      return res.status(404).json({ message: 'Teacher action not found' });
    }

    // Ensure only the owner can update the action
    if (teacherAction.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const followUpAction = teacherAction.followUpActions.id(req.params.followUpId);
    if (!followUpAction) {
      return res.status(404).json({ message: 'Follow-up action not found' });
    }

    followUpAction.status = status;
    await teacherAction.save();

    res.json({ message: 'Follow-up action status updated successfully', action: teacherAction });
  } catch (error) {
    res.status(500).json({ message: 'Error updating follow-up action status', error: error.message });
  }
});

// Provide feedback on action
router.post('/:id/feedback', protect, async (req, res) => {
  try {
    const { effectiveness, difficulty, timeInvestment, comments } = req.body;
    
    const action = await TeacherAction.findById(req.params.id);
    if (!action) {
      return res.status(404).json({ message: 'Teacher action not found' });
    }

    // Ensure only the owner can provide feedback
    if (action.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    action.feedback = {
      effectiveness,
      difficulty,
      timeInvestment,
      comments,
      feedbackAt: new Date()
    };

    await action.save();

    res.json({ message: 'Feedback submitted successfully', action });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting feedback', error: error.message });
  }
});

// Get action statistics
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const stats = await TeacherAction.aggregate([
      { $match: { teacher: req.user.id } },
      {
        $group: {
          _id: null,
          totalActions: { $sum: 1 },
          completedActions: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inProgressActions: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          plannedActions: { $sum: { $cond: [{ $eq: ['$status', 'planned'] }, 1, 0] } },
          highPriorityActions: { $sum: { $cond: [{ $in: ['$priority', ['high', 'critical']] }, 1, 0] } },
          averageCompletionTime: { $avg: '$duration' },
          byType: {
            $push: {
              actionType: '$actionType',
              status: '$status',
              priority: '$priority'
            }
          }
        }
      }
    ]);

    const typeBreakdown = await TeacherAction.aggregate([
      { $match: { teacher: req.user.id } },
      {
        $group: {
          _id: '$actionType',
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          averagePriority: { $avg: { $cond: [{ $eq: ['$priority', 'high'] }, 3, { $cond: [{ $eq: ['$priority', 'medium'] }, 2, 1] }] } }
        }
      }
    ]);

    const priorityBreakdown = await TeacherAction.aggregate([
      { $match: { teacher: req.user.id } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          averageCompletionTime: { $avg: '$duration' }
        }
      }
    ]);

    // Always return a proper JSON structure
    res.json({
      overview: stats[0] || {
        totalActions: 0,
        completedActions: 0,
        inProgressActions: 0,
        plannedActions: 0,
        highPriorityActions: 0,
        averageCompletionTime: 0,
        byType: []
      },
      typeBreakdown: typeBreakdown || [],
      priorityBreakdown: priorityBreakdown || []
    });
  } catch (error) {
    console.error('Error fetching action statistics:', error);
    res.status(500).json({ 
      overview: {
        totalActions: 0,
        completedActions: 0,
        inProgressActions: 0,
        plannedActions: 0,
        highPriorityActions: 0,
        averageCompletionTime: 0,
        byType: []
      },
      typeBreakdown: [],
      priorityBreakdown: [],
      message: 'Error fetching action statistics', 
      error: error.message 
    });
  }
});

// Delete a teacher action
router.delete('/:id', protect, async (req, res) => {
  try {
    const action = await TeacherAction.findById(req.params.id);
    if (!action) {
      return res.status(404).json({ message: 'Teacher action not found' });
    }

    // Ensure only the owner can delete the action
    if (action.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await TeacherAction.findByIdAndDelete(req.params.id);

    res.json({ message: 'Teacher action deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting teacher action', error: error.message });
  }
});

export default router
