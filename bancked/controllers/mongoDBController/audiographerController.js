import { FeatureForm } from "../../models/mongodbModels/featureForm.js";

const getAllAudiographerByFeatureId = async (req, res) => {
    const { id } = req.body;

    try {
        const feature = await FeatureForm.findById(id, "audiographer");
        console.log(feature);

        if (!feature) {
            return res.status(200).json({ message: "Records not found", statusCode: 201 });
        }

        res.status(200).json({
            message: "data fetch successfully",
            data: feature.audiographer,
            statusCode: 200,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch audiographer", message: error.message });
    }
};

const addAudiographerToFeature = async (req, res) => {
    const { nfa_feature_id: _id, audiographerId } = req.body; // audiographer data from client
    try {
        // Find the feature form by ID
        const feature = await FeatureForm.findById(_id);
        if (!feature) {
            return res.status(200).json({ message: "Feature form not found", statusCode: 201 });
        }
        if (audiographerId) {
            // ✅ Update existing audiographer
            const existingAudiographer = feature.audiographer.id(audiographerId);
            if (!existingAudiographer) {
                return res.status(200).json({ message: "audiographer not found", statusCode: 201 });
            }

            Object.entries(req.body).forEach(([key, value]) => {
                if (key !== 'id' && key !== 'nfa_feature_id') {
                    existingAudiographer[key] = value;
                }
            });

        } else {
            // ✅ Add new Song
            feature.audiographer.push(req.body);
        }

        // Save the updated document
        await feature.save();
        const updatedData = feature.audiographer.map((item) => {
            const obj = item.toObject();
            obj.id = obj._id;
            delete obj._id;
            return obj;
        });

        res.status(200).json({
            message: audiographerId ? "audiographer updated successfully" : "audiographer added successfully",
            data: updatedData,
            statusCode: 200,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to add audiographer", message: error.message });
    }
};

const deleteAudiographerById = async (req, res) => {
    const { nfa_feature_id, audiographerId } = req.body;

    try {
        const feature = await FeatureForm.findById({ _id: nfa_feature_id });

        if (!feature) {
            return res.status(200).json({
                message: 'Feature form not found',
                statusCode: 203,
            });
        }

        // Find the audiographer by ID and remove it
        const audiographer = feature.audiographer.id(audiographerId);
        if (!audiographer) {
            return res.status(200).json({
                message: 'audiographer not found',
                statusCode: 203,
            });
        }

        audiographer.remove(); // Remove from embedded array

        await feature.save(); // Save the updated document

        return res.status(200).json({
            message: 'audiographer deleted successfully',
            statusCode: 200,
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error deleting audiographer',
            error: error.message,
            statusCode: 500,
        });
    }
};

export default {

    getAllAudiographerByFeatureId,
    addAudiographerToFeature,
    deleteAudiographerById,
};
