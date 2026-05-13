import BaseRepository from "./base.repository.js";

const bestBookRepository = new BaseRepository("bestBookCinema");

export const createBestBook = (data) =>
  bestBookRepository.create(data);

export const findBestBookByIdForUser = (id, userId) =>
  bestBookRepository.findFirst({ id, client_id: userId });

export const findBestBooksByUser = (userId) =>
  bestBookRepository.findMany({ client_id: userId });

export const updateBestBookByIdForUser = async (id, userId, data) => {
  const existing = await findBestBookByIdForUser(id, userId);
  if (!existing) return null;

  return bestBookRepository.updateById(id, data);
};
