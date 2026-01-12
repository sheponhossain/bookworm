const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  genre: String,
  coverImage: String,
  description: String,
});

// এটি 'books' নামে কালেকশন তৈরি করবে
module.exports = mongoose.model('Book', bookSchema);
