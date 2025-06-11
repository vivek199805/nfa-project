
import { ID, Query } from 'appwrite';
import { account, databases } from '../appWrite/client.js';
import { hashPassword } from '../utils/hashPassword.js';
import { generateToken } from '../utils/jwt.util.js';
import dotenv from "dotenv";
import { comparePasswords } from '../utils/comparePasswords.js';
dotenv.config();

function createAccountClient(jwt) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID);
  const account = new Account(client);
  if (jwt) client.setJWT(jwt);
  return account;
}

const getUserByName = async (username) => {
   try {
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      [Query.equal('email', username)]
    )
    
    return response.documents;
   } catch (error) {
     return null;
   }

  }

const createUser = async (req, res, next) => {
  const { username, firstName, lastName, email, password } = req.body;

  const existingUser = await getUserByName(req.body.username);
  console.log("existingUser", existingUser);
  
  if (existingUser?.length > 0) {
    return res.status(201).send("Username already exists");
  }

  try {
    const hashedPassword = await hashPassword(password);
    // Create Appwrite user profile
   const response =  await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      ID.unique(),
      { username, firstName, lastName, email, password:hashedPassword }
    );

    const token = generateToken({ userId: response.$id, email });
    console.log('response', token);

    res.status(200).json({ message: 'User registered successfully', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


 const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query Appwrite for user by email
    const result = await getUserByName(email);

    // console.log(result);
    if (result.total === 0) {
      return res.status(201).json({ error: "Invalid credentials" });
    }
    const user = result[0];
    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // 🔐 Generate JWT
    const token = generateToken({ userId: user.$id, email: user.email });

    delete user.password;

    const data = {
      ...user,
      token
    }
    console.log(data);
    res.status(200).json({ message: 'User login successfully', data });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
};

const logoutUser = async (req, res, next) => {
  console.log('nnnnnnnnnnnnnnnnnn', );
  
  try {
    // const response =   await account.deleteSession("current");
    // res.status(200).json({ message: 'User logout successfully' });

    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: error.message });
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

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await account.get();
    console.log("nnnnnnnnnnnn", user);
    
    res.status(200).json({ message: 'User fetch successfully', user });

  } catch (error) {
    res.status(500).send({ message: "Invalid authentication credentials" });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await req.user.remove(); // You had a stray `s` at the end here
    res.send(req.user);
  } catch (error) {
    res.status(500).send({ message: "" });
  }
};

 const updateProfile = async (req, res, next) => {
  const {
    firstName = "",
    lastName = "",
    username = "",
    email = "",
    phone = "",
    dob = "",
    userId = ""
  } = req.body;

  // const userId = (req).user.userId; // user ID from JWT

  
  try {
    // Fetch current user document from Appwrite
    // const userDoc = await databases.getDocument(
    //   databaseId,
    //   collectionId,
    //   userId
    // );

    // Update the document
    const updated = await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      userId,
      {
        firstName,
        lastName,
        username,
        email,
        phone,
        dob
      }
    );
    res.status(200).json({ message: "Profile updated", user: updated });
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ error: err.message });
  }
 }

 const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;

  if (!currentPassword || !newPassword) {
    return res.status(201).json({ msg: "Both current and new passwords are required" });
  }
  
  try {
    // Fetch current user document from Appwrite
    const user = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      userId,
    );
        // Step 2: Compare current password
        const isMatch = await comparePasswords(currentPassword, user.password);
        if (!isMatch) {
          return res.status(200).json({ msg: "Current password is incorrect",statuscode:201 });
        }

    // Step 3: Hash new password
    const hashed = await hashPassword(newPassword);

    // Step 4: Update in Appwrite DB
    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      userId,
      { password: hashed }
    );
    res.status(200).json({ message: "Password updated successfully", statuscode:200 });
  } catch (err) {
    res.status(500).json({ msg: "Password update failed" });
  }
 }



export default {
  createUser,
  logoutUser,
  logoutAllUser,
  deleteUser,
  getCurrentUser,
  loginUser,
  updateProfile,
  updatePassword
};
