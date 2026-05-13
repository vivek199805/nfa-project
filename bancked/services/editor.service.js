import { findBestBookByIdForUser } from "../repositories/bestBook.repository.js";
import { findBestFilmCriticByIdForUser } from "../repositories/bestFilmCritic.repository.js";
import {
  createEditor,
  deleteEditorById,
  findEditorByIdForUser,
  findEditors,
  updateEditorById,
} from "../repositories/editor.repository.js";

export const storeEditorService = async ({ payload, userId }) => {
  if (payload.best_book_cinema_id && payload.best_book_cinema_id.trim() !== "") {
    const bestBookCinema = await findBestBookByIdForUser(payload.best_book_cinema_id, userId);
    if (!bestBookCinema) return { message: "No result found", statusCode: 203 };
  }

  if (payload.best_film_critic_id && payload.best_film_critic_id.trim() !== "") {
    const bestFilmCritic = await findBestFilmCriticByIdForUser(payload.best_film_critic_id, userId);
    if (!bestFilmCritic) return { message: "No result found", statusCode: 203 };
  }

  const editor = await createEditor({
    client_id: String(userId),
    best_book_cinema_id: payload.best_book_cinema_id ?? null,
    best_film_critic_id: payload.best_film_critic_id ?? null,
    editor_name: payload.editor_name,
    editor_email: payload.editor_email,
    editor_mobile: payload.editor_mobile,
    editor_landline: payload.editor_landline ?? null,
    editor_fax: payload.editor_fax ?? null,
    editor_address: payload.editor_address,
    editor_citizenship: payload.editor_citizenship,
  });

  if (!editor) return { message: "Editor not created.!!", statusCode: 203 };

  return {
    message: "Editor created successfully.!!",
    statusCode: 200,
    data: editor,
  };
};

export const updateEditorService = async ({ payload, userId }) => {
  const editor = await findEditorByIdForUser(payload.id, userId);
  if (!editor) return { message: "Editor not found.!!", statusCode: 203 };

  if (editor.best_book_cinema_id && payload.best_book_cinema_id !== String(editor.best_book_cinema_id)) {
    return { message: "You cannot modify Best book cinema ID.!!", statusCode: 203 };
  }

  if (editor.best_film_critic_id && payload.best_film_critic_id !== String(editor.best_film_critic_id)) {
    return { message: "You cannot modify Best film critic ID.!!", statusCode: 203 };
  }

  const updatedEditor = await updateEditorById(editor.id, {
    best_book_cinema_id: payload.best_book_cinema_id ?? editor.best_book_cinema_id,
    best_film_critic_id: payload.best_film_critic_id ?? editor.best_film_critic_id,
    editor_name: payload.editor_name ?? editor.editor_name,
    editor_email: payload.editor_email ?? editor.editor_email,
    editor_mobile: payload.editor_mobile ?? editor.editor_mobile,
    editor_landline: payload.editor_landline ?? editor.editor_landline,
    editor_fax: payload.editor_fax ?? editor.editor_fax,
    editor_address: payload.editor_address ?? editor.editor_address,
    editor_citizenship: payload.editor_citizenship ?? editor.editor_citizenship,
  });

  return {
    message: "Updated successfully!",
    statusCode: 200,
    data: updatedEditor,
  };
};

export const listEditorService = async ({ payload, userId }) => {

  let whereTo = {};

  if (payload?.best_book_cinema_id != null) {
    const checkBestBook = await findBestBookByIdForUser(payload.best_book_cinema_id, userId);
    if (!checkBestBook) return { message: "Please provide valid details.!!", statusCode: 203 };

    whereTo = {
      best_book_cinema_id: payload.best_book_cinema_id,
      client_id: String(userId),
    };
  }

  if (payload.best_film_critic_id != null) {
    const checkBestFilmCritic = await findBestFilmCriticByIdForUser(payload.best_film_critic_id, userId);
    if (!checkBestFilmCritic) return { message: "Please provide valid details.!!", statusCode: 203 };

    whereTo = {
      best_film_critic_id: payload.best_film_critic_id,
      client_id: String(userId),
    };
  }

  if (Object.keys(whereTo).length === 0) return { message: "No valid identifier provided.", statusCode: 203 };

  const allEditor = await findEditors(whereTo);
  if (!allEditor) return { message: "No result found.!!", statusCode: 203 };

  return {
    message: allEditor.length === 0 ? "No editors found." : "Success",
    statusCode: 200,
    data: allEditor.length === 0 ? [] : allEditor.map((editor) => ({
      ...editor,
      _id: editor.id,
    })),
  };
};

export const getEditorService = async ({ id, userId }) => {
  const editor = await findEditorByIdForUser(id, userId);
  if (!editor) return { message: "No result found.!!", statusCode: 203 };

  return { message: "Success", statusCode: 200, data: editor };
};

export const deleteEditorService = async ({ id, userId }) => {
  const editor = await findEditorByIdForUser(id, userId);
  if (!editor) return { message: "editor not found", statusCode: 203 };

  await deleteEditorById(id);
  return { message: "Editor deleted successfully", statusCode: 200 };
};
