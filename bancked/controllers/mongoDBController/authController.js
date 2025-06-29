import { hashPassword } from "../../utils/hashPassword.js";
import { generateToken } from "../../utils/jwt.util.js";
import dotenv from "dotenv";
import { comparePasswords } from "../../utils/comparePasswords.js";
import User from "../../models/mongodbModels/user.js";
import generateOtp from "../../utils/generate-otp.js";
import Twoauth from "../../models/mongodbModels/twoAuth.js";
dotenv.config();

const registerUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      pinCode,
      aadharNumber,
      category:usertype,
      password,
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    console.log("existingUser", existingUser);

    if (existingUser) {
      return res.status(203).json({ message: "Email already registered" });
    }

    const hashedPassword = await hashPassword(password);
    console.log("hashedPassword", hashedPassword);
    // Create Appwrite user profile
    const newUser = new User({
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

    await newUser.save();
    console.log("newUser", newUser);
    delete newUser.password;
    res
      .status(200)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username: email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ message: "Invalid credentials", statusCode: 203 });
    }

    console.log(user);
    

    //compare password
    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      return res.status(200).json({ message: "Email or password is incorrect", statusCode: 203 });
    }
    // 🔐 Generate JWT
    const token = generateToken({ userId: user._id, email: user.email });
    // // Optional: Add token to user's token list
    // user.tokens = user.tokens.concat({ token });
    // await user.save();
    delete user.password;
    // Prepare user data to send in response
    const data = {
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
    };
    res.status(200).json({ message: "User login successfully", data });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
        console.log("user", email);
    // Validate input
    if (!email) {
      return res.status(200).json({ message: "Email are required", statusCode: 203 });
    }

    // Find user by email
    const user = await User.findOne({email});
    if (!user) return res.status(200).json({ message: "Invalid credentials", statusCode: 203 });

    

    res.status(200).json({
       message: "Email verified successfully",
        statusCode: 200
       });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Invalid or expired token", error: err.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    // Remove the current token from the user's token list
    req.user.tokens = req.user.tokens.filter((t) => t.token !== req.token);
    await req.user.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ message: "Failed to logout", error: err.message });
  }
};

const logoutAllUser = async (req, res, next) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send({ message: "Invalid authentication credentials" });
  }
};

const forgotPassword  = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOtp();
    const user = await User.findOne({ email });
    if (!user)
      return res.status(200).json({
        message: "The provided information is not Valid!",
        statusCode: 200,
      });
    // Generate a new password and update the user's password
    const twoAuth = await Twoauth.findOne({ email: user.email });
    console.log(twoAuth);

    if (!twoAuth) {
      const data = new Twoauth({
        userId: user._id,
        phone: user.phone,
        email: user.email,
        otp: otp,
        isVerified: "0",
        otpExpiry: Date.now() + 5 * 60 * 1000, // 5 minutes
      });
      await data.save();
    } else {
      twoAuth.userId = user._id;
      twoAuth.otp = otp;
      twoAuth.isVerified = "0";
      twoAuth.otpExpiry = Date.now() + 300000;
      await twoAuth.save();
    }

    res.status(200).json({
      message: "Otp Send successfully",
      data: { otp },
      statusCode: 200,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const verifyOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(200).json({ message: "User not found", statusCode: 203 });
    const authdata = await Twoauth.findOne({
      userId: user._id,
      // email: user.email,
      // isVerified: 0,
    });
    
    if (!authdata) {
      return res.status(200).json({
          message: "OTP not matched!!, Please resend OTP!!",
          statusCode: 203,
        });
    }
    if (authdata.otp != req.body.otp) {
      return res.status(200).json({ 
        message: "Invalid OTP entered.!!",
         statusCode: 203 
      });
    }

    // Check OTP expiry

    if (authdata.otpExpiry < Date.now()) {
      return res.status(200).json({
          message: "OTP has expired. Please resend OTP!!",
          statusCode: 203,
        });
    }

    // Update OTP verification status
    authdata.isVerified = 1;
    await authdata.save();

    return res.status(200).json({
      status: "success",
      message: "OTP verified successfully!",
      statusCode: 200,
    });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed", error: err.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password"); // exclude password
    if (!user) {
      return res.status(200).json({ message: "User not found", statusCode: 203 });
    }

    res.status(200).json({ message: "User fetched successfully", user, statusCode: 200 });
  } catch (error) {
    console.error("Get Current User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);

    if (!user) {
      return res.status(200).json({ message: "User not found or already deleted", statusCode: 203 });
    }

    res.status(200).json({ message: "User deleted successfully", user, statusCode: 200 });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// const updateProfile = async (req, res, next) => {
//   const {
//     firstName = "",
//     lastName = "",
//     username = "",
//     email = "",
//     phone = "",
//     dob = "",
//     userId = ""
//   } = req.body;

//   // const userId = (req).user.userId; // user ID from JWT

//   try {
//     // Fetch current user document from Appwrite
//     // const userDoc = await databases.getDocument(
//     //   databaseId,
//     //   collectionId,
//     //   userId
//     // );

//     // Update the document
//     const updated = await databases.updateDocument(
//       process.env.APPWRITE_DATABASE_ID,
//       process.env.APPWRITE_USERS_COLLECTION_ID,
//       userId,
//       {
//         firstName,
//         lastName,
//         username,
//         email,
//         phone,
//         dob
//       }
//     );
//     res.status(200).json({ message: "Profile updated", user: updated });
//   } catch (err) {
//     console.error("Profile update error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// }

const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  console.log(req.user);
  
  const userId = req.user.userId; // Assuming you're setting this from middleware

  if (!currentPassword || !newPassword) {
    return res.status(200).json({ msg: "Both current and new passwords are required", status: false, statusCode: 203 });
  }

  try {
    // Step 1: Fetch user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Step 2: Compare current password
    const isMatch = await comparePasswords(currentPassword, user.password);
    if (!isMatch) {
      return res.status(200).json({ msg: "Current password is incorrect", status: false, statusCode: 203 });
    }

    // Step 3: Hash new password
    const hashed = await hashPassword(newPassword);

    // Step 4: Update password in database
    user.password = hashed;
    await user.save();

    res.status(200).json({ message: "Password updated successfully", status: true, statusCode: 200 });

  } catch (err) {
    res.status(500).json({ msg: "Password update failed" });
  }
};


const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and new password are required." });
  }

  try {
    // Step 1: Check OTP verification status
    const authData = await Twoauth.findOne({ email, isVerified: 1 });

    if (!authData) {
      return res.status(200).json({ message: "OTP not verified." , status: false, statusCode: 203 });
    }

    // Step 2: Update user's password
    const hashed = await hashPassword(newPassword);
    const user = await User.findOneAndUpdate(
      { _id: authData.userId },
      { password: hashed },
      { new: true }
    );

    // Step 3: Optionally delete the OTP record
    await Twoauth.deleteOne({ _id: authData._id });

    res.status(200).json({ message: "Password reset successfully." });

  } catch (error) {
    res.status(500).json({ message: "Server error while resetting password." });
  }
};

export default {
  registerUser,
  loginUser,
  verifyEmail,
  logoutUser,
  logoutAllUser,
  resetPassword,
  verifyOtp,
  changePassword,
  forgotPassword,
  deleteUser,
getUserDetails
  // updateProfile,
};
