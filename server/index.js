const express = require('express');
const cors = require('cors');
require('dotenv').config(); // এটি সবার উপরে থাকতে হবে 👈
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
connectDB(); // এখানে কানেক্ট হওয়ার সময় সে .env ফাইলটি খুঁজবে

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('Server is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
