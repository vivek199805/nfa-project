import { ID, Query } from "appwrite";
import { databases } from "../../appWrite/client.js";
import dotenv from "dotenv";
import { fetchProductById } from "../../services/products.js";
dotenv.config();

const databaseId = process.env.APPWRITE_DATABASE_ID;
const collectionId = process.env.APPWRITE_CART_COLLECTION_ID;

// Add item to cart
 const addCartitem =  async (req, res) => {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;
    try {
    //   Check if item already exists in cart
      const existing = await databases.listDocuments(databaseId, collectionId, [
        Query.equal("userId", userId),
        Query.equal("productId", productId),
      ]);

      if (existing.total > 0) {
        const existingItem = existing.documents[0];
        const updated = await databases.updateDocument(databaseId, collectionId, existingItem.$id, {
          quantity: existingItem.quantity + quantity,
        });
        return res.json(updated);
      }
      const newItem = await databases.createDocument(databaseId, collectionId, ID.unique(), {
        userId,
        productId,
        quantity,
      });
  
      res.status(200).json({msg: 'Item added to cart', data:newItem, statuscode: 200});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  // Get user's cart
  const cartList = async (req, res) => {
    const userId = req.user.userId;
  
    try {
      const cart = await databases.listDocuments(databaseId, collectionId, [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
      ]);
  
      if (cart.total === 0) return  res.status(200).json({ msg: "fetch successfully", data: [], statuscode:200 });
  
      const enrichedCart = await Promise.all(
        cart.documents.map(async (item) => {
          const product = await fetchProductById(item.productId);
          return {
            ...item,
            product: product || null,
          };
        })
      );      
  
     res.status(200).json({ msg: "fetch successfully", data: enrichedCart, statuscode:200 });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  
// Update quantity of cart item
  const updateQuantityOfCart =  async (req, res) => {
    const userId = req.user.userId;
    const {id, quantity } = req.body;    
  
    try {
      const item = await databases.getDocument(databaseId, collectionId,id);
      if (item.userId !== userId) return res.status(403).json({ error: "Unauthorized" });
       console.log(item);
       
      const updated = await databases.updateDocument(databaseId, collectionId, item.$id, {
        quantity,
      });
  
      res.status(200).json({ msg: "updated successfully", data: updated, statuscode:200 });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  // Remove item from cart
   const removeItem = async (req, res) => {
    const userId = (req).user.userId;
    const { id } = req.body;
  
    try {
      const item = await databases.getDocument(databaseId, collectionId, id);
      if (item.userId !== userId) return res.status(403).json({ error: "Unauthorized" });
  
      await databases.deleteDocument(databaseId, collectionId, item.$id);
      res.status(200).json({ message: "Item has been removed from your cart." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

   const clearCart = async (req, res) => {
    try {
      const userId = req.user?.userId; // This assumes you're using JWT middleware to set req.user
  
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      // 1. Get all cart items for the user
      const cartItems = await databases.listDocuments(
        databaseId,
        collectionId,
        [Query.equal('userId', userId)]
      );
  
      // 2. Delete all items
      const deletePromises = cartItems.documents.map((item) =>
        databases.deleteDocument(databaseId, collectionId, item.$id)
      );
  
      await Promise.all(deletePromises);
  
      res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear cart' });
    }
  };


export default {
    addCartitem,
    cartList,
    updateQuantityOfCart,
    removeItem,
    clearCart
};
