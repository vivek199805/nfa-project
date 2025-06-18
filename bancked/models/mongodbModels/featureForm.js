// models/FeatureForm.ts
import mongoose from 'mongoose';
import producerSchema from '../mongodbModels/producer.js';
import directorSchema from '../mongodbModels/director.js';
import songSchema from '../mongodbModels/song.js';
import actorSchema from '../mongodbModels/actor.js';
import audiographerSchema from '../mongodbModels/audiographer.js';
import documentSchema from '../mongodbModels/document.js';

const featureFormSchema = new mongoose.Schema(
  {
    step: { type: String, default: '1' },
    film_type: { type: String, default: null },
    active_step: { type: String, default: '1' },
    payment_status: { type: String, default: null },
    status: { type: String, default: '1' },

    client_id: { type: String, default: '1' },
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

    censor_certificate_nom: { type: String, default: '' },
    censor_certificate_date: { type: Date, default: null },
    censor_certificate_file: { type: String, default: null },

    title_registratin_detils: { type: String, default: '' },
    payment_date: { type: Date, default: null },
    amount: { type: String, default: '' },
    reference_number: { type: String, default: '' },
    receipt: { type: String, default: null },
    company_reg_details: { type: String, default: '' },
    company_reg_doc: { type: String, default: null },

    original_screenplay_name: { type: String, default: '' },
    adapted_screenplay_name: { type: String, default: '' },
    story_writer_name: { type: String, default: '' },
    work_under_public_domain: { type: Boolean, default: false },
    original_work_copy: { type: String, default: null },

    dialogue: { type: String, default: '' },
    cinemetographer: { type: String, default: '' },
    editor: { type: String, default: '' },
    costume_designer: { type: String, default: '' },
    animator: { type: String, default: '' },
    vfx_supervisor: { type: String, default: '' },
    stunt_choreographer: { type: String, default: '' },
    music_director: { type: String, default: '' },
    special_effect_creator: { type: String, default: '' },
    shot_digital_video_format: { type: Boolean, default: false },
    production_designer: { type: String, default: '' },
    make_up_director: { type: String, default: '' },
    choreographer: { type: String, default: '' },

    return_name: { type: String, default: '' },
    return_mobile: { type: String, default: '' },
    return_address: { type: String, default: '' },
    return_fax: { type: String, default: '' },
    return_email: { type: String, default: '' },
    return_pincode: { type: String, default: '' },
    return_website: { type: String, default: '' },

    declaration_one: { type: Boolean, default: false },
    declaration_two: { type: Boolean, default: false },
    declaration_three: { type: Boolean, default: false },
    declaration_four: { type: Boolean, default: false },
    declaration_five: { type: Boolean, default: false },
    declaration_six: { type: Boolean, default: false },
    declaration_seven: { type: Boolean, default: false },
    declaration_eight: { type: Boolean, default: false },
    declaration_nine: { type: Boolean, default: false },
    declaration_ten: { type: Boolean, default: false },
    declaration_eleven: { type: Boolean, default: false },
    declaration_twelve: { type: Boolean, default: false },

    producers: { type: [producerSchema], default: [] },
    directors: { type: [directorSchema], default: [] },
    songs: { type: [songSchema], default: [] },
    actors: { type: [actorSchema], default: [] },
    audiographer: { type: [audiographerSchema], default: [] },
    documents: { type: [documentSchema], default: [] },
     non_audiographer: { type: String, default: '' },

    payment_response: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export const FeatureForm = mongoose.model('FeatureForm', featureFormSchema);
