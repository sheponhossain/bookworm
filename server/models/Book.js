const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  status: { type: String, default: 'pending' }, // approved/pending/rejected
  createdAt: { type: Date, default: Date.now },
});

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: String,
    coverImage: String,
    description: String,
    totalPages: { type: Number, default: 20 },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
