 import path from 'path';
 import fs from "fs"
 import {Document} from "../models/mongodbModels/document.js"

export const stepsFeature = () => ({
  GENRAL: 1,
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

 const  imageUpload = async (data) => {
    try {
      const image = data.image;
      const originalName = image.originalname;
      const fileName = path.parse(originalName).name;
      const extension = path.extname(originalName);
      const modifiedName = `${fileName}_${Date.now()}${extension}`;
      const directory = path.join(
        __dirname,
        "..",
        "public/documents",
        data.websiteType
      );

      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      const filePath = path.join(directory, modifiedName);
      fs.writeFileSync(filePath, image.buffer);

      const documentType = documentType()[data.image_key.toUpperCase()] || null;

      if (!documentType) {
        return false;
      }

      const fileDetails = {
        form_type: formType,
        document_type: documentType,
        file: modifiedName,
        name: originalName,
        website_type: websiteType,
        context_id: data.id,
      };

      const args = {
        context_id: data.id,
        form_type: formType,
        document_type: documentType,
        website_type: websiteType,
      };

    const document = await Document.findOne({ where: args });

    if (document) {
      await document.update(fileDetails);
      return {
        status: true,
        message: "File updated successfully!!",
      };
    } else {
      await Document.create(fileDetails);
      return {
        status: true,
        message: "File created successfully!!",
      };
    }
    } catch (error) {
      console.error("Image Upload Error:", error.message);
      return false;
    }
  }

export default { 
    stepsFeature,
    imageUpload
};