
const path = require('path');
const envPath = path.join(__dirname, '../.env');
console.log('Loading .env from:', envPath);
require('dotenv').config({ path: envPath });
console.log('SESSION_SECRET present:', !!process.env.SESSION_SECRET);
if (process.env.SESSION_SECRET) console.log('SESSION_SECRET length:', process.env.SESSION_SECRET.length);
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { list, put, del } = require('@vercel/blob'); // Added put just in case for uploads
const axios = require('axios');
const bcrypt = require('bcrypt');
const session = require('express-session');
const PGStore = require('connect-pg-simple')(session);
const { pool } = require('./db');
const app = express();

// --- Database Initialization ---
const { initializeDatabase } = require('./db-init');
const db = require('./db');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Database initialization is now handled in startServer() at the bottom of the file

// --- Session Middleware ---
if (!process.env.SESSION_SECRET) {
  console.warn('SESSION_SECRET not found in env, using default for dev.');
  process.env.SESSION_SECRET = 'supersecretkey12345';
}

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not set. Please set it in your .env file.');
}
app.use(session({
  store: new PGStore({
    pool: pool,
    tableName: 'user_sessions'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// --- CORS Configuration ---
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(bodyParser.json());

// --- Authentication Middleware ---
const requireAuth = (req, res, next) => {
  // AUTH DISABLED BY USER REQUEST
  return next();
};

// --- Keep-Alive / Health Check Endpoint ---
app.get('/api/keep-alive', async (req, res) => {
  try {
    // Simple query to keep DB connection active
    await db.query('SELECT 1');
    res.status(200).send('Alive');
  } catch (err) {
    console.error('Keep-alive ping failed:', err);
    // Still return 200 so Vercel Cron doesn't consider it a "failure" and spam logs, 
    // but log the error internally. The mere act of hitting the endpoint wakes the lambda.
    res.status(200).send('Waking up...');
  }
});

// --- API Routes ---

// Auth Routes
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (match) {
      req.session.userId = user.id;
      res.json({ success: true, message: 'Logged in successfully.' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to log out.' });
    }
    res.clearCookie('connect.sid'); // The default session cookie name
    res.json({ success: true, message: 'Logged out successfully.' });
  });
});

app.get('/api/check-auth', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ isAuthenticated: true });
  } else {
    res.json({ isAuthenticated: false });
  }
});

app.post('/api/reset-password-request', async (req, res) => {
  const { username, securityAnswer } = req.body;
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(securityAnswer, user.security_answer_hash);
    if (match) {
      // In a real app, generate a unique, single-use token
      req.session.resetToken = `${user.id}-${Date.now()}`;
      res.json({ success: true, resetToken: req.session.resetToken });
    } else {
      res.status(401).json({ success: false, message: 'Incorrect security answer.' });
    }
  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

app.post('/api/reset-password-confirm', async (req, res) => {
  const { username, newPassword, resetToken } = req.body;

  // Basic validation
  if (req.session.resetToken !== resetToken) {
    return res.status(401).json({ success: false, message: 'Invalid or expired reset token.' });
  }

  try {
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE username = $2', [newPasswordHash, username]);

    // Invalidate the token after use
    delete req.session.resetToken;

    res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Password reset confirmation error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// Instructors API (Read is public, Write is protected)
app.get('/api/instructors', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM instructors ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching instructors from DB:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    res.status(500).json({ success: false, message: 'Failed to fetch instructors.' });
  }
});

app.post('/api/instructors', requireAuth, async (req, res) => {
  const { name, bio, image } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO instructors (name, bio, image) VALUES ($1, $2, $3) RETURNING *',
      [name, bio, image]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating instructor in DB:', err);
    res.status(500).json({ success: false, message: 'Failed to create instructor.' });
  }
});

app.put('/api/instructors/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, bio, image } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE instructors SET name = $1, bio = $2, image = $3 WHERE id = $4 RETURNING *',
      [name, bio, image, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Instructor not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating instructor in DB:', err);
    res.status(500).json({ success: false, message: 'Failed to update instructor.' });
  }
});

app.delete('/api/instructors/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM instructors WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Instructor not found.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting instructor from DB:', err);
    res.status(500).json({ success: false, message: 'Failed to delete instructor.' });
  }
});

