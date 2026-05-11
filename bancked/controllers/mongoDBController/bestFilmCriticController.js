import BestFilmCriticHelper from "../../helpers/bestFilmCriticHelper.js";
import { getUserId, missingFieldResponse, sendServiceResponse } from "../../helpers/controllerHelper.js";
import { errorResponse, sendValidationError } from "../../helpers/responseHelper.js";
import {
  createBestFilmCriticService,
  finalSubmitBestFilmCriticService,
  getBestFilmCriticByIdService,
  shouldValidateBestFilmCriticStep,
  updateBestFilmCriticService,
} from "../../services/bestFilmCritic.service.js";

const createFilmCritic = async (req, res) => {
  const { isValid, errors } = BestFilmCriticHelper.validateStepInput(req.body, req.files);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await createBestFilmCriticService({
      payload: req.body,
      userId: getUserId(req),
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const updateEntryById = async (req, res) => {
  const missingFields = ["id"].filter((field) => !req.body[field]);
  if (missingFields.length > 0) {
    return sendServiceResponse(res, missingFieldResponse(missingFields));
  }

  if (shouldValidateBestFilmCriticStep(String(req.body.step ?? ""))) {
    const { isValid, errors } = BestFilmCriticHelper.validateStepInput(req.body, req.files);
    if (!isValid) return sendValidationError(res, errors);
  }

  try {
    const result = await updateBestFilmCriticService({
      payload: req.body,
      files: req.files,
      userId: getUserId(req),
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const finalSubmit = async (req, res) => {
  const { isValid, errors } = BestFilmCriticHelper.finalSubmitStep(req.body);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await finalSubmitBestFilmCriticService({
      id: req.body.id,
      userId: getUserId(req),
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const bestFilmCriticById = async (req, res) => {
  try {
    const result = await getBestFilmCriticByIdService({
      id: req.params.id,
      userId: getUserId(req),
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export default {
  createFilmCritic,
  updateEntryById,
  bestFilmCriticById,
  finalSubmit,
};
