import { validateContributorPayload } from "../../helpers/contributorSchemaHelper.js";
import { getUserId, sendServiceResponse } from "../../helpers/controllerHelper.js";
import { errorResponse, sendValidationError } from "../../helpers/responseHelper.js";
import {
  deleteFeatureContributorService,
  listFeatureContributorsService,
  saveFeatureContributorService,
} from "../../services/featureContributor.service.js";

const getAllProducersByFeatureId = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["id"],
  });
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await listFeatureContributorsService({
      featureId: req.body.id,
      filmType: req.body.film_type,
      userId: getUserId(req),
      contributorType: "producers",
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const addProducerToFeature = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["nfa_feature_id"],
    optionalIds: ["id"],
  });
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await saveFeatureContributorService({
      featureId: req.body.nfa_feature_id,
      contributorId: req.body.id,
      userId: getUserId(req),
      payload: req.body,
      files: req.files,
      contributorType: "producers",
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const deleteProducerById = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["nfa_feature_id", "producerId"],
  });
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await deleteFeatureContributorService({
      featureId: req.body.nfa_feature_id,
      contributorId: req.body.producerId,
      userId: getUserId(req),
      contributorType: "producers",
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export default {
  getAllProducersByFeatureId,
  addProducerToFeature,
  deleteProducerById,
};
