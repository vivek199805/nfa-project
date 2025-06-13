// models/Actor.ts
import mongoose from 'mongoose';

const actorSchema = new mongoose.Schema({
  nfa_feature_id: Number,
  actor_category_id: Number,
  name: String,
  screen_name: String,
  if_voice_dubbed: Boolean,
}, { timestamps: true });

export default actorSchema;
