const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const Tutorial = require('../models/Tutorial');

// --- USER MANAGEMENT ---

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    await User.findByIdAndUpdate(req.params.id, { role });
    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating role' });
  }
});

// --- REVIEW MODERATION ---
router.get('/reviews/pending', async (req, res) => {
  try {
    const books = await Book.find({ 'reviews.isApproved': false });
    let pendingReviews = [];
    books.forEach((book) => {
      book.reviews.forEach((rev) => {
        if (!rev.isApproved) {
          pendingReviews.push({ ...rev._doc, bookId: book._id });
        }
      });
    });
    res.json(pendingReviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

router.put('/reviews/:id/approve', async (req, res) => {
  try {
    await Book.updateOne(
      { 'reviews._id': req.params.id },
      { $set: { 'reviews.$.isApproved': true } }
    );
    res.json({ message: 'Review Approved' });
  } catch (err) {
    res.status(500).json({ message: 'Approve failed' });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    await Book.updateOne(
      { 'reviews._id': req.params.id },
      { $pull: { reviews: { _id: req.params.id } } }
    );
    res.json({ message: 'Review Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book.reviews || []);
  } catch (err) {
    console.error('Review Fetch Error:', err);
    res.status(500).json({ message: 'Server Error while fetching reviews' });
  }
});

module.exports = router;
