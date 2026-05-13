import BaseRepository from "./base.repository.js";

const bookRepository = new BaseRepository("book");

export const createBook = (data) => bookRepository.create(data);

export const findBookByIdForUser = (id, userId) =>
  bookRepository.findFirst({ id, client_id: userId });

export const findBooks = (where) => bookRepository.findMany(where);

export const updateBookById = (id, data) =>
  bookRepository.updateById(id, data);

export const deleteBookById = (id) => bookRepository.deleteById(id);
