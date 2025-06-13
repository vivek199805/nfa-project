
import {FeatureForm} from '../../models/mongodbModels/featureForm.js';

// Create Feature Submission
 const createFeatureSubmission = async (req, res) => {
  try {
    console.log(req.body);
    
    const submission = await FeatureForm.create(req.body);
        res.status(200).json({ message: 'Logout successful', statusCode:200, data: submission});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create Non-Feature Submission
 const createNonFeatureSubmission = async (req, res) => {
  try {
    const submission = await FeatureForm.create(req.body);
    res.status(201).json(submission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all Feature Submissions
 const getFeatureSubmissions = async (req, res) => {
  try {
    const submissions = await FeatureForm.find().populate('producers directors songs actors audiographer documents');
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Non-Feature Submissions
 const getNonFeatureSubmissions = async (req, res) => {
  try {
    const submissions = await FeatureForm.find().populate('producers directors songs actors audiographer documents');
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createFeatureSubmission,
  createNonFeatureSubmission,
  getFeatureSubmissions,
  getNonFeatureSubmissions,
};
