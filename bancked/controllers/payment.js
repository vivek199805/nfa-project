import { ID, Query } from "appwrite";
import { databases } from "../appWrite/client.js";
import dotenv from "dotenv";
dotenv.config();

const databaseId = process.env.APPWRITE_DATABASE_ID;
const collectionId = process.env.APPWRITE_PAYMENT_ID;

// CREATE Payment

const createPayment = async (req, res, next) => {
  const {
    brand,
    last4,
    expMonth,
    expYear,
    isDefault = false,
  } = req.body;

  const userId = req.user.userId;

  try {
    // If setting this Payment as default, unset others
    if (isDefault) {
      const list = await databases.listDocuments(databaseId, collectionId, [
        Query.equal("userId", userId),
        Query.equal("isDefault", true),
        // Query.orderDesc("$createdAt"), // or Query.orderAsc("name")
        // Query.limit(10),               // fetch up to 10 documents
        // Query.offset(0),               // start from the first document
      ]);
      for (const doc of list.documents) {
        await databases.updateDocument(databaseId, collectionId, doc.$id, {
          isDefault: false,
        });
      }
    }

    const doc = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      {
        userId,
        brand,
        last4,
        expMonth,
        expYear,
        isDefault
      }
    );

    res.status(200).json({msg:"Your payment method has been added successfully.", statusCode:200, data:doc});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all Payment for user
 const getPayments = async (req, res) => {
    const userId = req.user.userId;        
    try {
      const result = await databases.listDocuments(databaseId, collectionId, [
        Query.equal("userId", userId),
        // Query.orderDesc("$createdAt")
      ]);        
      res.status(200).json({msg:"Payment fetch successfully", statuscode:200, data:result.documents})
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

// UPDATE Payment
const updatePayment = async (req, res, next) => {
    const userId = req.user.userId;
    // const paymentId = req.params.id;
    const {
      id,
      brand,
      last4,
      expMonth,
      expYear,
      isDefault = false,
    } = req.body;
    const addressId = id;
  
    try {
      const address = await databases.getDocument(databaseId, collectionId, addressId);
      if (address.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
  
      // If setting as default, unset previous
      if (isDefault) {
        const list = await databases.listDocuments(databaseId, collectionId, [
            Query.equal("userId", userId),
            Query.equal("isDefault", true),
        ]);
        for (const doc of list.documents) {
          if (doc.$id !== addressId) {
            await databases.updateDocument(databaseId, collectionId, doc.$id, {
              isDefault: false,
            });
          }
        }
      }
  
      const updated = await databases.updateDocument(databaseId, collectionId, addressId, {
        brand,
        last4,
        expMonth,
        expYear,
        isDefault
      });

      res.status(200).json({msg:"Payment Updated Successfully", statuscode:200, data:updated});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};
// DELETE Payment
const deletePayment = async (req, res, next) => {
    const userId = req.user.userId;
    // const paymentId = req.params.id;
    const addressId = req.body.id;     
    try {
      const address = await databases.getDocument(databaseId, collectionId, addressId);    
      if (address.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
  
      await databases.deleteDocument(databaseId, collectionId, addressId);
      res.status(200).json({msg:"Your payment method has been deleted successfully.", statuscode:200,});

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};


export default {
    createPayment,
    getPayments,
    updatePayment,
    deletePayment,
};
