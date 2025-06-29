import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  context_id: Number,
  form_type: Number,
  document_type: Number,
  website_type: Number,
  file: String,
  name: String,
  created_by: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

const bestFilmCriticSchema = new mongoose.Schema({
  step: Number,
  active_step: Number,
  payment_status: { type: Number, default: null },
  status: Number,
  client_id: String,

  writer_name: String,
  article_title: String,
  article_language_id: [String],
  publication_date: Date,
  publication_name: String,
  rni: Number,
  rni_registration_no: { type: String, default: null },

  critic_name: String,
  critic_address: String,
  critic_contact: String,
  critic_indian_nationality: { type: Boolean, default: true },
  critic_profile: String,
  critic_aadhaar_card: { type: String, default: null },

  payment_date: { type: Date, default: null },
  amount: { type: String, default: null },
  reference_number: { type: String, default: null },
  receipt: { type: String, default: null },

  declaration_one: Boolean,
  declaration_two: Boolean,
  declaration_three: Boolean,
  declaration_four: Boolean,

  // editors: [editorSchema],
  documents: [documentSchema],
  payment_response: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

export default mongoose.model('BestFilmCritic', bestFilmCriticSchema);
