import { validateContributorPayload } from "../../helpers/contributorSchemaHelper.js";
import { getUserId, sendServiceResponse } from "../../helpers/controllerHelper.js";
import { errorResponse, sendValidationError } from "../../helpers/responseHelper.js";
import {
  deleteFeatureContributorService,
  listFeatureContributorsService,
  saveFeatureContributorService,
} from "../../services/featureContributor.service.js";

const getAllDirectorsByFeatureId = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["id"],
  });
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await listFeatureContributorsService({
      featureId: req.body.id,
      filmType: req.body.film_type,
      userId: getUserId(req),
      contributorType: "directors",
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const addDirectorToFeature = async (req, res) => {
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
      contributorType: "directors",
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const deleteDirectorById = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["nfa_feature_id", "directorId"],
  });
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await deleteFeatureContributorService({
      featureId: req.body.nfa_feature_id,
      contributorId: req.body.directorId,
      userId: getUserId(req),
      contributorType: "directors",
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export default {
  getAllDirectorsByFeatureId,
  addDirectorToFeature,
  deleteDirectorById,
};
