import { Document } from "../models/mongodbModels/document.js";
import { FeatureForm } from "../models/mongodbModels/featureForm.js";
import Common from "./common.js";

const contributorConfig = {
  producers: {
    listField: "producers",
    idName: "producerId",
    documentType: 4,
    uploadField: "producer_self_attested_doc",
    notFound: "Producer not found",
    addMessage: "Producer added successfully",
    updateMessage: "Producer updated successfully",
    deleteMessage: "Producer deleted successfully",
  },
  directors: {
    listField: "directors",
    idName: "directorId",
    documentType: 5,
    uploadField: "director_self_attested_doc",
    notFound: "Director not found",
    addMessage: "Director added successfully",
    updateMessage: "Director updated successfully",
    deleteMessage: "director deleted successfully",
  },
  songs: {
    listField: "songs",
    idName: "songId",
    notFound: "song not found",
    addMessage: "song added successfully",
    updateMessage: "song updated successfully",
    deleteMessage: "song deleted successfully",
  },
  audiographer: {
    listField: "audiographer",
    idName: "audiographerId",
    notFound: "audiographer not found",
    addMessage: "audiographer added successfully",
    updateMessage: "audiographer updated successfully",
    deleteMessage: "audiographer deleted successfully",
  },
};

const toIdList = (items) =>
  items.map((item) => {
    const obj = item.toObject();
    obj.id = obj._id;
    delete obj._id;
    return obj;
  });

const withDownloadUrl = (item, uploadField) => {
  if (item?.documents?.file) {
    item.documents.file = `/api/documents/${item.documents._id}/download`;
  }

  if (item?.[uploadField]) {
    item[uploadField] = item.documents?._id
      ? `/api/documents/${item.documents._id}/download`
      : null;
  }

  return item;
};

export const listFeatureContributorsService = async ({
  featureId,
  filmType,
  userId,
  contributorType,
}) => {
  const config = contributorConfig[contributorType];
  const feature = await FeatureForm.findOne(
    { _id: featureId, client_id: userId },
    config.listField
  );

  if (!feature) {
    return { message: "Records not found", statusCode: 203 };
  }

  const contributors = feature[config.listField] || [];

  if (!config.documentType) {
    return {
      message: "Data fetched successfully",
      data: contributors,
      statusCode: 200,
    };
  }

  const data = await Promise.all(
    contributors.map(async (contributor) => {
      const documents = await Document.findOne({
        context_id: contributor._id,
        form_type: filmType === "feature" ? 1 : 2,
        website_type: 5,
        document_type: config.documentType,
      });

      return withDownloadUrl(
        {
          ...contributor.toObject(),
          documents,
        },
        config.uploadField
      );
    })
  );

  return {
    message: "Data fetched successfully",
    data,
    statusCode: 200,
  };
};

export const saveFeatureContributorService = async ({
  featureId,
  contributorId,
  userId,
  payload,
  files,
  contributorType,
}) => {
  const config = contributorConfig[contributorType];
  const feature = await FeatureForm.findOne({ _id: featureId, client_id: userId });

  if (!feature) {
    return { message: "Feature form not found", statusCode: 203 };
  }

  const collection = feature[config.listField];
  let contributor;

  if (contributorId) {
    contributor = collection.id(contributorId);
    if (!contributor) {
      return { message: config.notFound, statusCode: 203 };
    }

    Object.entries(payload).forEach(([key, value]) => {
      if (!["id", "nfa_feature_id"].includes(key)) {
        contributor[key] = value;
      }
    });
  } else {
    contributor = config.uploadField ? collection.create(payload) : payload;
    collection.push(contributor);
    if (!config.uploadField) {
      contributor = collection[collection.length - 1];
    }
  }

  if (config.uploadField && Array.isArray(files)) {
    const upload = files.find((file) => file.fieldname === config.uploadField);

    if (upload) {
      const fileUpload = await Common.imageUpload({
        id: contributor._id,
        image_key: config.uploadField,
        websiteType: "NFA",
        formType: payload.film_type === "non-feature" ? "NON_FEATURE" : "FEATURE",
        image: upload,
      });

      if (!fileUpload.status) {
        return {
          message: `failed to upload ${contributorType === "producers" ? "producer" : "director"} document`,
          statusCode: 500,
          httpStatus: 500,
        };
      }

      contributor.documents.push(fileUpload.data);
      contributor[config.uploadField] = fileUpload?.data?.file;
    }
  }

  await feature.save();

  return {
    message: contributorId ? config.updateMessage : config.addMessage,
    data: toIdList(collection),
    statusCode: 200,
  };
};

export const deleteFeatureContributorService = async ({
  featureId,
  contributorId,
  userId,
  contributorType,
}) => {
  const config = contributorConfig[contributorType];
  const feature = await FeatureForm.findOne({ _id: featureId, client_id: userId });

  if (!feature) {
    return { message: "Feature form not found", statusCode: 203 };
  }

  const contributor = feature[config.listField].id(contributorId);
  if (!contributor) {
    return { message: config.notFound, statusCode: 203 };
  }

  feature[config.listField].pull(contributorId);
  await feature.save();

  return {
    message: config.deleteMessage,
    statusCode: 200,
  };
};
