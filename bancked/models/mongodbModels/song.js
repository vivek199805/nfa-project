// models/Song.ts
import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  nfa_feature_id: Number,
  song_title: String,
  music_director: String,
  music_director_bkgd_music: String,
  lyricist: String,
  playback_singer_male: String,
  playback_singer_female: String,
}, { timestamps: true });

export default songSchema;
