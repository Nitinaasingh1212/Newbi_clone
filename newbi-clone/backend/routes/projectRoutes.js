import express from 'express';
import Project from '../models/Project.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all projects
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching projects' });
  }
});

// GET project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching project' });
  }
});

// Admin create project
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error creating project' });
  }
});

export default router;