// Image Library API (Read is public)
// Image Library API (Read is public)

app.get('/api/images', async (req, res) => {
  try {
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    // Map Vercel Blob format to the format expected by the frontend
    const images = blobs.map(blob => ({
      id: blob.url, // Use URL as ID
      image_url: blob.url,
      uploaded_at: blob.uploadedAt
    }));
    res.json(images);
  } catch (err) {
    console.error('Error fetching images from Vercel Blob:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch images.' });
  }
});

// Generic Image Upload API (Protected)
app.post('/api/upload', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided.' });
  }
  try {
    const blob = await put(req.file.originalname, req.file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      allowOverwrite: true,
    });

    // Save the image URL to the library
    try {
      await db.query('INSERT INTO image_library (image_url) VALUES ($1) ON CONFLICT (image_url) DO NOTHING', [blob.url]);
    } catch (dbErr) {
      console.error('Error saving image to library:', dbErr);
      // Non-critical error, so we don't send a failure response to the client
    }

    res.status(200).json({ success: true, url: blob.url });
  } catch (err) {
    console.error('Error uploading image to Vercel Blob:', err);
    res.status(500).json({ success: false, message: 'Failed to upload image.' });
  }
});

app.delete('/api/images', requireAuth, async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, message: 'Image URL is required.' });
  }

  try {
    // Delete from Vercel Blob
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });

    // Delete from DB
    await db.query('DELETE FROM image_library WHERE image_url = $1', [url]);

    res.json({ success: true, message: 'Image deleted successfully.' });
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ success: false, message: 'Failed to delete image.' });
  }
});

// Page Content API (Read is public, Write is protected)
app.get('/api/content/:section_id', async (req, res) => {
  const { section_id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM page_content WHERE section_id = $1', [section_id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(`Error fetching content for section ${section_id}:`, {
      message: err.message,
      code: err.code,
      stack: err.stack,
      detail: err.detail // Postgres specific details often exist here
    });
    res.status(500).json({ success: false, message: 'Failed to fetch content.' });
  }
});

app.put('/api/content/:section_id', requireAuth, async (req, res) => {
  const { section_id } = req.params;
  const { content_type, content_value } = req.body;

  if (!content_type || content_value === undefined) {
    return res.status(400).json({ success: false, message: 'content_type and content_value are required.' });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO page_content (section_id, content_type, content_value)
         VALUES ($1, $2, $3)
         ON CONFLICT (section_id)
         DO UPDATE SET content_type = $2, content_value = $3
         RETURNING *`,
      [section_id, content_type, content_value]
    );
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(`Error upserting content for section ${section_id}:`, {
      message: err.message,
      code: err.code,
      stack: err.stack,
      detail: err.detail
    });
    res.status(500).json({ success: false, message: 'Failed to save content.' });
  }
});

app.post('/api/send-message', async (req, res) => {
  const { name, email, message } = req.body;
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('Webhook URL is not configured in environment variables.');
    return res.status(500).json({ success: false, message: 'Server configuration error.' });
  }

  try {
    await axios.post(webhookUrl, { name, email, message });
    console.log('Contact form data sent to webhook successfully.');
    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending data to webhook:', error.response ? error.response.data : error.message);
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

// Google Reviews API
app.get('/api/google-reviews', async (req, res) => {
  const { GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID } = process.env;

  if (!GOOGLE_PLACES_API_KEY || !GOOGLE_PLACE_ID) {
    console.log('Google Places API credentials not found.');
    return res.status(500).json({ success: false, message: 'API credentials not configured.' });
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${GOOGLE_PLACE_ID}&fields=name,rating,reviews&key=${GOOGLE_PLACES_API_KEY}`;

  try {
    const response = await axios.get(url);
    const place = response.data.result;

    if (place && place.reviews) {
      const fiveStarReviews = place.reviews.filter(review => review.rating === 5);
      res.json({ success: true, reviews: fiveStarReviews });
    } else {
      res.json({ success: true, reviews: [] });
    }
  } catch (error) {
    console.error('Error fetching Google Reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// Schedule API
app.get('/api/schedule', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM schedules ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching schedule:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch schedule.' });
  }
});

app.post('/api/schedule', requireAuth, async (req, res) => {
  const { day, time_range, class_name, description, category } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO schedules (day, time_range, class_name, description, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [day, time_range, class_name, description, category]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating schedule item:', err);
    res.status(500).json({ success: false, message: 'Failed to create schedule item.' });
  }
});

app.put('/api/schedule/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { day, time_range, class_name, description, category } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE schedules SET day = $1, time_range = $2, class_name = $3, description = $4, category = $5 WHERE id = $6 RETURNING *',
      [day, time_range, class_name, description, category, id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating schedule item:', err);
    res.status(500).json({ success: false, message: 'Failed to update schedule item.' });
  }
});

app.delete('/api/schedule/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM schedules WHERE id = $1', [id]);
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    console.error('Error deleting schedule item:', err);
    res.status(500).json({ success: false, message: 'Failed to delete schedule item.' });
  }
});

