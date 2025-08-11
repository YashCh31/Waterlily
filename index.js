const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// JWT Secret - In production, use environment variable
const JWT_SECRET = 'your-secret-key-change-in-production';

const client = new Client({
  user: 'yashwanthchandolu',
  host: 'localhost',
  database: 'waterlily',
  password: '', //use your password 
  port: 5432,
});

// Connect to the PostgreSQL database
client.connect().then(() => {
  console.log('Connected to the database');
}).catch((err) => {
  console.error('Connection error', err.stack);
});

// Create tables
async function createTables() {
  try {
    await client.query(`
      -- Drop existing responses table if it has wrong foreign key
      DROP TABLE IF EXISTS responses;
      
      CREATE TABLE IF NOT EXISTS auth_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        auth_user_id INTEGER REFERENCES auth_users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        input_type VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        field VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY, 
	    user_id INTEGER NOT NULL REFERENCES auth_users(id), 
	    question_id INTEGER NOT NULL REFERENCES questions(id), 
	    answer TEXT,
	    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tables created successfully');
  } catch (err) {
    console.error('Error creating tables', err.stack);
  }
}


async function seedQuestions() {
    // Check if questions already exist
    const existingQuestions = await client.query('SELECT COUNT(*) FROM questions');
    if (parseInt(existingQuestions.rows[0].count) > 0) {
        console.log('Questions already exist, skipping seeding');
        return;
    }

    const questions = [
        {
            title: 'Name',
            description: 'Please provide your full name.',
            input_type: 'text',
            field: 'Personal Information'
        },
        {
            title: 'Age',
            description: 'Please provide your age in years.',
            input_type: 'number',
            field: 'Personal Information'
        },
        {
            title: 'Email Address',
            description: 'Please provide your email address.',
            input_type: 'email',
            field: 'Personal Information'
        },
        {
            title: 'Phone Number',
            description: 'Please provide your phone number.',
            input_type: 'tel',
            field: 'Personal Information'
        },
        {
            title: 'Address',
            description: 'Please provide your address.',
            input_type: 'text',
            field: 'Personal Information'
        },

        {
            title: 'Gender',
            description: 'Please select your gender.',
            input_type: 'text',
            field: 'Demographic Information'
        },
        {
            title: 'Ethnicity',
            description: 'Please select your ethnicity.',
            input_type: 'text',
            field: 'Demographic Information'
        },
        {
            title: 'Country of Residence',
            description: 'Please select your country of residence.',
            input_type: 'text',
            field: 'Demographic Information'
        },
        {
            title: 'Highest Education',
            description: 'Please select your highest level of education.',
            input_type: 'text',
            field: 'Demographic Information'
        },
        {
            title: 'Employment Status',
            description: 'Please select your employment status.',
            input_type: 'text',
            field: 'Demographic Information'
        },

        {
            title: 'General Health Status',
            description: 'Please select your general health status.',
            input_type: 'text',
            field: 'Health Information'
        },
        {
            title: 'Chronic Conditions',
            description: 'Please list any chronic conditions you have.',
            input_type: 'text',
            field: 'Health Information'
        },
        {
            title: 'Primary Health Provider',
            description: 'Please list your primary health care provider.',
            input_type: 'text',
            field: 'Health Information'
        },
        {
            title: 'Medications',
            description: 'Please list any medications you are currently taking.',
            input_type: 'text',
            field: 'Health Information'
        },
        {
            title: 'Physical Activity Level',
            description: 'Please describe your physical activity level.',
            input_type: 'text',
            field: 'Health Information'
        },

        {
            title: 'Income Level',
            description: 'Please describe your income level.',
            input_type: 'text',
            field: 'Financial Information'
        },
        {
            title: 'Healthcare Debt',
            description: 'Please describe your healthcare debt situation.',
            input_type: 'text',
            field: 'Financial Information'
        },
        {
            title: 'FICA and Medicare Savings',
            description: 'Please describe your FICA and Medicare savings.',
            input_type: 'text',
            field: 'Financial Information'
        },
        {
            title: 'Access to Financial Resources',
            description: 'Do you have any health insurance? If yes, please specify the insurance details.',
            input_type: 'text',
            field: 'Financial Information'
        }
    ];

    for (const question of questions) {
        const { title, description, input_type, field } = question;
        try {
            await client.query(
                'INSERT INTO questions (title, description, input_type, field) VALUES ($1, $2, $3, $4)',
                [title, description, input_type, field]
            );
            console.log(`Inserted question: ${title}`);
        } catch (err) {
            console.error('Error seeding questions', err.stack);
        }
    }
}

// Initialise the database
async function initDatabase() {
  await createTables();
  await seedQuestions();
  console.log('Database initialized successfully');
}

initDatabase();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Authentication endpoints

// Register new user
app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if username already exists
    const existingUser = await client.query(
      'SELECT id FROM auth_users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await client.query(
      'INSERT INTO auth_users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, passwordHash]
    );

    const user = result.rows[0];
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Error registering user', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Login user
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Find user
    const result = await client.query(
      'SELECT id, username, password_hash, created_at FROM auth_users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Error logging in user', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Verify token endpoint
app.get('/auth/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      username: req.user.username
    }
  });
});

// Endpoints 

// Endpoint to get all the users
app.get('/users', authenticateToken, async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Endpoint to create a new user (for surveys)
app.post('/users', authenticateToken, async (req, res) => {
  try {
    console.log("Creating survey user for authenticated user:", req.user.username);
    const result = await client.query(
      'INSERT INTO users (auth_user_id, created_at) VALUES ($1, NOW()) RETURNING *',
      [req.user.id]
    );
    console.log("Survey user created successfully", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating survey user', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Endpoint to get all the questions
app.get('/questions', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM questions ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching questions', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Endpoint to submit the answers
app.post('/user-answers', authenticateToken, async (req, res) => {
  const { answer } = req.body;
  
  console.log('Received request body:', JSON.stringify(req.body, null, 2));
  console.log('Authenticated user:', req.user);
  
  if (!answer || !Array.isArray(answer)) {
    return res.status(400).json({ error: 'Invalid request format. Expected answer array.' });
  }

  try {
    // Use the authenticated user's ID directly
    const user_id = req.user.id;

    const results = [];
    
    // Insert each answer into the responses table
    for (const answerItem of answer) {
      const { question_id, answer: answerText } = answerItem;
      
      if (!question_id || answerText === undefined) {
        continue; // Skip invalid answers
      }
      
      const result = await client.query(
        'INSERT INTO responses (user_id, question_id, answer) VALUES ($1, $2, $3) RETURNING *',
        [user_id, question_id, answerText]
      );
      
      results.push(result.rows[0]);
    }
    
    console.log(`Successfully inserted ${results.length} answers for user ${user_id}`);
    res.status(201).json(results);
  } catch (err) {
    console.error('Error submitting user answers', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});


// Endpoint to get the answers or responses to the questions for a particular user_id
app.get('/user-answers/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  
  // Ensure user can only access their own data
  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ error: 'You can only access your own answers' });
  }
  
  try {
    const result = await client.query(`
      SELECT 
        r.id,
        r.user_id,
        r.question_id,
        r.answer,
        r.created_at,
        q.title,
        q.description,
        q.input_type,
        q.field
      FROM responses r
      JOIN questions q ON r.question_id = q.id
      WHERE r.user_id = $1
      ORDER BY q.id
    `, [userId]);

    console.log(`Fetched answers for user ${userId}:`, result.rows);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user answers', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
