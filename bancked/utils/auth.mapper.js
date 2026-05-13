export const normalizeEmail = (email) => email?.trim().toLowerCase();

export const sanitizeUser = (user) => {
  const userObj = user?.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  return userObj;
};

export const mapLoginUser = (user, token = null) => ({
  id: user._id || user.id,
  name: `${user.firstName} ${user.lastName}`,
  aadharNumber: user.aadharNumber,
  address: user.address,
  usertype: user.usertype,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  pinCode: user.pinCode,
  ... (token && { token }),
});
