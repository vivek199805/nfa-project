import BestBookCinemaHelper from "../../helpers/BestBookCinemaHelper.js";
import { getUserId, missingFieldResponse, sendServiceResponse } from "../../helpers/controllerHelper.js";
import { errorResponse, sendValidationError } from "../../helpers/responseHelper.js";
import {
  createBestBookService,
  finalSubmitBestBookService,
  getBestBookByIdService,
  shouldValidateBestBookStep,
  updateBestBookService,
} from "../../services/bestBook.service.js";

const createBook = async (req, res) => {
  const { isValid, errors } = BestBookCinemaHelper.validateStepInput(req.body, req.files);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await createBestBookService({
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

  if (shouldValidateBestBookStep(String(req.body.step ?? ""))) {
    const { isValid, errors } = BestBookCinemaHelper.validateStepInput(req.body, req.files);
    if (!isValid) return sendValidationError(res, errors);
  }

  try {
    const result = await updateBestBookService({
      payload: req.body,
      files: req.files,
      userId: getUserId(req),
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const bestBookCinemaById = async (req, res) => {
  try {
    const result = await getBestBookByIdService({
      id: req.params.id,
      userId: getUserId(req),
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const finalSubmit = async (req, res) => {
  const { isValid, errors } = BestBookCinemaHelper.finalSubmitStep(req.body);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await finalSubmitBestBookService({
      id: req.body.id,
      userId: getUserId(req),
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export default {
  createBook,
  updateEntryById,
  bestBookCinemaById,
  finalSubmit,
};
