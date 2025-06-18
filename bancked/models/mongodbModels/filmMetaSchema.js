import mongoose from 'mongoose';

const featureFormMetadataSchema = new mongoose.Schema({
  step: { type: String, },
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'FilmFormData' },
  formData:{
   type: Object,
   default: {}
  }
}, { timestamps: true });

export const FeatureFormMetadata = mongoose.model('FeatureFormMetadata', featureFormMetadataSchema);