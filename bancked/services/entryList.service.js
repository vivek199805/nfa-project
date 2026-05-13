import { findBestBooksByUser } from "../repositories/bestBook.repository.js";
import { findBestFilmCriticsByUser } from "../repositories/bestFilmCritic.repository.js";
import { featureInclude, findFeatureFormsByUser, mapFeatureForResponse } from "../repositories/featureForm.repository.js";
import { toPublicId } from "../repositories/prisma.mapper.js";

export const getEntryListService = async ({ userId, userType }) => {
  if (userType == 1) {
    const filmEntryData = await findFeatureFormsByUser(userId, featureInclude);
    const formattedData = filmEntryData.map((item) => toPublicId(mapFeatureForResponse(item)));
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
    const bestBooks = await findBestBooksByUser(userId);

    const bestFilmCritic = await findBestFilmCriticsByUser(userId);

    return {
      message: "Fetched successfully",
      statusCode: 200,
      data: {
        bestBooks: bestBooks.map(toPublicId),
        bestFilmCritic: bestFilmCritic.map(toPublicId),
      },
    };
  }

  return {
    statusCode: 403,
    httpStatus: 403,
    message: "Unauthorized access",
  };
};
