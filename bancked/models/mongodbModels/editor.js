import mongoose from 'mongoose';
const editorSchema = new mongoose.Schema({
  client_id: { type: String, default: null },
  best_book_cinema_id: { type: String, default: null },
  best_film_critic_id: { type: String, default: null },
  editor_name: { type: String, default: null },
  editor_email: { type: String, default: null },
  editor_mobile: { type: String, default: null },
  editor_landline: { type: String, default: null },
  editor_fax: { type: String, default: null },
  editor_address: { type: String, default: null },
  editor_citizenship: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model('Editor', editorSchema);