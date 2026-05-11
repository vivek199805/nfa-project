import BestBookCinema from "../models/mongodbModels/BestBookCinema.js";
import BestFilmCritic from "../models/mongodbModels/BestFilmCritic.js";
import { FeatureForm } from "../models/mongodbModels/featureForm.js";

const formatItems = (items) =>
  items.map((item) => {
    const obj = item.toObject();
    obj.id = obj._id;
    delete obj._id;
    return obj;
  });

export const getEntryListService = async ({ userId, userType }) => {
  if (userType == 1) {
    const filmEntryData = await FeatureForm.find({ client_id: userId }).populate(
      "producers directors songs actors audiographer documents"
    );

    const formattedData = formatItems(filmEntryData);
    const featureFilmData = formattedData.filter((item) => item.film_type !== "non-feature");
    const nonFeatureFilmData = formattedData.filter((item) => item.film_type === "non-feature");

    return {
      message: "Fetched successfully",
      statusCode: 200,
      data: {
        feature: featureFilmData,
        "non-feature": nonFeatureFilmData,
      },
    };
  }

  if (userType == 2) {
    const bestBooks = await BestBookCinema.find({ client_id: userId });
    const bestFilmCritic = await BestFilmCritic.find({ client_id: userId });

    return {
      message: "Fetched successfully",
      statusCode: 200,
      data: {
        bestBooks: formatItems(bestBooks),
        bestFilmCritic: formatItems(bestFilmCritic),
      },
    };
  }

  return {
    statusCode: 403,
    httpStatus: 403,
    message: "Unauthorized access",
  };
};
