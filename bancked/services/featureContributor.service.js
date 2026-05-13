import { findDocument } from "../repositories/document.repository.js";
import {
  createContributor,
  deleteContributor,
  findContributorById,
  findFeatureWithContributors,
  getInvalidNumericFields,
  listContributors,
  updateContributor,
} from "../repositories/featureContributor.repository.js";
import { toPublicIds } from "../repositories/prisma.mapper.js";
import Common from "./common.js";

const contributorConfig = {
  producers: {
    documentType: 4,
    uploadField: "producer_self_attested_doc",
    notFound: "Producer not found",
    addMessage: "Producer added successfully",
    updateMessage: "Producer updated successfully",
    deleteMessage: "Producer deleted successfully",
  },
  directors: {
    documentType: 5,
    uploadField: "director_self_attested_doc",
    notFound: "Director not found",
    addMessage: "Director added successfully",
    updateMessage: "Director updated successfully",
    deleteMessage: "director deleted successfully",
  },
  songs: {
    notFound: "song not found",
    addMessage: "song added successfully",
    updateMessage: "song updated successfully",
    deleteMessage: "song deleted successfully",
  },
  audiographer: {
    notFound: "audiographer not found",
    addMessage: "audiographer added successfully",
    updateMessage: "audiographer updated successfully",
    deleteMessage: "audiographer deleted successfully",
  },
};

const withDownloadUrl = (item, uploadField) => {
  if (item?.documents?.file) {
    item.documents.file = `/api/documents/${item.documents.id}/download`;
  }

  if (item?.[uploadField]) {
    item[uploadField] = item.documents?.id
      ? `/api/documents/${item.documents.id}/download`
      : null;
  }

  return item;
};

export const listFeatureContributorsService = async (
  { featureId, filmType, userId, contributorType }
) => {
  const config = contributorConfig[contributorType];
  const contributors = await listContributors({
    contributorType,
    featureId,
    userId,
  });

  if (!contributors) {
    return { message: "Records not found", statusCode: 203 };
  }

  if (!config.documentType) {
    return {
      message: "Data fetched successfully",
      data: contributors.map((contributor) => ({ _id: contributor.id, ...contributor })),
      statusCode: 200,
    };
  }

  const data = await Promise.all(
    contributors.map(async (contributor) => {
      const documents = await findDocument({
        context_id: contributor.id,
        form_type: filmType === "feature" ? 1 : 2,
        website_type: 5,
        document_type: config.documentType,
      });

      return withDownloadUrl(
        {
          ...contributor,
          _id: contributor.id,
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

export const saveFeatureContributorService = async (
  { featureId, contributorId, userId, payload, files, contributorType }
) => {
  const config = contributorConfig[contributorType];
  const numericErrors = getInvalidNumericFields({ contributorType, data: payload });

  if (Object.keys(numericErrors).length) {
    return {
      message: "Validation failed",
      errors: numericErrors,
      statusCode: 422,
      httpStatus: 422,
    };
  }

  const feature = await findFeatureWithContributors({
    contributorType,
    featureId,
    userId,
  });

  if (!feature) {
    return { message: "Feature form not found", statusCode: 203 };
  }

  let contributor;

  if (contributorId) {
    contributor = await findContributorById({
      contributorType,
      contributorId,
      featureId,
    });

    if (!contributor) {
      return { message: config.notFound, statusCode: 203 };
    }

    const updateData = Object.fromEntries(
      Object.entries(payload).filter(([key]) => !["id", "nfa_feature_id"].includes(key))
    );
    contributor = await updateContributor({
      contributorType,
      contributorId,
      data: updateData,
    });
  } else {
    contributor = await createContributor({
      contributorType,
      featureId,
      userId,
      data: payload,
    });
  }

  if (config.uploadField && Array.isArray(files)) {
    const upload = files.find((file) => file.fieldname === config.uploadField);

    if (upload) {
      const fileUpload = await Common.imageUpload({

        id: contributor.id,
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

      contributor = await updateContributor({
        contributorType,
        contributorId: contributor.id,
        data: { [config.uploadField]: fileUpload?.data?.file },
      });
    }
  }

  const contributors = await listContributors({
    contributorType,
    featureId,
    userId,
  });

  return {
    message: contributorId ? config.updateMessage : config.addMessage,
    data: toPublicIds(contributors),
    statusCode: 200,
  };
};

export const deleteFeatureContributorService = async (
  { featureId, contributorId, userId, contributorType }
) => {
  const config = contributorConfig[contributorType];
  const feature = await findFeatureWithContributors({
    contributorType,
    featureId,
    userId,
  });

  if (!feature) {
    return { message: "Feature form not found", statusCode: 203 };
  }

  const contributor = await findContributorById({
    contributorType,
    contributorId,
    featureId,
  });

  if (!contributor) {
    return { message: config.notFound, statusCode: 203 };
  }

  await deleteContributor({ contributorType, contributorId });

  return {
    message: config.deleteMessage,
    statusCode: 200,
  };
};
