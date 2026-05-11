export const normalizeEmail = (email) => email?.trim().toLowerCase();

export const sanitizeUser = (user) => {
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

export const mapLoginUser = (user, token) => ({
  id: user._id,
  name: `${user.firstName} ${user.lastName}`,
  aadharNumber: user.aadharNumber,
  address: user.address,
  usertype: user.usertype,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  pinCode: user.pinCode,
  token,
});