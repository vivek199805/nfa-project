import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  context_id: String,
  form_type: Number,
  document_type: Number,
  website_type: Number,
  file: String,
  name: String,
  created_by: String,
}, { timestamps: true });

export default documentSchema;

export const Document = mongoose.model('Document', documentSchema);