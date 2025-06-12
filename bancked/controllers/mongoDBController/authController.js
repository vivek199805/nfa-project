
import { hashPassword } from '../../utils/hashPassword.js';
import { generateToken } from '../../utils/jwt.util.js';
import dotenv from "dotenv";
import { comparePasswords } from '../../utils/comparePasswords.js';
import User from "../../models/mongodbModels/user.js"
dotenv.config();


const registerUser = async (req, res, next) => {
  try {
    const {
      firstName, lastName, email, phone,
      address, pinCode, aadharNumber,
      category, password
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    console.log("existingUser", existingUser);

    if (existingUser) {
      return res.status(203).json({ message: 'Email already registered' });
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
      category,
      password: hashedPassword
    });

    await newUser.save();
    console.log("newUser", newUser);
    delete newUser.password;
    res.status(200).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const loginUser = async (req, res) => {
  try {
    const { username: email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    //compare password
    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }
    // 🔐 Generate JWT
    const token = generateToken({ userId: user._id, email: user.email });
    // // Optional: Add token to user's token list
    // user.tokens = user.tokens.concat({ token });
    // await user.save();
    delete user.password;

    const data = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      aadharNumber: user.aadharNumber,
      address: user.address,
      category: user.category,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      pinCode: user.pinCode,
      token,
    }
    res.status(200).json({ message: 'User login successfully', data });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    res.status(200).json({ message: 'Email verified successfully', statusCode: 200 });

  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token', error: err.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    // Remove the current token from the user's token list
    req.user.tokens = req.user.tokens.filter(t => t.token !== req.token);
    await req.user.save();

    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to logout', error: err.message });
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

const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'No user with that email found.' });

    res.status(200).json({ message: 'Otp Send successfully', data: { otp: 9999 },statusCode: 200 });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token', error: err.message });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // const user = await User.findOne({ email });
    // if (!user || !user.otp || !user.otpExpires)
    //   return res.status(400).json({ message: "OTP not found or expired" });

    // if (user.otp !== otp)
    //   return res.status(400).json({ message: "Invalid OTP" });

    // if (user.otpExpires < new Date())
    //   return res.status(400).json({ message: "OTP expired" });

    // user.otp = null;
    // user.otpExpires = null;
    // user.isVerified = true; 
    // await user.save();

        if (9999!= otp)return res.status(400).json({ message: "Invalid OTP" });

    res.status(200).json({ message: "OTP verified successfully",statusCode:200 });

  } catch (err) {
    res.status(500).json({ message: "OTP verification failed", error: err.message });
  }
};

// const getCurrentUser = async (req, res, next) => {
//   try {
//     const user = await account.get();
//     console.log("nnnnnnnnnnnn", user);

//     res.status(200).json({ message: 'User fetch successfully', user });

//   } catch (error) {
//     res.status(500).send({ message: "Invalid authentication credentials" });
//   }
// };

// const deleteUser = async (req, res, next) => {
//   try {
//     await req.user.remove(); // You had a stray `s` at the end here
//     res.send(req.user);
//   } catch (error) {
//     res.status(500).send({ message: "" });
//   }
// };

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

// const updatePassword = async (req, res, next) => {
//   const { currentPassword, newPassword } = req.body;
//   const userId = req.user.userId;

//   if (!currentPassword || !newPassword) {
//     return res.status(201).json({ msg: "Both current and new passwords are required" });
//   }

//   try {
//     // Fetch current user document from Appwrite
//     const user = await databases.getDocument(
//       process.env.APPWRITE_DATABASE_ID,
//       process.env.APPWRITE_USERS_COLLECTION_ID,
//       userId,
//     );
//     // Step 2: Compare current password
//     const isMatch = await comparePasswords(currentPassword, user.password);
//     if (!isMatch) {
//       return res.status(200).json({ msg: "Current password is incorrect", statuscode: 201 });
//     }

//     // Step 3: Hash new password
//     const hashed = await hashPassword(newPassword);

//     // Step 4: Update in Appwrite DB
//     await databases.updateDocument(
//       process.env.APPWRITE_DATABASE_ID,
//       process.env.APPWRITE_USERS_COLLECTION_ID,
//       userId,
//       { password: hashed }
//     );
//     res.status(200).json({ message: "Password updated successfully", statuscode: 200 });
//   } catch (err) {
//     res.status(500).json({ msg: "Password update failed" });
//   }
// }



export default {
  registerUser,
  loginUser,
  verifyEmail,
  logoutUser,
  logoutAllUser,
  resetPassword,
  verifyOtp
  // deleteUser,
  // getCurrentUser,
  // updateProfile,
  // updatePassword
};
