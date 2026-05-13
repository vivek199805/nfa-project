import BaseRepository from "./base.repository.js";

const twoAuthRepository = new BaseRepository("twoAuth");

export const upsertTwoAuthByEmail = (email, data) =>
  twoAuthRepository.upsert({
    where: { email },
    create: data,
    update: data,
  });

export const findTwoAuthByUserId = (userId) =>
  twoAuthRepository.findFirst({ userId });

export const findVerifiedTwoAuthByEmail = (email) =>
  twoAuthRepository.findFirst({ email, isVerified: 1 });

export const updateTwoAuthById = (id, data) =>
  twoAuthRepository.updateById(id, data);

export const deleteTwoAuthById = (id) => twoAuthRepository.deleteById(id);
