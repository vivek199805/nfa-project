import { mapLoginUser, normalizeEmail, sanitizeUser } from "../utils/auth.mapper.js";
import { generateToken } from "../utils/jwt.util.js";
import { comparePasswords } from "../utils/comparePasswords.js";
import { Mail } from "../mailer/mail.js";
import generateOtp from "../utils/generate-otp.js";
import { hashPassword } from "../utils/hashPassword.js";
import {
  createUser,
  deleteUserById,
  findUserByEmail,
  findUserById,
  findUserByResetToken,
  updateUserById,
} from "../repositories/user.repository.js";
import {
  deleteTwoAuthById,
  findTwoAuthByUserId,
  findVerifiedTwoAuthByEmail,
  updateTwoAuthById,
  upsertTwoAuthByEmail,
} from "../repositories/twoAuth.repository.js";

const OTP_EXPIRY_MINUTES = 5;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
  maxAge: OTP_EXPIRY_MINUTES * 60 * 1000,
};

export const registerUserService = async (payload) => {
  const {
    firstName,
    lastName,
    phone,
    address,
    pinCode,
    aadharNumber,
    category: usertype,
    password,
    email: rawEmail,
  } = payload;

  const email = normalizeEmail(rawEmail);

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return {
      statusCode: 203,
      message: "Email already registered",
    };
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await createUser({
    firstName,
    lastName,
    email,
    phone,
    address,
    pinCode,
    aadharNumber,
    usertype,
    password: hashedPassword,
  });

  return {
    statusCode: 200,
    message: "User registered successfully",
    user: sanitizeUser(newUser),
  };
};

export const loginUserService = async (payload) => {
  const email = normalizeEmail(payload.email);
  const { password } = payload;

  const user = await findUserByEmail(email);
  if (!user) {
    return {
      statusCode: 401,
      message: "Invalid email or password",
    };
  }

  const isMatch = await comparePasswords(password, user.password);
  if (!isMatch) {
    return {
      statusCode: 203,
      message: "Email or password is incorrect",
    };
  }

  const token = generateToken({
    userId: mapLoginUser(user).id,
    email: user.email,
  });

  return {
    statusCode: 200,
    message: "User login successfully",
    data: mapLoginUser(user, token),
  };
};

export const verifyEmailService = async (payload) => {
  const email = normalizeEmail(payload.email);

  if (!email) {
    return {
      statusCode: 203,
      message: "Email is required",
    };
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return {
      statusCode: 203,
      message: "Invalid credentials",
    };
  }

  return {
    statusCode: 200,
    message: "Email verified successfully",
  };
};

export const forgotPasswordService = async (payload) => {
  const email = normalizeEmail(payload.email);

  const user = await findUserByEmail(email);
  if (!user) {
    return {
      statusCode: 203,
      message: "The provided information is not Valid!",
    };
  }

  const otp = generateOtp();

  await upsertTwoAuthByEmail(
    email,
    {
      userId: user.id || user._id,
      phone: user.phone,
      email,
      otp,
      isVerified: "0",
      otpExpiry: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    }
  );

  await Mail.sendOtp({
    To: email,
    Subject: "National Film Awards (NFA) Password Reset - One Time Code",
    Data: {
      clientName: `${user.firstName} ${user.lastName}`,
      otp,
    },
  });

  return {
    statusCode: 200,
    message: "An OTP has been sent to your registered email address.!!",
    cookie: {
      name: "resetEmail",
      value: email,
      options: cookieOptions,
    },
    data: process.env.NODE_ENV === "production" ? {} : { otp },
  };
};

export const verifyOtpService = async (payload) => {
  const email = normalizeEmail(payload.email);
  const { otp } = payload;

  const user = await findUserByEmail(email);
  if (!user) {
    return {
      statusCode: 203,
      message: "User not found",
    };
  }

  const authData = await findTwoAuthByUserId(user._id || user.id);
  if (!authData) {
    return {
      statusCode: 203,
      message: "OTP not found, please resend",
    };
  }

  const isDevBypass =
    process.env.NODE_ENV !== "production" &&
    process.env.ALLOW_DEV_OTP_BYPASS === "true" &&
    otp === "9999";

  if (!isDevBypass) {
    if (authData.otp !== otp) {
      return {
        statusCode: 203,
        message: "Invalid OTP entered",
      };
    }

    if (authData.otpExpiry < Date.now()) {
      return {
        statusCode: 203,
        message: "OTP has expired, please resend",
      };
    }
  }

  await updateTwoAuthById(authData.id, { isVerified: 1 });

  return {
    statusCode: 200,
    status: "success",
    message: "OTP verified successfully!",
  };
};

