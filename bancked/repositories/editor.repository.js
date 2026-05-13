import BaseRepository from "./base.repository.js";

const editorRepository = new BaseRepository("editor");

export const createEditor = (data) => editorRepository.create(data);

export const findEditorByIdForUser = (id, userId) =>
  editorRepository.findFirst({ id, client_id: userId });

export const findEditors = (where) => editorRepository.findMany(where);

export const updateEditorById = (id, data) =>
  editorRepository.updateById(id, data);

export const deleteEditorById = (id) => editorRepository.deleteById(id);
