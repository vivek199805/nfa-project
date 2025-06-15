// models/Producer.ts
import mongoose from 'mongoose';
import documentSchema from '../mongodbModels/document.js';

const producerSchema = new mongoose.Schema({
  address: String,
  contact_nom: String,
  country_of_nationality: String,
  name: String,
  email: String,
  pincode: String,
  nfa_feature_id: String,
  producer_self_attested_doc: String,
  indian_national: Number,
  receive_producer_award: Number,
  production_company: String,
  documents: [documentSchema],
}, { timestamps: true });

export default producerSchema;
