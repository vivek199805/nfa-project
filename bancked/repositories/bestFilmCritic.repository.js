import BaseRepository from "./base.repository.js";

const bestFilmCriticRepository = new BaseRepository("bestFilmCritic");

export const createBestFilmCritic = (data) =>
  bestFilmCriticRepository.create(data);

export const findBestFilmCriticByIdForUser = (id, userId) =>
  bestFilmCriticRepository.findFirst({ id, client_id: userId });

export const findBestFilmCriticsByUser = (userId) =>
  bestFilmCriticRepository.findMany({ client_id: userId });

export const updateBestFilmCriticByIdForUser = async (id, userId, data) => {
  const existing = await findBestFilmCriticByIdForUser(id, userId);
  if (!existing) return null;

  return bestFilmCriticRepository.updateById(id, data);
};
