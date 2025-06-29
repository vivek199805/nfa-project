import mongoose from 'mongoose';
const editorSchema = new mongoose.Schema({
  client_id: String,
  best_book_cinema_id: String,
  best_film_critic_id: { type: String, default: null },
  editor_name: String,
  editor_email: String,
  editor_mobile: String,
  editor_landline: String,
  editor_fax: String,
  editor_address: String,
  editor_citizenship: String,
}, { timestamps: true });

export default mongoose.model('Editor', editorSchema);