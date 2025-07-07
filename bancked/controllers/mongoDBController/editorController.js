import BestBookCinema from "../../models/mongodbModels/BestBookCinema.js";
import BestFilmCritic from "../../models/mongodbModels/BestFilmCritic.js";
import Editor from "../../models/mongodbModels/editor.js";

const storeEditor = async (req, res) => {
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
        id: payload.best_book_cinema_id,
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
      return res.status(200).json({
        message: "Producer not created.!!",
        statusCode: 201,
      });
    }

    return res.status(200).json({
      message: "Producer created successfully.!!",
      statusCode: 200,
      data: editor,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch producers",
      message: error.message,
    });
  }
};

const updateEditor = async (req, res) => {
  //   const { isValid, errors } = EditorSchema.validateUpdate(req.body);

  //   if (!isValid) {
  //     return responseHelper(res, "validatorerrors", { errors });
  //   }

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
      return res.status(200).json({
        message: "Producer not found.!!",
        statusCode: 201,
      });
    }

    if (
      editor.best_book_cinema_id &&
      payload.best_book_cinema_id !== String(editor.best_book_cinema_id)
    ) {
      return res.status(200).json({
        message: "You cannot modify Best book cinema ID.!!",
        statusCode: 203,
      });
    }

    if (
      editor.best_film_critic_id  &&
      payload.best_film_critic_id !== String(editor.best_film_critic_id)
    ) {
      return res.status(200).json({
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

    return res.status(200).json({
      message: "Updated successfully!",
      statusCode: 200,
      data: updatedEditor,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      statusCode: 500,
    });
  }
};

const listEditor = async (req, res) => {
  //   const { isValid, errors } = EditorSchema.validateList(req.body);
  //   if (!isValid) {
  //     return responseHelper(res, "validatorerrors", { errors });
  //   }

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
        return res.status(200).json({
          message: "Please provide valid details.!!",
          statusCode: 203,
        });
      }

      whereTo = {
        best_book_cinema_id: payload.best_book_cinema_id,
        client_id: payload.user.id,
      };
    }

    if (payload.best_film_critic_id != null) {
      const checkBestFilmCritic = await BestFilmCritic.findOne({
        _id: payload.best_film_critic_id,
        client_id: payload.user.id,
      });

      if (!checkBestFilmCritic) {
        return res.status(200).json({
          message: "Please provide valid details.!!",
          statusCode: 201,
        });
      }

      whereTo = {
        best_film_critic_id: payload.best_film_critic_id,
        client_id: payload.user.id,
      };
    }

    if (Object.keys(whereTo).length === 0) {
      return res.status(200).json({
        message: "No valid identifier provided.",
        statusCode: 201,
      });
    }

    allEditor = await Editor.find(whereTo);

    if (!allEditor) {
      return res.status(200).json({
        message: "No result found.!!",
        statusCode: 203,
      });
    }
    return res.status(200).json({
      message: "Success",
      statusCode: 200,
      data: allEditor,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch producers",
      message: error.message,
    });
  }
};

const getEditor = async (req, res) => {
  try {
    const payload = {
      ...req.params,
      user: req.user,
    };
    const editor = await Editor.findOne({
      id: payload.id,
      client_id: payload.user.id || payload.user._id,
    });
    if (!editor) {
      return res.status(200).json({
        message: "No result found.!!",
        statusCode: 201,
      });
    }
    return res.status(200).json({
      message: "Success",
      statusCode: 200,
      data: editor,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
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
      res.status(200).json({
        message: "editor not found",
        statusCode: 203,
      });
    }

    // Delete the document
    await Editor.deleteOne({ _id: payload.id });
    res.status(200).json({
      message: "Editor deleted successfully",
      statusCode: 200,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export default {
  storeEditor,
  updateEditor,
  listEditor,
  getEditor,
  deleteEditor,
};
