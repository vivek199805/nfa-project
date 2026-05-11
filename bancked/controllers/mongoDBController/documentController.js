import { getUserId, sendServiceResponse } from "../../helpers/controllerHelper.js";
import { errorResponse } from "../../helpers/responseHelper.js";
import { getDocumentDownloadService } from "../../services/document.service.js";

const downloadDocument = async (req, res) => {
  try {
    const result = await getDocumentDownloadService({
      id: req.params.id,
      userId: getUserId(req),
    });

    if (result.filePath) {
      return res.download(result.filePath, result.fileName);
    }

    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export default {
  downloadDocument,
};
