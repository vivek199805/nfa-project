import { getUserId, sendServiceResponse } from "../../helpers/controllerHelper.js";
import EditorSchemaHelper from "../../helpers/editorSchemaHelper.js";
import { errorResponse, sendValidationError } from "../../helpers/responseHelper.js";
import {
  deleteEditorService,
  getEditorService,
  listEditorService,
  storeEditorService,
  updateEditorService,
} from "../../services/editor.service.js";

const storeEditor = async (req, res) => {
  const { isValid, errors } = EditorSchemaHelper.validateStore(req.body);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await storeEditorService({ payload: req.body, userId: getUserId(req) });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const updateEditor = async (req, res) => {
  const { isValid, errors } = EditorSchemaHelper.validateUpdate(req.body);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await updateEditorService({ payload: req.body, userId: getUserId(req) });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const listEditor = async (req, res) => {
  const { isValid, errors } = EditorSchemaHelper.validateList(req.body);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await listEditorService({ payload: req.body, userId: getUserId(req) });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const getEditor = async (req, res) => {
  try {
    const result = await getEditorService({ id: req.params.id, userId: getUserId(req) });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const deleteEditor = async (req, res) => {
  try {
    const result = await deleteEditorService({ id: req.params.id, userId: getUserId(req) });
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export default {
  storeEditor,
  updateEditor,
  listEditor,
  getEditor,
  deleteEditor,
};
