import { validateContributorPayload } from "../../helpers/contributorSchemaHelper.js";
import { getUserId, sendServiceResponse } from "../../helpers/controllerHelper.js";
import { errorResponse, sendValidationError } from "../../helpers/responseHelper.js";
import { deleteActorByIdService, getActorsByFeatureIdService, saveActorToFeatureService } from "../../services/featureActor.service.js";

const getAllActorsByFeatureId = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["id"],
  });

  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await getActorsByFeatureIdService({
      featureId: req.body.id,
      userId: getUserId(req),
    });

    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const addActorToFeature = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["nfa_feature_id"],
    optionalIds: ["actorId"],
  });

  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await saveActorToFeatureService({
      featureId: req.body.nfa_feature_id,
      actorId: req.body.actorId,
      userId: getUserId(req),
      payload: req.body,
    });

    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const deleteActorById = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["nfa_feature_id", "actorId"],
  });

  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await deleteActorByIdService({
      featureId: req.body.nfa_feature_id,
      actorId: req.body.actorId,
      userId: getUserId(req),
    });

    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export default {
  getAllActorsByFeatureId,
  addActorToFeature,
  deleteActorById,
};
