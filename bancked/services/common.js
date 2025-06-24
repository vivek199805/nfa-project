import path from 'path';
import fs from "fs"
import { fileURLToPath } from 'url';
import { Document } from "../models/mongodbModels/document.js";
// Define __filename and __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const stepsFeature = () => ({
  GENERAL: 1,
  CENSOR: 2,
  COMPANY_REGISTRATION: 3,
  PRODUCER: 4,
  DIRECTOR: 5,
  ACTORS: 6,
  SONGS: 7,
  AUDIOGRAPHER: 8,
  OTHER: 9,
  RETURN_ADDRESS: 10,
  DECLARATION: 11,
  FINAL_SUBMIT: 12,
});

export const stepsNonFeature = () => ({
  GENERAL: 1,
  CENSOR: 2,
  COMPANY_REGISTRATION: 3,
  PRODUCER: 4,
  DIRECTOR: 5,
  OTHER: 6,
  RETURN_ADDRESS: 7,
  DECLARATION: 9,
  FINAL_SUBMIT: 10,
});

// Document type mapping
export const documentTypeMap = {
  CENSOR_CERTIFICATE_FILE: 1,
  COMPANY_REG_DOC: 2,
  ORIGINAL_WORK_COPY: 3,
  PRODUCER_SELF_ATTESTED_DOC: 4,
  DIRECTOR_SELF_ATTESTED_DOC: 5,
  CRITIC_AADHAAR_CARD: 6,
  AUTHOR_AADHAAR_CARD: 7,
};

export const websiteType = {
  IP: 1,
  OTT: 2,
  CMOT: 3,
  DD: 4,
  NFA: 5,
};

export const formType = {
  FEATURE: 1,
  NON_FEATURE: 2,
  BEST_BOOK: 3,
  BEST_FILM_CRITIC: 4,
};

const imageUpload = async (data) => {
  const websiteTypeValue = websiteType[data.websiteType] || null;
  const formTypeValue = formType[data.formType] || null;

  try {
    const image = data.image;
    const originalName = image.originalname;
    const fileName = path.parse(originalName).name;
    const extension = path.extname(originalName);
    const modifiedName = `${fileName}_${Date.now()}${extension}`;
    const directory = path.join(__dirname, "..", "public/documents", data.websiteType);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    const filePath = path.join(directory, modifiedName);
    fs.writeFileSync(filePath, image.buffer);

    const documentType = documentTypeMap[data.image_key.toUpperCase()] || null;

    if (!documentType) {
      return false;
    }

    const fileDetails = {
      form_type: formTypeValue,
      document_type: documentType,
      file: modifiedName,
      name: originalName,
      website_type: websiteTypeValue,
      context_id: data.id,
    };

    const filter = {
      context_id: data.id,
      form_type: formTypeValue,
      document_type: documentType,
      website_type: websiteTypeValue,
    };

    const existingDoc = await Document.findOne(filter);

    if (existingDoc) {
      Object.assign(existingDoc, fileDetails);
      await existingDoc.save();
      return {
        status: true,
        message: "File updated successfully!!",
      };
    } else {
      const newDoc = new Document(fileDetails);
      await newDoc.save();
      return {
        status: true,
        message: "File created successfully!!",
      };
    }
  } catch (error) {
    return false;
  }
}

export default {
  stepsFeature,
  stepsNonFeature,
  imageUpload,
};