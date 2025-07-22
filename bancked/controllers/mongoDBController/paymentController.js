import { FeatureForm } from "../../models/mongodbModels/featureForm.js";
import BestFilmCritic from "../../models/mongodbModels/BestFilmCritic.js";
import Payment from "../../models/mongodbModels/Payment.js";
import { formType } from "../../services/common.js";
import BestBookCinema from "../../models/mongodbModels/BestBookCinema.js";
import { validatePaymentData } from "../../helpers/paymentSchemaHelper.js";

const generateHash = async (req, res) => {
  const { isValid, errors } = validatePaymentData(req.body);
  if (!isValid) {
    return res.status(422).json({
      message: "Validation failed",
      errors,
      statusCode: 422
    });
  }
  try {
    const payload = {
      ...req.body,
      user: req.user,
    };

    const form_Type = formType[payload.form_type];
    let applicationData;
    if (form_Type === 1) {
      applicationData = await FeatureForm.findOne({
        _id: payload.id,
        client_id: payload.user.id || payload.user._id,
      });
      if (!applicationData) {
        res.status(200).json({
          message:
            "You are not an authorized user to payment. Please contact our support.!!",
          status: false,
          statusCode: 203,
        });
      }
    } else if (form_Type === 2) {
      applicationData = await FeatureForm.findOne({
        _id: payload.id,
        client_id: payload.user.id || payload.user._id,
      });
      if (!applicationData) {
        res.status(200).json({
          message:
            "You are not an authorized user to payment. Please contact our support.!!",
          status: false,
          statusCode: 201,
        });
      }
    } else if (form_Type === 3) {
      applicationData = await BestBookCinema.findOne({
        _id: payload.id,
        client_id: payload.user.id || payload.user._id,
      });
      if (!applicationData) {
        res.status(200).json({
          message:
            "You are not an authorized user to payment. Please contact our support.!!",
          status: false,
          statusCode: 203,
        });
      }
    } else if (form_Type === 4) {
      applicationData = await BestFilmCritic.findOne({
        _id: payload.id,
        client_id: payload.user.id || payload.user._id,
      });
      if (!applicationData) {
        res.status(200).json({
          message:
            "You are not an authorized user to payment. Please contact our support.!!",
          status: false,
          statusCode: 201,
        });
      }
    }

    const arrayToInsert = {
      client_id: applicationData.client_id,
      website_type: 5,
      form_type: formType[payload.form_type] ?? null,
      context_id: applicationData._id,
    };

    const insertPayment = new Payment(arrayToInsert);
    if (!insertPayment) {
      res.status(200).json({
        message: "Payment data not inserted",
        status: false,
        statusCode: 201,
      });
    }
    const paymentInsert = await insertPayment.save();

    // const credential = await Credential.findOne({
    //   where: { id: process.env.NFA },
    // });
    // if (!credential) {
    //   return responseHelper(res, "notvalid");
    // }

    applicationData.payment_status = 2;
    await applicationData.save();

    return res.status(200).json({
      message: "Payment data inserted and status updated",
      status: true,
      statusCode: 200,
      data: paymentInsert,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export default generateHash;
