import BaseRepository from "./base.repository.js";
import { normalizeWhere } from "./prisma.mapper.js";

const documentRepository = new BaseRepository("document");

export const findDocumentById = (id) => documentRepository.findUniqueById(id);

export const findDocuments = (where) => documentRepository.findMany(where);

export const findDocument = (where, { client } = {}) =>
  new BaseRepository("document", client ? { client } : {}).findFirst(where);

export const deleteDocumentById = (id) => documentRepository.deleteById(id);

export const upsertDocument = (whereData, data, { client } = {}) =>
  new BaseRepository("document", client ? { client } : {}).upsert({
    where: {
      context_id_form_type_document_type_website_type: normalizeWhere(whereData),
    },
    create: data,
    update: data,
  });
