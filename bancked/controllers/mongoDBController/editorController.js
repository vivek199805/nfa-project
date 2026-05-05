import BestBookCinema from "../../models/mongodbModels/BestBookCinema.js";
import BestFilmCritic from "../../models/mongodbModels/BestFilmCritic.js";
import Editor from "../../models/mongodbModels/editor.js";
import EditorSchemaHelper from "../../helpers/editorSchemaHelper.js";
import { errorResponse, sendJsonResponse, sendValidationError } from "../../helpers/responseHelper.js";

const storeEditor = async (req, res) => {
  const { isValid, errors } = EditorSchemaHelper.validateStore(req.body);
  if (!isValid) {
    return sendValidationError(res, errors);
  }

  try {
    const payload = {
      ...req.body,
      user: req.user,
    };

    if (
      payload.best_book_cinema_id &&
      payload.best_book_cinema_id.trim() !== ""
    ) {
      const bestBookCinema = await BestBookCinema.findOne({
        _id: payload.best_book_cinema_id,
        client_id: payload.user.id || payload.user._id,
      });

      if (!bestBookCinema) {
        return res
          .status(200)
          .json({ message: "No result found", statusCode: 203 });
      }
    }

    if (
      payload.best_film_critic_id &&
      payload.best_film_critic_id.trim() !== ""
    ) {
      const bestFilmCritic = await BestFilmCritic.findOne({
        _id: payload.best_film_critic_id,
        client_id: payload.user.id || payload.user._id,
      });
      if (!bestFilmCritic) {
        return res
          .status(200)
          .json({ message: "No result found", statusCode: 203 });
      }
    }

    let arrayToInsert = {
      client_id: payload.user.id || payload.user._id,
      best_book_cinema_id: payload.best_book_cinema_id ?? null,
      best_film_critic_id: payload.best_film_critic_id ?? null,
      editor_name: payload.editor_name,
      editor_email: payload.editor_email,
      editor_mobile: payload.editor_mobile,
      editor_landline: payload.editor_landline ?? null,
      editor_fax: payload.editor_fax ?? null,
      editor_address: payload.editor_address,
      editor_citizenship: payload.editor_citizenship,
    };

    const editor = await Editor.create(arrayToInsert);

    if (!editor) {
      return sendJsonResponse(res, 200, {
        message: "Editor not created.!!",
        statusCode: 203,
      });
    }

    return sendJsonResponse(res, 200, {
      message: "Editor created successfully.!!",
      statusCode: 200,
      data: editor,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const updateEditor = async (req, res) => {
  const { isValid, errors } = EditorSchemaHelper.validateUpdate(req.body);
  if (!isValid) {
    return sendValidationError(res, errors);
  }

  try {
    const payload = {
      ...req.body,
      user: req.user,
    };

    const editor = await Editor.findOne({
      _id: payload.id,
      client_id: payload.user.id || payload.user._id,
    });


    if (!editor) {
      return sendJsonResponse(res, 200, {
        message: "Editor not found.!!",
        statusCode: 203,
      });
    }

    if (
      editor.best_book_cinema_id &&
      payload.best_book_cinema_id !== String(editor.best_book_cinema_id)
    ) {
      return sendJsonResponse(res, 200, {
        message: "You cannot modify Best book cinema ID.!!",
        statusCode: 203,
      });
    }

    if (
      editor.best_film_critic_id &&
      payload.best_film_critic_id !== String(editor.best_film_critic_id)
    ) {
      return sendJsonResponse(res, 200, {
        message: "You cannot modify Best film critic ID.!!",
        statusCode: 203,
      });
    }

    const updatedData = {
      best_book_cinema_id:
        payload.best_book_cinema_id ?? editor.best_book_cinema_id,
      best_film_critic_id:
        payload.best_film_critic_id ?? editor.best_film_critic_id,
      editor_name: payload.editor_name ?? editor.editor_name,
      editor_email: payload.editor_email ?? editor.editor_email,
      editor_mobile: payload.editor_mobile ?? editor.editor_mobile,
      editor_landline: payload.editor_landline ?? editor.editor_landline,
      editor_fax: payload.editor_fax ?? editor.editor_fax,
      editor_address: payload.editor_address ?? editor.editor_address,
      editor_citizenship:
        payload.editor_citizenship ?? editor.editor_citizenship,
    };

    const updatedEditor = await Editor.findByIdAndUpdate(
      editor._id,
      updatedData,
      { new: true }
    );

    return sendJsonResponse(res, 200, {
      message: "Updated successfully!",
      statusCode: 200,
      data: updatedEditor,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const listEditor = async (req, res) => {
  const { isValid, errors } = EditorSchemaHelper.validateList(req.body);
  if (!isValid) {
    return sendValidationError(res, errors);
  }

  try {
    const payload = {
      ...req.body,
      user: req.user,
    };

    let allEditor;
    let whereTo = {};

    if (payload?.best_book_cinema_id != null) {
      const checkBestBook = await BestBookCinema.findOne({
        _id: payload.best_book_cinema_id,
        client_id: payload.user.id || payload.user._id,
      });

      if (!checkBestBook) {
        return sendJsonResponse(res, 200, {
          message: "Please provide valid details.!!",
          statusCode: 203,
        });
      }

      whereTo = {
        best_book_cinema_id: payload.best_book_cinema_id,
        client_id: payload.user.id || payload.user._id,
      };
    }

    if (payload.best_film_critic_id != null) {
      const checkBestFilmCritic = await BestFilmCritic.findOne({
        _id: payload.best_film_critic_id,
        client_id: payload.user.id || payload.user._id,
      });

      if (!checkBestFilmCritic) {
        return sendJsonResponse(res, 200, {
          message: "Please provide valid details.!!",
          statusCode: 203,
        });
      }

      whereTo = {
        best_film_critic_id: payload.best_film_critic_id,
        client_id: payload.user.id || payload.user._id,
      };
    }

    if (Object.keys(whereTo).length === 0) {
      return sendJsonResponse(res, 200, {
        message: "No valid identifier provided.",
        statusCode: 203,
      });
    }

    allEditor = await Editor.find(whereTo);

    if (!allEditor || allEditor.length === 0) {
      return sendJsonResponse(res, 200, {
        message: "No result found.!!",
        statusCode: 203,
      });
    }
    return sendJsonResponse(res, 200, {
      message: "Success",
      statusCode: 200,
      data: allEditor,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const getEditor = async (req, res) => {
  try {
    const payload = {
      ...req.params,
      user: req.user,
    };
    const editor = await Editor.findOne({
      _id: payload.id,
      client_id: payload.user.id || payload.user._id,
    });
    if (!editor) {
      return sendJsonResponse(res, 200, {
        message: "No result found.!!",
        statusCode: 203,
      });
    }
    return sendJsonResponse(res, 200, {
      message: "Success",
      statusCode: 200,
      data: editor,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const deleteEditor = async (req, res) => {
  try {
    const payload = {
      ...req.params,
      user: req.user,
    };
    const editor = await Editor.findOne({
      _id: payload.id,
      client_id: payload.user.id || payload.user._id,
    });

    if (!editor) {
      return sendJsonResponse(res, 200, {
        message: "editor not found",
        statusCode: 203,
      });
    }

    // Delete the document
    await Editor.deleteOne({ _id: payload.id });
    return sendJsonResponse(res, 200, {
      message: "Editor deleted successfully",
      statusCode: 200,
    });
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
