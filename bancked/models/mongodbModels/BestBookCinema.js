import mongoose from 'mongoose';

const bestBookCinemaSchema = new mongoose.Schema({
  step: String,
  active_step: String,
  payment_status: String,
  status: String,
  client_id: String,
  author_name: String,
  author_contact: String,
  author_address: String,
  author_nationality_indian: { type: Boolean, default: true },
  author_profile: String,
  author_aadhaar_card: { type: String, default: null },
  payment_date: { type: Date, default: null },
  amount: { type: String, default: null },
  reference_number: { type: String, default: null },
  receipt: { type: String, default: null },
  declaration_one: Boolean,
  declaration_two: Boolean,
  declaration_three: Boolean,
  declaration_four: Boolean,
  // books: [bookSchema],
  // editors: [editorSchema],
  payment_response: { type: mongoose.Schema.Types.Mixed, default: null },
  documents: { type: Array, default: [] }
}, { timestamps: true });

export default mongoose.model('BestBookCinema', bestBookCinemaSchema);
