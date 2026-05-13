import BaseRepository from "./base.repository.js";

const userRepository = new BaseRepository("user");

export const findUserByEmail = (email) => userRepository.findFirst({ email });

export const findUserById = (id) => userRepository.findUniqueById(id);

export const findUserByResetToken = (token) =>
  userRepository.findFirst({
    resetPasswordToken: token,
    resetPasswordExpires: { gt: new Date() },
  });

export const createUser = (data) => userRepository.create(data);

export const updateUserById = (id, data) =>
  userRepository.updateById(id, data);

export const deleteUserById = (id) =>
  userRepository.deleteById(id).catch((error) => {
    if (error.code === "P2025") return null;
    throw error;
  });
