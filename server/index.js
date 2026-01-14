require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');

// ১. অ্যাপ তৈরি
const app = express();

// ২. ডাটাবেজ কানেক্ট
connectDB();

// ৩. মিডলওয়্যারগুলো
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'user-role', 'Authorization'],
  })
);
app.use(express.json());

// --- ৪. মডেলগুলো ডিফাইন করা (FIXED: Genre Schema added) ---

// UserStats Model
const UserStats =
  mongoose.models.UserStats ||
  mongoose.model(
    'UserStats',
    new mongoose.Schema(
      {
        userEmail: { type: String, required: true, unique: true },
        annualGoal: { type: Number, default: 50 },
        readingStreak: { type: Number, default: 0 },
      },
      { timestamps: true }
    )
  );

// Genre Model (এরর কমানোর জন্য এটি যোগ করা হয়েছে)
const Genre =
  mongoose.models.Genre ||
  mongoose.model(
    'Genre',
    new mongoose.Schema({
      name: { type: String, required: true, unique: true },
    })
  );

// --- ৫. রাউট লজিক ---

// স্ট্যাটস রাউট সরাসরি ডিফাইন করা
app.get('/api/stats/:email', async (req, res) => {
  try {
    let stats = await UserStats.findOne({ userEmail: req.params.email });
    if (!stats) stats = await UserStats.create({ userEmail: req.params.email });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/stats/update-goal', async (req, res) => {
  const { email, newGoal } = req.body;
  try {
    const updatedStats = await UserStats.findOneAndUpdate(
      { userEmail: email },
      { annualGoal: newGoal },
      { new: true, upsert: true }
    );
    res.json(updatedStats);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ১. সব জেনার পাওয়ার রাউট (FIXED: Genre is now defined)
app.get('/api/genres', async (req, res) => {
  try {
    const genres = await Genre.find();
    res.json(genres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ২. নতুন জেনার এড করার রাউট
app.post('/api/genres/add', async (req, res) => {
  try {
    const newGenre = new Genre({ name: req.body.name });
    await newGenre.save();
    res.status(201).json(newGenre);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ৩. জেনার এডিট করার রাউট
app.put('/api/genres/:oldName', async (req, res) => {
  try {
    const updatedGenre = await Genre.findOneAndUpdate(
      { name: req.params.oldName },
      { name: req.body.newName },
      { new: true }
    );
    res.json(updatedGenre);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
app.post('/api/books/:id/review', async (req, res) => {
  const { userId, userName, rating, comment } = req.body;
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).send('Book not found');

    book.reviews.push({
      userId,
      userName,
      rating,
      comment,
      status: 'pending', // default pending
    });

    await book.save();
    res.status(200).json({ message: 'Review submitted for approval' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/api/reviews/pending', async (req, res) => {
  try {
    const books = await Book.find({});
    const pendingReviews = [];

    books.forEach((book) => {
      (book.reviews || []).forEach((rev) => {
        if (rev.status === 'pending') {
          pendingReviews.push({
            ...rev.toObject(),
            bookId: book._id,
            bookTitle: book.title,
          });
        }
      });
    });

    res.json(pendingReviews);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- ৬. অন্যান্য রাউটগুলো ইমপোর্ট ও ব্যবহার করা ---
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tutorialRoutes = require('./routes/tutorialRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tutorials', tutorialRoutes);

app.get('/', (req, res) => res.send('Server is running'));

// ৭. সার্ভার পোর্ট সেটআপ
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
