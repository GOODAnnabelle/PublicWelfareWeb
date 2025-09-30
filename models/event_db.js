// Database connection module
const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'charityevents_db'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Get all events
async function getAllEvents() {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, c.name as charity_name 
      FROM events e
      LEFT JOIN charities c ON e.charity_id = c.charity_id
      ORDER BY e.start_date ASC
    `);
    
    // Get categories for each event
    for (let event of rows) {
      const [categories] = await pool.query(`
        SELECT c.category_id, c.name, c.description
        FROM categories c
        JOIN event_categories ec ON c.category_id = ec.category_id
        WHERE ec.event_id = ?
      `, [event.event_id]);
      
      event.categories = categories;
    }
    
    return rows;
  } catch (error) {
    console.error('Failed to get event list:', error);
    throw error;
  }
}

// Get single event details
async function getEventById(eventId) {
  try {
    const [events] = await pool.query(`
      SELECT e.*, c.name as charity_name, c.description as charity_description, 
             c.logo_url, c.website, c.contact_email, c.contact_phone
      FROM events e
      LEFT JOIN charities c ON e.charity_id = c.charity_id
      WHERE e.event_id = ?
    `, [eventId]);
    
    if (events.length === 0) {
      return null;
    }
    
    const event = events[0];
    
    // Get event categories
    const [categories] = await pool.query(`
      SELECT c.category_id, c.name, c.description
      FROM categories c
      JOIN event_categories ec ON c.category_id = ec.category_id
      WHERE ec.event_id = ?
    `, [eventId]);
    
    event.categories = categories;
    
    return event;
  } catch (error) {
    console.error('Failed to get event details:', error);
    throw error;
  }
}

// Search events
async function searchEvents(filters) {
  try {
    let query = `
      SELECT e.*, c.name as charity_name 
      FROM events e
      LEFT JOIN charities c ON e.charity_id = c.charity_id
    `;
    
    const queryParams = [];
    const conditions = [];
    
    // Add date filtering
    if (filters.startDate) {
      conditions.push('e.start_date >= ?');
      queryParams.push(filters.startDate);
    }
    
    if (filters.endDate) {
      conditions.push('e.end_date <= ?');
      queryParams.push(filters.endDate);
    }
    
    // Add location filtering
    if (filters.city) {
      conditions.push('e.city LIKE ?');
      queryParams.push(`%${filters.city}%`);
    }
    
    // Add category filtering
    if (filters.categoryId) {
      query += `
        JOIN event_categories ec ON e.event_id = ec.event_id
      `;
      conditions.push('ec.category_id = ?');
      queryParams.push(filters.categoryId);
    }
    
    // Combine WHERE clause
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Add sorting
    query += ' ORDER BY e.start_date ASC';
    
    const [rows] = await pool.query(query, queryParams);
    
    // Get categories for each event
    for (let event of rows) {
      const [categories] = await pool.query(`
        SELECT c.category_id, c.name, c.description
        FROM categories c
        JOIN event_categories ec ON c.category_id = ec.category_id
        WHERE ec.event_id = ?
      `, [event.event_id]);
      
      event.categories = categories;
    }
    
    return rows;
  } catch (error) {
    console.error('Failed to search events:', error);
    throw error;
  }
}

// Get all categories
async function getAllCategories() {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    return rows;
  } catch (error) {
    console.error('Failed to get category list:', error);
    throw error;
  }
}

module.exports = {
  testConnection,
  getAllEvents,
  getEventById,
  searchEvents,
  getAllCategories
};