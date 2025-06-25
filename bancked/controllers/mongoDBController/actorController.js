import { FeatureForm } from "../../models/mongodbModels/featureForm.js";


const getAllActorsByFeatureId = async (req, res) => {
  const { id } = req.body;

  try {
    const feature = await FeatureForm.findById(id, "actors");
    console.log(feature);

    if (!feature) {
      return res.status(200).json({ message: "Records not found", statusCode: 201 });
    }

    res.status(200).json({
      message: "data fetch successfully",
      data: feature.actors,
      statusCode: 200,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Directors", message: error.message });
  }
};

const addActorToFeature = async (req, res) => {
  const { nfa_feature_id: _id, actorId } = req.body; // Producer data from client
  try {
    // Find the feature form by ID
    const feature = await FeatureForm.findById(_id);
    if (!feature) {
      return res.status(200).json({ message: "Feature form not found", statusCode: 201 });
    }
    if (actorId) {
      // ✅ Update existing producer
      const existingActor = feature.actors.id(actorId);
      if (!existingActor) {
        return res.status(200).json({ message: "actor not found", statusCode: 201 });
      }

      Object.entries(req.body).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'nfa_feature_id') {
          existingActor[key] = value;
        }
      });

    } else {
      // ✅ Add new producer
      feature.actors.push(req.body);
    }

    // Save the updated document
    await feature.save();
    const updatedData = feature.actors.map((item) => {
      const obj = item.toObject();
      obj.id = obj._id;
      delete obj._id;
      return obj;
    });

    res.status(200).json({
      message: actorId ? "actor updated successfully" : "actor added successfully",
      data: updatedData,
      statusCode: 200,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add producer", message: error.message });
  }
};

const deleteActorById = async (req, res) => {
  const { nfa_feature_id, actorId } = req.body;

  try {
    const feature = await FeatureForm.findById({ _id: nfa_feature_id });

    if (!feature) {
      return res.status(200).json({
        message: 'Feature form not found',
        statusCode: 203,
      });
    }

    // Find the producer by ID and remove it
    const actor = feature.actors.id(actorId);
    if (!actor) {
      return res.status(200).json({
        message: 'actor not found',
        statusCode: 203,
      });
    }

    actor.remove(); // Remove from embedded array

    await feature.save(); // Save the updated document

    return res.status(200).json({
      message: 'actor deleted successfully',
      statusCode: 200,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting producer',
      error: error.message,
      statusCode: 500,
    });
  }
};

export default {

  getAllActorsByFeatureId,
  addActorToFeature,
  deleteActorById,
};