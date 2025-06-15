// models/Audiographer.ts
import mongoose from 'mongoose';

const audiographerSchema = new mongoose.Schema({
  nfa_feature_id: String,
  production_sound_recordist: String,
  sound_designer: String,
  re_recordist_filnal: String,
}, { timestamps: true });

export default audiographerSchema;
