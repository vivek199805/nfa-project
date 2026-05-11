import { getUserId, missingFieldResponse, sendServiceResponse } from "../../helpers/controllerHelper.js";
import { errorResponse, sendValidationError } from "../../helpers/responseHelper.js";
import NfaFilmHelper from "../../helpers/nfaFilmHelper.js";
import {
  createFilmSubmissionService,
  finalSubmitFilmService,
  getFilmDetailsByIdService,
  getFilmEntryListService,
  getNonFeatureSubmissionsService,
  shouldValidateFilmStep,
  updateFilmSubmissionService,
} from "../../services/film.service.js";

const createFeatureSubmission = async (req, res) => {
  const { isValid, errors } = NfaFilmHelper.validateStepInput(req.body, req.files);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await createFilmSubmissionService({
      payload: req.body,
      userId: getUserId(req),
      filmType: "feature",
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const createNonFeatureSubmission = async (req, res) => {
  const { isValid, errors } = NfaFilmHelper.validateStepInput(req.body, req.files);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await createFilmSubmissionService({
      payload: req.body,
      userId: getUserId(req),
      filmType: "non-feature",
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const getFilmEntryList = async (req, res) => {
  try {
    const result = await getFilmEntryListService(getUserId(req));
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const getFilmDetailsById = async (req, res) => {
  try {
    const result = await getFilmDetailsByIdService({
      id: req.params.id,
      userId: getUserId(req),
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const updateFeatureNonfeatureById = async (req, res) => {
  const missingFields = ["id", "film_type"].filter((field) => !req.body[field]);
  if (missingFields.length > 0) {
    return sendServiceResponse(res, missingFieldResponse(missingFields));
  }

  if (shouldValidateFilmStep(String(req.body.step ?? ""), req.body.film_type)) {
    const { isValid, errors } = NfaFilmHelper.validateStepInput(req.body, req.files);
    if (!isValid) return sendValidationError(res, errors);
  }

  try {
    const result = await updateFilmSubmissionService({
      payload: req.body,
      files: req.files,
      userId: getUserId(req),
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const getNonFeatureSubmissions = async (req, res) => {
  try {
    const result = await getNonFeatureSubmissionsService(getUserId(req));
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const finalSubmit = async (req, res) => {
  const { isValid, errors } = NfaFilmHelper.finalSubmitStep(req.body);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await finalSubmitFilmService({
      id: req.body.id,
      userId: getUserId(req),
    });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export default {
  createFeatureSubmission,
  createNonFeatureSubmission,
  getFilmEntryList,
  updateFeatureNonfeatureById,
  getFilmDetailsById,
  getNonFeatureSubmissions,
  finalSubmit,
};
