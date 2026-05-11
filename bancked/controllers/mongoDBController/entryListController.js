import { sendServiceResponse } from "../../helpers/controllerHelper.js";
import { errorResponse } from "../../helpers/responseHelper.js";
import { getEntryListService } from "../../services/entryList.service.js";

const entryList = async (req, res) => {
  try {
    const user = req.user.toObject();
    const result = await getEntryListService({
      userId: user._id,
      userType: user.usertype,
    });

    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export default entryList;
