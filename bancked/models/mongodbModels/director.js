// models/Director.ts
import mongoose from 'mongoose';
import documentSchema from '../mongodbModels/document.js';

const directorSchema = new mongoose.Schema({
  nfa_feature_id: String,
  name: String,
  email: String,
  contact_nom: String,
  address: String,
  pincode: String,
  director_self_attested_doc: String,
  receive_director_award: Boolean,
  indian_national: String,
  country_of_nationality: String,
  production_company: String,
  documents: [documentSchema],
}, { timestamps: true });

export default directorSchema;
