// models/Producer.ts
import mongoose from 'mongoose';
import documentSchema from '../mongodbModels/document.js';

const producerSchema = new mongoose.Schema({
  client_id: Number,
  nfa_feature_id: Number,
  name: String,
  email: String,
  contact_nom: String,
  address: String,
  pincode: String,
  producer_self_attested_doc: String,
  indian_national: Boolean,
  country_of_nationality: String,
  receive_producer_award: Boolean,
  production_company: String,
  documents: [documentSchema],
}, { timestamps: true });

export default producerSchema;
