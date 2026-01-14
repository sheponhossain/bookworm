const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/User');
const Tutorial = require('../models/Tutorial');
const { adminOnly } = require('../middlewares/auth');

router.get('/all', async (req, res) => {
  try {
    const { page = 1, limit = 15, genre = 'All' } = req.query;
    const skip = (page - 1) * limit;

    let filterQuery = {};
    if (genre && genre !== 'All') filterQuery.genre = genre;

    const totalBooks = await Book.countDocuments(filterQuery);
    const books = await Book.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const booksWithRating = books.map((book) => {
      const approvedReviews = book.reviews
        ? book.reviews.filter((r) => r.status === 'approved')
        : [];
      const totalReviews = approvedReviews.length;
      const avgRating =
        totalReviews > 0
          ? (
              approvedReviews.reduce((acc, rev) => acc + rev.rating, 0) /
              totalReviews
            ).toFixed(1)
          : 0;

      return {
        ...book._doc,
        reviews: approvedReviews,
        avgRating: Number(avgRating),
        totalReviews: totalReviews,
      };
    });

    res.status(200).json({
      books: booksWithRating,
      totalPages: Math.ceil(totalBooks / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const activeUsers = await User.countDocuments();
    const books = await Book.find();
    let totalReviews = 0;
    books.forEach((b) => (totalReviews += b.reviews ? b.reviews.length : 0));

    res.json({
      totalBooks,
      activeUsers,
      totalReviews,
      readingGoal: '85%',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/add', adminOnly, async (req, res) => {
  try {
    const newBook = new Book(req.body);
    await newBook.save();
    res.status(201).json({ success: true, message: 'Book added! 📚' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', adminOnly, async (req, res) => {
  try {
    await Book.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Updated! 📝' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted! 🗑️' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/users', adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/users/:id/role', adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    await User.findByIdAndUpdate(req.params.id, { role });
    res.json({ success: true, message: 'Role updated!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reviews/pending', async (req, res) => {
  try {
    const books = await Book.find({ 'reviews.status': 'pending' });

    let pendingReviews = [];
    books.forEach((book) => {
      book.reviews.forEach((rev) => {
        if (rev.status === 'pending') {
          pendingReviews.push({
            ...rev._doc,
            bookId: book._id,
            bookTitle: book.title,
          });
        }
      });
    });

    res.json(pendingReviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending reviews' });
  }
});

router.get('/admin/reviews/pending', adminOnly, async (req, res) => {
  try {
    const books = await Book.find({ 'reviews.isApproved': false });
    let pending = [];
    books.forEach((b) => {
      b.reviews.forEach((r) => {
        if (r.isApproved === false) {
          pending.push({ ...r._doc, bookId: b._id, bookTitle: b.title });
        }
      });
    });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put(
  '/admin/reviews/:bookId/:reviewId/approve',
  adminOnly,
  async (req, res) => {
    try {
      const { bookId, reviewId } = req.params;
      await Book.findOneAndUpdate(
        { _id: bookId, 'reviews._id': reviewId },
        { $set: { 'reviews.$.isApproved': true } }
      );
      res.json({ message: 'Review Approved! ✅' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);
/** @desc রিভিউ ডিলিট করা (Admin Only) */
router.delete(
  '/admin/reviews/:bookId/:reviewId',
  adminOnly,
  async (req, res) => {
    try {
      const { bookId, reviewId } = req.params;

      await Book.findByIdAndUpdate(bookId, {
        $pull: { reviews: { _id: reviewId } },
      });

      res.json({ message: 'Review Deleted Successfully! 🗑️' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);
// controllers/bookController.js
router.post('/:bookId/review', async (req, res) => {
  try {
    const { bookId } = req.params;
    const review = {
      _id: new mongoose.Types.ObjectId(),
      userId: req.body.userId,
      userName: req.body.userName,
      rating: req.body.rating,
      comment: req.body.comment,
      bookTitle: req.body.bookTitle,
      status: 'pending',
      createdAt: new Date(),
    };

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // 🔥 THIS LINE WAS MISSING
    book.reviews.push(review);

    await book.save();
    res.status(201).json({ message: 'Review submitted for approval' });
  } catch (err) {
    res.status(500).json({ message: 'Review failed' });
  }
});

router.put('/reviews/:reviewId/approve', async (req, res) => {
  try {
    const { reviewId } = req.params;

    const updatedBook = await Book.findOneAndUpdate(
      { 'reviews._id': reviewId },
      { $set: { 'reviews.$.status': 'approved' } },
      { new: true }
    );

    if (!updatedBook)
      return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review Approved Successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});
router.post('/:id/review', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const newReview = {
      userId: req.body.userId,
      userName: req.body.userName,
      rating: req.body.rating,
      comment: req.body.comment,
      status: 'pending',
      createdAt: new Date(),
    };

    book.reviews.push(newReview);
    await book.save();
    res.status(201).json({ message: 'Review added and pending for approval' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/tutorials', async (req, res) => {
  try {
    const tutorials = await Tutorial.find().sort({ createdAt: -1 });
    res.json(tutorials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/tutorials', adminOnly, async (req, res) => {
  try {
    const newTut = new Tutorial(req.body);
    await newTut.save();
    res.status(201).json({ message: 'Tutorial added! 🎥' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
