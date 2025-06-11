import express from 'express';
import ProductController from '../controllers/product.js';
const router = express.Router();


//  ==================for controllers folder================

// router.post("/create",ProductController.createProduct); 
// router.post("/getProducts", ProductController.getProduct); 
router.post("/ProductDetails", ProductController.getProductById); 
router.post("/search", ProductController.searchProduct); 


export default router;