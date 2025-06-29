import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  client_id: String,
  best_book_cinemas_id: Number,
  book_title_original: String,
  book_title_english: String,
  english_translation_book: String,
  language_id: [String],
  author_name: String,
  page_count: Number,
  date_of_publication: Date,
  book_price: String,
}, { timestamps: true });

export default mongoose.model('Book', bookSchema);