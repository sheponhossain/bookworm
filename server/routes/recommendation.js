const express = require('express');
const router = express.Router();
const UserLibrary = require('../models/UserLibrary');
const Book = require('../models/Book');

router.get('/personalized/:userId', async (req, res) => {
  try {
    const library = await UserLibrary.findOne({
      userId: req.params.userId,
    }).populate('books.bookId');

    const readBooks = library
      ? library.books.filter((b) => b.shelf === 'Read')
      : [];
    const readBookIds = library ? library.books.map((b) => b.bookId._id) : [];

    if (readBooks.length < 3) {
      const popularBooks = await Book.find()
        .sort({ averageRating: -1, rating: -1 })
        .limit(15);

      return res.json({
        type: 'Popular',
        books: popularBooks,
        reason:
          "Since you're new, here are some community favorites to start your journey!",
      });
    }

    const genreCount = {};
    readBooks.forEach((b) => {
      if (b.bookId && b.bookId.genre) {
        const genre = b.bookId.genre;
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      }
    });

    const topGenre = Object.keys(genreCount).reduce((a, b) =>
      genreCount[a] > genreCount[b] ? a : b
    );

    let recommendations = await Book.find({
      genre: topGenre,
      _id: { $nin: readBookIds },
    })
      .sort({ averageRating: -1 })
      .limit(15);

    if (recommendations.length < 15) {
      const additionalBooks = await Book.find({
        _id: { $nin: [...readBookIds, ...recommendations.map((b) => b._id)] },
        genre: { $ne: topGenre },
      })
        .sort({ averageRating: -1 })
        .limit(15 - recommendations.length);

      recommendations = [...recommendations, ...additionalBooks];
    }

    res.json({
      type: 'Personalized',
      books: recommendations,
      reason: `Matches your preference for ${topGenre} (${genreCount[topGenre]} books read) and other high-rated gems.`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
