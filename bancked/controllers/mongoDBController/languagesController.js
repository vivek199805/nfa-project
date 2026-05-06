import { fetchLanguages } from "../../services/languages.js";
import { errorResponse, sendJsonResponse } from "../../helpers/responseHelper.js";

const getAllLang = async (req, res) => {
  try {
    const langData = await fetchLanguages()
    return sendJsonResponse(res, 200, { message: 'Fetch successfully', data: langData, statusCode: 200 });
  } catch (err) {
    return errorResponse(res, err);
  }
};

export default getAllLang;