export const resendOtpService = async (payload) => {
  const email = normalizeEmail(payload.email);

  if (!email) {
    return {
      statusCode: 422,
      message: "Email is required",
    };
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return {
      statusCode: 203,
      message: "The provided information is not Valid!",
    };
  }

  const otp = generateOtp();

  await upsertTwoAuthByEmail(
    email,
    {
      userId: user.id || user._id,
      phone: user.phone,
      email,
      otp,
      isVerified: "0",
      otpExpiry: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    }
  );

  await Mail.sendOtp({
    To: email,
    Subject: "National Film Awards (NFA) Password Reset - One Time Code",
    Data: {
      clientName: `${user.firstName} ${user.lastName}`,
      otp,
    },
  });

  return {
    statusCode: 200,
    message: "An OTP has been sent to your registered email address!",
    cookie: {
      name: "resetEmail",
      value: email,
      options: cookieOptions,
    },
    data: process.env.NODE_ENV === "production" ? {} : { otp },
  };
};

export const resetPasswordService = async (payload) => {
  const email = normalizeEmail(payload.email);
  const { password } = payload;

  const authData = await findVerifiedTwoAuthByEmail(email);
  if (!authData) {
    return {
      statusCode: 203,
      message: "OTP not verified.",
      status: false,
    };
  }

  const hashedPassword = await hashPassword(password);

  await updateUserById(authData.userId, { password: hashedPassword });

  await deleteTwoAuthById(authData.id);

  return {
    statusCode: 200,
    message: "Password reset successfully.",
    status: true,
  };
};

export const changePasswordService = async ({ userId, currentPassword, password }) => {
  if (!userId) {
    return {
      statusCode: 401,
      msg: "Unauthorized",
      status: false,
    };
  }

  const user = await findUserById(userId);
  if (!user) {
    return {
      statusCode: 404,
      msg: "User not found",
    };
  }

  const isMatch = await comparePasswords(currentPassword, user.password);
  if (!isMatch) {
    return {
      statusCode: 203,
      msg: "Current password is incorrect",
      status: false,
    };
  }

  await updateUserById(userId, { password: await hashPassword(password) });

  return {
    statusCode: 200,
    message: "Password updated successfully",
    status: true,
  };
};

export const getUserDetailsService = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    return {
      statusCode: 203,
      message: "User not found",
    };
  }

  const { password, ...safeUser } = user;
  return {
    statusCode: 200,
    message: "User fetched successfully",
    user: safeUser,
  };
};

export const deleteUserService = async (userId) => {
  const user = await deleteUserById(userId);

  if (!user) {
    return {
      statusCode: 203,
      message: "User not found or already deleted",
    };
  }

  return {
    statusCode: 200,
    message: "User deleted successfully",
    user,
  };
};

export const forgotPasswordWithTokenService = async (payload) => {
  const email = normalizeEmail(payload.email);

  const user = await findUserByEmail(email);
  if (!user) {
    return {
      statusCode: 404,
      message: "User not found",
    };
  }

  const token = generateToken({
    userId: user.id || user._id,
    email: user.email,
  });

  await updateUserById(user.id, {
    resetPasswordToken: token,
    resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000),
  });

  const resetLink = `${process.env.FRONTEND_BASE_URL}/reset-password?token=${token}`;

  await Mail.resetPasswordMail({
    To: email,
    Subject: "National Film Awards (NFA) Password Reset - One Time Token",
    Data: {
      clientName: `${user.firstName} ${user.lastName}`,
      resetLink,
    },
  });

  return {
    statusCode: 200,
    message: "A reset email has been sent to your registered email address.!!",
  };
};

export const resetPasswordWithTokenService = async (payload) => {
  const { password, token } = payload;

  const user = await findUserByResetToken(token);

  if (!user) {
    return {
      statusCode: 203,
      message: "Invalid or expired token",
    };
  }

  await updateUserById(user.id, {
    password: await hashPassword(password),
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });

  return {
    statusCode: 200,
    message: "Password updated successfully",
  };
};
