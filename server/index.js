const express = require('express');
const cors = require('cors');
require('dotenv').config(); // এটি সবার উপরে থাকতে হবে 👈
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
app.use(cors());
app.use(express.json());
// const cors = require('cors');
// এই ফাইলটি আপনি তৈরি করেছিলেন
// ... অন্য কোড
// এটি নিশ্চিত করে যে /api/books/add কাজ করবে

// Database Connection
connectDB(); // এখানে কানেক্ট হওয়ার সময় সে .env ফাইলটি খুঁজবে

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

app.get('/', (req, res) => res.send('Server is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
