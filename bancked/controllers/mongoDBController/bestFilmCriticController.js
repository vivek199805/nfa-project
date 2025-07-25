import BestFilmCritic from "../../models/mongodbModels/BestFilmCritic.js";
import { Document } from "../../models/mongodbModels/document.js";
import Editor from "../../models/mongodbModels/editor.js";
import common from "../../services/common.js";
import Common from "../../services/common.js";

// Create Feature Submission
const createFilmCritic = async (req, res) => {
  try {
    const user = req.user.toObject();
    const client_id = user._id || user.id;
    const {
      writer_name,
      article_title,
      article_language_id,
      publication_date,
      publication_name,
      rni,
      step,
    } = req.body;

    const filmData = new BestFilmCritic({
      writer_name,
      article_title,
      article_language_id,
      publication_date,
      publication_name,
      rni,
      step,
      active_step: 1,
      client_id,
    });
    await filmData.save();
    const finalData = filmData.toObject(); // Convert Mongoose document to plain JS object
    finalData.id = finalData._id;
    delete finalData._id;

    res
      .status(200)
      .json({ message: "Submit successful", statusCode: 200, data: finalData });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
    const existingEntry = await BestFilmCritic.findById(_id);
    if (!existingEntry) {
      return res.status(200).json({
        statusCode: 203,
        message: "Please provide valid details to update.!!",
      });
    }
    // Check if the user is authorized to update this entry
    let stepHandler = {
      [Common.stepsBestFilmCritic().CRITIC_DETAILS]: async ( existingEntry, payload) => await handleBestFilmCriticStep(existingEntry, payload),
      [Common.stepsBestFilmCritic().CRITIC]: async (existingEntry, payload) => await handleCriticStep(existingEntry, payload),
      [Common.stepsBestFilmCritic().PUBLISHER]: async (existingEntry, payload) => await handlePublisherStep(existingEntry, payload),
      [Common.stepsBestFilmCritic().DECLARATION]: async (data, payload) => await handleDeclarationStep(data, payload),
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
  // const { isValid, errors } = BestFilmCriticHelper.finalSubmitStep(req.body);
  // if (!isValid) {
  //   return responseHelper(res, "validatorerrors", { errors });
  // }

  try {
    const payload = {
      ...req.body,
      user: req.user,
    };

    const bestFilmCritic = await BestFilmCritic.findOne({
      _id: payload.id,
      client_id: payload.user.id || payload.user._id,
    });

    if (!bestFilmCritic) {
      res.status(200).json({
        message: "You do not have any entries.!!",
        statusCode: 203,
      });
    }

    if (bestFilmCritic.payment_status != 2) {
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

    res.status(200).json({
      message: "You have successfully submitted your form.!!",
      statusCode: 200,
    });
  } catch (error) {
    return res.status(500).json({
      status: "exception",
      message: error.message || "Internal Server Error",
    });  }
};

const handleBestFilmCriticStep = async (data, payload) => {
  const lastId = payload.id || null;

  if (lastId) {
    if (
      !data.active_step ||
      data.active_step < Common.stepsBestFilmCritic().CRITIC_DETAILS
    ) {
      data.active_step = Common.stepsBestFilmCritic().CRITIC_DETAILS;
    }

    if (payload?.files && Array.isArray(payload?.files)) {
      const criticAadhaar = payload.files.find(
        (file) => file.fieldname === "critic_aadhaar_card"
      );
      if (criticAadhaar) {
        const fileUpload = await common.imageUpload({
          id: lastId,
          image_key: "critic_aadhaar_card",
          websiteType: "NFA",
          formType: "BEST_FILM_CRITIC",
          image: criticAadhaar,
        });

        if (!fileUpload.status) {
          return response("exception", { message: "Image not uploaded.!!" });
        }
        data.critic_aadhaar_card = fileUpload?.data?.file ?? null;
      } else {
        data.critic_aadhaar_card = null;
      }
    } else {
      data.critic_aadhaar_card = null;
    }
  }

  return data;
};

const handleCriticStep = async (data, payload) => {
  const lastId = payload.id || null;

  if (lastId) {
    if (
      !data.active_step ||
      data.active_step < Common.stepsBestFilmCritic().CRITIC
    ) {
      data.active_step = Common.stepsBestFilmCritic().CRITIC;
    }

    if (payload?.files && Array.isArray(payload?.files)) {
      const criticAadhaar = payload.files.find(
        (file) => file.fieldname === "critic_aadhaar_card"
      );
      if (criticAadhaar) {
        const fileUpload = await common.imageUpload({
          id: lastId,
          image_key: "critic_aadhaar_card",
          websiteType: "NFA",
          formType: "BEST_FILM_CRITIC",
          image: criticAadhaar,
        });

        if (!fileUpload.status) {
          return response("exception", { message: "Image not uploaded.!!" });
        }
        data.critic_aadhaar_card = fileUpload?.data?.file ?? null;
      } else {
        data.critic_aadhaar_card = null;
      }
    } else {
      data.critic_aadhaar_card = null;
    }
  }

  return data;
};

const handlePublisherStep = async (data, payload) => {
  const lastId = payload.id || null;
  if (lastId) {
    if (
      !data.active_step ||
      data.active_step < Common.stepsBestFilmCritic().PUBLISHER
    ) {
      data.active_step = Common.stepsBestFilmCritic().PUBLISHER;
    }
  }

  return data;
};

const handleDeclarationStep = async (data, payload) => {
  const lastId = payload.id || null;

  if (
    !data.active_step ||
    data.active_step < Common.stepsBestFilmCritic().DECLARATION
  ) {
    data.active_step = Common.stepsBestFilmCritic().DECLARATION;
  }

  return data;
};

export const bestFilmCriticById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id || req.user?.id;
  try {
    const bestFilmCritic = await BestFilmCritic.findOne({
      _id: id,
      client_id: userId,
    }).populate({
      path: "documents",
      match: {
        form_type: 4,
        website_type: 5,
        document_type: 6,
      },
      model: Document,
    });

    if (!bestFilmCritic) {
      return res.status(404).json({
        status: "exception",
        message: "Something went wrong!!",
      });
    }

    const editors = await Editor.find({
      best_film_critic_id: bestFilmCritic._id,
    });

    const data = {
      ...bestFilmCritic.toObject(),
      editors,
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
  createFilmCritic,
  updateEntryById,
  bestFilmCriticById,
  finalSubmit
};