// Blogs API
app.get('/api/blogs', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM blogs ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch blogs.' });
  }
});

app.get('/api/blogs/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM blogs WHERE slug = $1', [slug]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch blog.' });
  }
});

app.post('/api/blogs', requireAuth, async (req, res) => {
  const { title, image_url, content } = req.body;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''); // Simple slugify
  try {
    const { rows } = await db.query(
      'INSERT INTO blogs (title, image_url, content, slug) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, image_url, content, slug]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).json({ success: false, message: 'Failed to create blog.' });
  }
});

app.put('/api/blogs/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, image_url, content } = req.body;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  try {
    const { rows } = await db.query(
      'UPDATE blogs SET title = $1, image_url = $2, content = $3, slug = $4 WHERE id = $5 RETURNING *',
      [title, image_url, content, slug, id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(500).json({ success: false, message: 'Failed to update blog.' });
  }
});

app.delete('/api/blogs/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM blogs WHERE id = $1', [id]);
    res.json({ success: true, message: 'Blog deleted' });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ success: false, message: 'Failed to delete blog.' });
  }
});


const IS_VERCEL = process.env.VERCEL === '1';

const startServer = async () => {
  try {
    // 1. Initialize Database
    console.log('Starting server initialization...');
    await initializeDatabase();
    console.log('Database initialization completed.');

    // 2. Check Environment Variables
    const requiredEnv = [
      'DATABASE_URL',
      'SESSION_SECRET',
      'BLOB_READ_WRITE_TOKEN',
      'GOOGLE_PLACES_API_KEY',
      'GOOGLE_PLACE_ID'
    ];
    const missingEnv = requiredEnv.filter(key => !process.env[key]);

    console.log('--- ENV DEBUG ---');
    requiredEnv.forEach(key => {
      const val = process.env[key];
      if (val) {
        console.log(`✅ ${key}: LOADED (${val.substring(0, 5)}...)`);
      } else {
        console.error(`❌ ${key}: NOT FOUND`);
      }
    });
    console.log('-----------------');

    if (missingEnv.length > 0) {
      console.warn(`⚠️  WARNING: Missing environment variables: ${missingEnv.join(', ')}`);
    } else {
      console.log('✅ All key environment variables are present.');
    }

    // 3. Start Server (if not Vercel)
    if (!IS_VERCEL) {
      const PORT = process.env.PORT || 3001;
      app.listen(PORT, () => {
        console.log(`Server is running for local development on http://localhost:${PORT}`);
      });
    }
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
