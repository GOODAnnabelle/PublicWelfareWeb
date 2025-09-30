// Event API routes
const express = require('express');
const router = express.Router();
const eventDb = require('../models/event_db');

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await eventDb.getAllEvents();
    res.json(events);
  } catch (error) {
    console.error('Failed to get event list:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single event details
router.get('/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await eventDb.getEventById(eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Failed to get event details:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search events
router.get('/search/filter', async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      city: req.query.city,
      categoryId: req.query.categoryId
    };
    
    const events = await eventDb.searchEvents(filters);
    res.json(events);
  } catch (error) {
    console.error('Failed to search events:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await eventDb.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error('Failed to get category list:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;