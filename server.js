if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // or require('bcryptjs') if you installed that

const indexRouter = require('./routes/index');
const User = require('./models/User');  // 👈 import User model

// --- Express setup ---
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));


const cookieParser = require('cookie-parser');
app.use(cookieParser());


// To parse JSON bodies (for API requests)
app.use(express.json());

// To parse form data (for EJS forms - optional but useful)
app.use(express.urlencoded({ extended: false }));

// --- MongoDB connection ---
const mongoUri = process.env.DATABASE_URL;
if (!mongoUri) {
  console.error('❌ DATABASE_URL is not set. Check your environment variables.');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log('Connected to Mongoose'))
  .catch((err) => console.error('MongoDB connection error:', err));

// --- Dummy posts data ---
const posts = [
  { username: 'vivek', title: 'post1' },
  { username: 'john', title: 'post2' },
];

// --- JWT auth middleware ---
function authenticateToken(req, res, next) {
  // Expect token in Authorization header: "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // second part

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    req.user = user; // { name: ... }
    next();
  });
}

function authenticateTokenFromCookie(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.error('JWT error:', err);
      return res.redirect('/login');
    }
    req.user = user;
    next();
  });
}


// --- Routes ---

// EJS home page
app.use('/', indexRouter);

// Get all posts (PROTECTED)
app.get('/posts', authenticateToken, (req, res) => {
  // Optionally, filter posts by logged in user
  // const userPosts = posts.filter(post => post.username === req.user.name);
  // res.json(userPosts);

  res.json(posts);
});

// Signup route (register new user)
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

    // Create user
    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route (issue JWT token)
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).render('login', { error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).render('login', { error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(403).render('login', { error: 'Incorrect password' });
    }

    const payload = { name: user.username, id: user._id };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1h',
    });

    // 👇 Set token in an HTTP-only cookie
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in render, false locally
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // Redirect to a protected page (e.g. posts or dashboard)
    res.redirect('/posts-page'); // we'll create this route/page
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).render('login', { error: 'Internal server error' });
  }
});


app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});



app.get('/posts-page', authenticateTokenFromCookie, (req, res) => {
  res.render('posts', { user: req.user, posts });
});


// Render Signup form
app.get('/signup', (req, res) => {
  res.render('signup');  // views/signup.ejs
});

// Render Login form
app.get('/login', (req, res) => {
  res.render('login');   // views/login.ejs
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
