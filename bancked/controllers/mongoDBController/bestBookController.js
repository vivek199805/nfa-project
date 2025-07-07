import BestBookCinema from "../../models/mongodbModels/BestBookCinema.js";
import { Document } from "../../models/mongodbModels/document.js";
import Editor from "../../models/mongodbModels/editor.js";
import Book from "../../models/mongodbModels/book.js";
import Common from "../../services/common.js";
import BestBookCinemaHelper from "../../helpers/BestBookCinemaHelper.js";

// Create Feature Submission
const createBook = async (req, res) => {
  //  const { isValid, errors } = BestBookCinemaHelper.validateStepInput(req.body, req.files);
  // if (!isValid) {
  //   return res.status(200).json({
  //     message: "Validation failed",
  //     errors,
  //     statusCode: 203,
  //   });
  // }
  try {
    const user = req.user.toObject();
    const client_id = user._id || user.id;
    const {
      author_name,
      author_contact,
      author_nationality_indian,
      author_address,
      author_profile,
      step,
    } = req.body;

    const bestBookData = new BestBookCinema({
      author_name,
      author_contact,
      author_nationality_indian,
      author_address,
      author_profile,
      step,
      active_step: 1,
      client_id,
    });
    await bestBookData.save();
    const finalData = bestBookData.toObject(); // Convert Mongoose document to plain JS object
    finalData.id = finalData._id;
    delete finalData._id;

    res.status(200).json({
      message: "Submit successful",
      statusCode: 200,
      data: finalData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEntryById = async (req, res) => {
  try {
    const requiredFields = ["id"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(200).json({
        statusCode: 203,
        message: `${missingFields.join(" and ")} ${
          missingFields.length > 1 ? "are" : "is"
        } required`,
      });
    }
    const payload = {
      ...req.body,
      files: req.files,
    };

    const { id: _id } = req.body;
    // Find the document by ID
    const existingEntry = await BestBookCinema.findById(_id);
    if (!existingEntry) {
      return res.status(200).json({
        statusCode: 203,
        message: "Please provide valid details to update.!!",
      });
    }
    console.log("hello", existingEntry);

    let stepHandler = {
      [Common.stepsBestBook().AUTHOR]: async (existingEntry, payload) =>
        await handleAuthorStep(existingEntry, payload),
      [Common.stepsBestBook().BEST_BOOK_ON_CINEMA]: async (
        existingEntry,
        payload
      ) => await handleBookStep(existingEntry, payload),
      [Common.stepsBestBook().PUBLISHER_EDITOR]: async (
        existingEntry,
        payload
      ) => await handlePublisherStep(existingEntry, payload),
      [Common.stepsBestBook().DECLARATION]: async (data, payload) =>
        await handleDeclarationStep(data, payload),
    };

    if (stepHandler[+req.body.step]) {
      const result = await stepHandler[+req.body.step](existingEntry, payload);
      // Update the document with request body
      Object.assign(result, payload);

      // Save updated document
      const updated = await result.save();

      res.status(200).json({
        statusCode: 200,
        message: "Feature submission updated successfully",
        data: updated,
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Error updating feature submission",
      error: error.message,
    });
  }
};

const finalSubmit = async (req, res) => {
  // const { isValid, errors } = BestBookCinemaHelper.finalSubmitStep(req.body);
  // if (!isValid) {
  //   return res.status(400).json({
  //     message: "Validation failed",
  //     errors,
  //   });
  // }

  try {
    const payload = {
      ...req.body,
      user: req.user,
    };

    const bestBook = await BestBookCinema.findOne({
      _id: payload.id,
      client_id: payload.user.id || payload.user._id,
    });

    if (!bestBook) {
      res.status(200).json({
        message: "You do not have any entries.!!",
        statusCode: 203,
      });
    }

    if (bestBook.payment_status != 2) {
      res.status(200).json({
        message: "Your payment is not completed.!!",
        statusCode: 203,
      });
    }

    // const mailContent = {
    //   To: payload.user.email,
    //   Subject: "Payment successfully accepted | Indian Panorama | 55th IFFI",
    //   Data: {
    //     clientName: payload.user.first_name + " " + payload.user.last_name,
    //   },
    // };
    // await Mail.sendOtp(mailContent);

    return res.status(200).json({
      message: "You have successfully submitted your form.!!",
      statusCode: 200,
    });
  } catch (error) {
    return res.status(500).json({
      status: "exception",
      message: error.message || "Internal Server Error",
    });
  }
};

const handleAuthorStep = async (data, payload) => {
  const lastId = payload.id || null;

  if (lastId) {
    if (
      !data.active_step ||
      data.active_step < Common.stepsBestBook().CRITIC_DETAILS
    ) {
      data.active_step = Common.stepsBestBook().CRITIC_DETAILS;
    }
  }

  return data;
};

const handleBookStep = async (data, payload) => {
  const lastId = payload.id || null;

  if (lastId) {
    if (
      !data.active_step ||
      data.active_step < Common.stepsBestBook().BEST_BOOK_ON_CINEMA
    ) {
      data.active_step = Common.stepsBestBook().BEST_BOOK_ON_CINEMA;
    }
  }

  return data;
};

const handlePublisherStep = async (data, payload) => {
  const lastId = payload.id || null;
  if (lastId) {
    if (
      !data.active_step ||
      data.active_step < Common.stepsBestBook().PUBLISHER_EDITOR
    ) {
      data.active_step = Common.stepsBestBook().PUBLISHER_EDITOR;
    }
  }

  return data;
};

const handleDeclarationStep = async (data, payload) => {
  const lastId = payload.id || null;

  if (
    !data.active_step ||
    data.active_step < Common.stepsBestBook().DECLARATION
  ) {
    data.active_step = Common.stepsBestBook().DECLARATION;
  }

  return data;
};

export const bestBookCinemaById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id || req.user?.id;
  try {
    const bestBookCinema = await BestBookCinema.findOne({
      _id: id,
      client_id: userId,
    }).populate({
      path: "documents",
      match: {
        form_type: 3,
        website_type: 5,
        document_type: 7,
      },
      model: Document,
    });

    if (!bestBookCinema) {
      return res.status(200).json({
        status: "exception",
        message: "Something went wrong!!",
        statusCode: 203,
      });
    }

    const editors = await Editor.find({
      best_book_cinemas_id: bestBookCinema._id,
    });

    const book = await Book.find({
      best_book_cinema_id: bestBookCinema._id,
    });

    const data = {
      ...bestBookCinema.toObject(),
      editors,
      book,
    };

    return res.status(200).json({
      status: "success",
      message: "Success.!!",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: "exception",
      message: error.message || "Internal Server Error",
    });
  }
};

export default {
  createBook,
  updateEntryById,
  bestBookCinemaById,
  finalSubmit,
};
