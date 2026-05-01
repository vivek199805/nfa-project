import User from "../models/mongodbModels/user.js";
import Twoauth from "../models/mongodbModels/twoAuth.js";
import BestBookCinema from "../models/mongodbModels/BestBookCinema.js";
import BestFilmCritic from "../models/mongodbModels/BestFilmCritic.js";
import { FeatureForm } from "../models/mongodbModels/featureForm.js";
import { Document } from "../models/mongodbModels/document.js";

const NFA_WEBSITE_TYPE = 5;
const BEST_BOOK_FORM_TYPE = 3;
const BEST_FILM_CRITIC_FORM_TYPE = 4;

async function normalizeLegacyOtpExpiry() {
  await Twoauth.updateMany(
    { otpExpiry: { $type: "number" } },
    [{ $set: { otpExpiry: { $toDate: "$otpExpiry" } } }]
  );
}

async function syncParentDocumentRefs(Model, formType) {
  const groups = await Document.aggregate([
    {
      $match: {
        website_type: NFA_WEBSITE_TYPE,
        form_type: formType,
      },
    },
    {
      $group: {
        _id: "$context_id",
        documentIds: { $addToSet: "$_id" },
      },
    },
  ]);

  for (const group of groups) {
    if (!group?._id || !Array.isArray(group.documentIds) || group.documentIds.length === 0) {
      continue;
    }

    await Model.updateOne(
      { _id: group._id },
      { $addToSet: { documents: { $each: group.documentIds } } }
    );
  }
}

async function normalizeUserEmails() {
  const users = await User.aggregate([
    {
      $project: {
        email: 1,
        normalizedEmail: {
          $toLower: { $trim: { input: "$email" } },
        },
      },
    },
    {
      $match: {
        $expr: { $ne: ["$email", "$normalizedEmail"] },
      },
    },
  ]);

  for (const user of users) {
    const conflictingUser = await User.findOne({
      _id: { $ne: user._id },
      email: user.normalizedEmail,
    }).select("_id");

    if (conflictingUser) {
      console.warn(
        `Skipped email normalization for user ${user._id}: normalized email conflicts with ${conflictingUser._id}`
      );
      continue;
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { email: user.normalizedEmail } }
    );
  }
}

async function normalizeTwoauthEmails() {
  await Twoauth.updateMany(
    { email: { $type: "string" } },
    [
      {
        $set: {
          email: {
            $toLower: { $trim: { input: "$email" } },
          },
        },
      },
    ]
  );
}

async function normalizeFeatureFormSteps() {
  await FeatureForm.updateMany(
    {
      $or: [
        { step: { $type: "string" } },
        { active_step: { $type: "string" } },
      ],
    },
    [
      {
        $set: {
          step: {
            $convert: {
              input: "$step",
              to: "int",
              onError: 1,
              onNull: 1,
            },
          },
          active_step: {
            $convert: {
              input: "$active_step",
              to: "int",
              onError: 1,
              onNull: 1,
            },
          },
        },
      },
    ]
  );
}

export async function runStartupMaintenance() {
  try {
    await normalizeLegacyOtpExpiry();
    await normalizeFeatureFormSteps();
    await syncParentDocumentRefs(BestBookCinema, BEST_BOOK_FORM_TYPE);
    await syncParentDocumentRefs(BestFilmCritic, BEST_FILM_CRITIC_FORM_TYPE);
    await normalizeUserEmails();
    await normalizeTwoauthEmails();
    console.log("Startup maintenance completed.");
  } catch (error) {
    console.error("Startup maintenance warning:", error.message);
  }
}
