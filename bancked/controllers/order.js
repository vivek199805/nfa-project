import { ID, Query } from "appwrite";
import { databases } from "../appWrite/client.js";
import dotenv from "dotenv";
dotenv.config();

const databaseId = process.env.APPWRITE_DATABASE_ID;
const ordersCollectionId = process.env.APPWRITE_ORDERS_COLLECTION_ID;
const orderItemsCollectionId = process.env.APPWRITE_ORDERS_ITEMS_COLLECTION_ID;

const generateOrderNumber = () => {
  const prefix = "ORD";
  const random = Math.floor(1000 + Math.random() * 9000); // e.g., 1234
  return `${prefix}-${random}`;
};

// Add item to cart
const create = async (req, res) => {
  const {
    totalAmount,
    shippingAddress,
    paymentMethod,
    items,
  } = req.body;

  const userId = req.user.userId;
  try {
    const order = await databases.createDocument(
      databaseId,
      ordersCollectionId,
      ID.unique(),
      {
        orderNumber: generateOrderNumber(),
        userId,
        totalAmount,
        shippingAddress: JSON.stringify(shippingAddress),
        paymentMethod,
        status: "pending",
      }
    );   
        
    // After creating the main order
    const orderId = order.$id;

    await Promise.all(
      items.map((item) =>        
        databases.createDocument(
          databaseId,
          orderItemsCollectionId,
          ID.unique(),
          {
           orderId,
           productId: item.productId.toString(),
           productName: item.product.title,
           productImage: item.product.image,
           quantity: item.quantity,
            price:item.product.price,
          }
        )
      )
    );

    res.status(200).json({msg: "Order added  successfullly.",data: order, statuscode: 200 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const orderHistory = async (req, res) => {
  const userId = req.user.userId;
  try {
    // Step 1: Get user's orders
    const ordersRes = await databases.listDocuments(databaseId, 
      ordersCollectionId, [
      Query.equal("userId", userId),
      // Query.orderDesc("createdAt"),
    ]);

    const ordersWithItems = [];

    for (const order of ordersRes.documents) {
      // Step 2: Get items for this order
      const itemsRes = await databases.listDocuments(
        databaseId,
        orderItemsCollectionId,
        [Query.equal("orderId", order.$id)]
      );
   
      ordersWithItems.push({
        ...order,
        items: itemsRes.documents,
      });
    }

    ordersWithItems.map(item => {
      item.shippingAddress = JSON.parse(item.shippingAddress)
    })

    res.status(200).json({ msg:'fetch successfully', data: ordersWithItems, statuscode: 200 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const recentOrder = async (req, res) => {
  const userId = req.user.userId;
  try {
    // Step 1: Get user's orders
    const ordersRes = await databases.listDocuments(databaseId, 
      ordersCollectionId, [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(5)
    ]);

    const ordersWithItems = [];

    for (const order of ordersRes.documents) {
      // Step 2: Get items for this order
      const itemsRes = await databases.listDocuments(
        databaseId,
        orderItemsCollectionId,
        [Query.equal("orderId", order.$id)]
      );
   
      ordersWithItems.push({
        ...order,
        items: itemsRes.documents,
      });
    }

    ordersWithItems.map(item => {
      item.shippingAddress = JSON.parse(item.shippingAddress)
    })

    res.status(200).json({ msg:"Error fetching recent orders:", data: ordersWithItems, statuscode: 200 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  create,
  orderHistory,
  recentOrder
};
