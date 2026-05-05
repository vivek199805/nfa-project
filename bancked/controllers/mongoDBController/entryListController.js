import BestBookCinema from "../../models/mongodbModels/BestBookCinema.js";
import BestFilmCritic from "../../models/mongodbModels/BestFilmCritic.js";
import { FeatureForm } from "../../models/mongodbModels/featureForm.js";
import { errorResponse, sendJsonResponse } from "../../helpers/responseHelper.js";

const formatItems = (items) =>
  items.map((item) => {
    const obj = item.toObject();
    obj.id = obj._id;
    delete obj._id;
    return obj;
  });

const entryList = async (req, res) => {
  try {

    const user = req.user.toObject();
    const userId = user._id;
    const userType = user.usertype;

    if (userType == 1) {
      // Type 1 = Film Entries (Feature/Non-Feature)
      const filmEntryData = await FeatureForm.find({ client_id: userId }).populate(
        "producers directors songs actors audiographer documents"
      );

      const formattedData = formatItems(filmEntryData);

      const featureFilmData = formattedData.filter(
        (item) => item.film_type !== "non-feature"
      );
      const nonFeatureFilmData = formattedData.filter(
        (item) => item.film_type === "non-feature"
      );

      return sendJsonResponse(res, 200, {
        message: "Fetched successfully",
        statusCode: 200,
        data: {
          feature: featureFilmData,
          "non-feature": nonFeatureFilmData,
        },
      });

    } else if (userType == 2) {
      // Type 2 = Best Book & Film Critic Entries
      const bestBooks = await BestBookCinema.find({ client_id: userId })
      // .populate(
      //   "books", "editors"
      // );
      const bestFilmCritic = await BestFilmCritic.find({ client_id: userId })
      // .populate("editors");

      return sendJsonResponse(res, 200, {
        message: "Fetched successfully",
        statusCode: 200,
        data: {
          bestBooks: formatItems(bestBooks),
          bestFilmCritic: formatItems(bestFilmCritic),
        },
      });
    }

    return sendJsonResponse(res, 403, {
      statusCode: 403,
      message: "Unauthorized access",
    });

  } catch (error) {
    return errorResponse(res, error);
  }
};

export default entryList;
