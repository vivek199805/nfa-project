import { FeatureForm } from "../../models/mongodbModels/featureForm.js";
import { validateContributorPayload } from "../../helpers/contributorSchemaHelper.js";
import { errorResponse, sendJsonResponse, sendValidationError } from "../../helpers/responseHelper.js";

const getUserId = (req) => req.user?._id || req.user?.id;

const getAllAudiographerByFeatureId = async (req, res) => {
    const { isValid, errors } = validateContributorPayload(req.body, {
        requiredIds: ["id"],
    });
    if (!isValid) return sendValidationError(res, errors);

    const { id } = req.body;

    try {
        const feature = await FeatureForm.findOne({
            _id: id,
            client_id: getUserId(req),
        }, "audiographer");

        if (!feature) {
            return sendJsonResponse(res, 200, { message: "Records not found", statusCode: 203 });
        }

        return sendJsonResponse(res, 200, {
            message: "Data fetched successfully",
            data: feature.audiographer,
            statusCode: 200,
        });
    } catch (error) {
        return errorResponse(res, error);
    }
};

const addAudiographerToFeature = async (req, res) => {
    const { isValid, errors } = validateContributorPayload(req.body, {
        requiredIds: ["nfa_feature_id"],
        optionalIds: ["audiographerId"],
    });
    if (!isValid) return sendValidationError(res, errors);

    const { nfa_feature_id: _id, audiographerId } = req.body; // audiographer data from client
    try {
        // Find the feature form by ID
        const feature = await FeatureForm.findOne({
            _id,
            client_id: getUserId(req),
        });
        if (!feature) {
            return sendJsonResponse(res, 200, { message: "Feature form not found", statusCode: 203 });
        }
        if (audiographerId) {
            // Update existing audiographer
            const existingAudiographer = feature.audiographer.id(audiographerId);
            if (!existingAudiographer) {
                return sendJsonResponse(res, 200, { message: "audiographer not found", statusCode: 203 });
            }

            Object.entries(req.body).forEach(([key, value]) => {
                if (key !== 'id' && key !== 'nfa_feature_id') {
                    existingAudiographer[key] = value;
                }
            });

        } else {
            // Add new audiographer
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

        return sendJsonResponse(res, 200, {
            message: audiographerId ? "audiographer updated successfully" : "audiographer added successfully",
            data: updatedData,
            statusCode: 200,
        });
    } catch (error) {
        return errorResponse(res, error);
    }
};

const deleteAudiographerById = async (req, res) => {
    const { isValid, errors } = validateContributorPayload(req.body, {
        requiredIds: ["nfa_feature_id", "audiographerId"],
    });
    if (!isValid) return sendValidationError(res, errors);

    const { nfa_feature_id, audiographerId } = req.body;

    try {
        const feature = await FeatureForm.findOne({
            _id: nfa_feature_id,
            client_id: getUserId(req),
        });

        if (!feature) {
            return sendJsonResponse(res, 200, {
                message: 'Feature form not found',
                statusCode: 203,
            });
        }

        // Find the audiographer by ID and remove it
        const audiographer = feature.audiographer.id(audiographerId);
        if (!audiographer) {
            return sendJsonResponse(res, 200, {
                message: 'audiographer not found',
                statusCode: 203,
            });
        }

        feature.audiographer.pull(audiographerId); // Remove from embedded array

        await feature.save(); // Save the updated document

        return sendJsonResponse(res, 200, {
            message: 'audiographer deleted successfully',
            statusCode: 200,
        });

    } catch (error) {
        return errorResponse(res, error);
    }
};

export default {

    getAllAudiographerByFeatureId,
    addAudiographerToFeature,
    deleteAudiographerById,
};
