const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// নতুন বই যুক্ত করা (শুধুমাত্র অ্যাডমিন করবে)
router.post('/add', async (req, res) => {
  try {
    const { title, author, genre, description, coverImage } = req.body;
    const newBook = new Book({ title, author, genre, description, coverImage });
    await newBook.save();
    res
      .status(201)
      .json({ message: 'Book added successfully!', book: newBook });
  } catch (err) {
    res.status(500).json({ message: 'Error adding book', error: err.message });
  }
});

// সব বইয়ের লিস্ট দেখা
router.get('/all', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching books' });
  }
});

module.exports = router;
