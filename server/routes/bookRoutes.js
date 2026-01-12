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
router.post('/add', async (req, res) => {
  try {
    console.log('📥 Data from Frontend:', req.body); // এটি চেক করুন

    const { title, author, genre, coverImage, description } = req.body;

    // নতুন অবজেক্ট তৈরি
    const newBook = new Book({ title, author, genre, coverImage, description });

    const savedBook = await newBook.save();
    console.log('✅ Saved to DB:', savedBook);

    res.status(201).json(savedBook);
  } catch (err) {
    console.error('❌ Save Error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// সব বই পাওয়ার জন্য রাউট
router.get('/all', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }); // নতুন বই আগে দেখাবে
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// বই ডিলিট করার রাউট
router.delete('/:id', async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// বইয়ের তথ্য আপডেট করার রাউট
router.put('/:id', async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // এটি আপডেট হওয়া নতুন ডাটা রিটার্ন করবে
    );
    res.status(200).json(updatedBook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
