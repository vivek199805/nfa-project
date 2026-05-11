import BookSchemaHelper from "../../helpers/bookSchemaHelper.js";
import { getUserId, sendServiceResponse } from "../../helpers/controllerHelper.js";
import { errorResponse, sendValidationError } from "../../helpers/responseHelper.js";
import {
  deleteBookService,
  getBookService,
  listBookService,
  storeBookService,
  updateBookService,
} from "../../services/book.service.js";

const storeBook = async (req, res) => {
  const { isValid, errors } = BookSchemaHelper.validateStore(req.body);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await storeBookService({ payload: req.body, userId: getUserId(req) });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const updateBook = async (req, res) => {
  const { isValid, errors } = BookSchemaHelper.validateUpdate(req.body);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await updateBookService({ payload: req.body, userId: getUserId(req) });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const listBook = async (req, res) => {
  const { isValid, errors } = BookSchemaHelper.validateList(req.body);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await listBookService({ payload: req.body, userId: getUserId(req) });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const getBook = async (req, res) => {
  try {
    const result = await getBookService({ id: req.params.id, userId: getUserId(req) });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const deleteBook = async (req, res) => {
  try {
    const result = await deleteBookService({ id: req.params.id, userId: getUserId(req) });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export default {
  storeBook,
  updateBook,
  listBook,
  getBook,
  deleteBook,
};
