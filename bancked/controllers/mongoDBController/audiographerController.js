import { validateContributorPayload } from "../../helpers/contributorSchemaHelper.js";
import { getUserId, sendServiceResponse } from "../../helpers/controllerHelper.js";
import { errorResponse, sendValidationError } from "../../helpers/responseHelper.js";
import {
  deleteFeatureContributorService,
  listFeatureContributorsService,
  saveFeatureContributorService,
} from "../../services/featureContributor.service.js";

const getAllAudiographerByFeatureId = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["id"],
  });
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await listFeatureContributorsService({
      featureId: req.body.id,
      userId: getUserId(req),
      contributorType: "audiographer",
    });
    return sendServiceResponse(res, result);
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

  try {
    const result = await saveFeatureContributorService({
      featureId: req.body.nfa_feature_id,
      contributorId: req.body.audiographerId,
      userId: getUserId(req),
      payload: req.body,
      files: req.files,
      contributorType: "audiographer",
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const deleteAudiographerById = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["nfa_feature_id", "audiographerId"],
  });
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await deleteFeatureContributorService({
      featureId: req.body.nfa_feature_id,
      contributorId: req.body.audiographerId,
      userId: getUserId(req),
      contributorType: "audiographer",
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export default {
  getAllAudiographerByFeatureId,
  addAudiographerToFeature,
  deleteAudiographerById,
};
