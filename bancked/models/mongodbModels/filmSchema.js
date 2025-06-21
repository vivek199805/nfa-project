import mongoose from 'mongoose';

const filmSchema = new mongoose.Schema(
  {
    film_title_roman: { type: String, default: '' },
    film_title_devnagri: { type: String, default: '' },
    film_title_english: { type: String, default: '' },
     language_id: {
    type: [String],
    default: [],
    set: (val) => {
      if (typeof val === 'string') {
        return val.split(',').map((item) => item.trim());
      }
      if (Array.isArray(val)) {
        return val.flatMap((v) =>
          typeof v === 'string' && v.includes(',')
            ? v.split(',').map((i) => i.trim())
            : [v]
        );
      }
      return [];
    },
  },
    english_subtitle: { type: String, default: '0' },
    director_debut: { type: String, default: '0' },
    nom_reels_tapes: { type: String, default: '' },
    aspect_ratio: { type: String, default: '' },
    format: { type: String, default: '' },
    sound_system: { type: String, default: '' },
    running_time: { type: String, default: '' },
    color_bw: { type: String, default: '' },
    film_synopsis: { type: String, default: '' },
   metadata: { type: mongoose.Schema.Types.ObjectId, ref: 'FeatureFormMetadata' },
  },
  { timestamps: true }
);

export const FilmFormData = mongoose.model('FilmFormData', filmSchema);