import { fetchFeaturedProducts, fetchProductById, fetchProducts, getSpecialOfferProducts, searchProducts } from "../../services/products.js";


  const fetchAllProducts = async (req, res) => {
    try {
      const products = await fetchProducts();
      res.status(200).json({ msg: "products fetch successfully", data: products, statuscode:200 });
    } catch (error) {
      res.status(500).json({ error: err.message });
    }

};

 const featuredProduct = async (req, res) => {
  try {
    const products = await fetchFeaturedProducts();
    res.status(200).json({ msg: "featuredProduct fetch successfully", data: products, statuscode:200 });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

 const SpecialOffer =  async (req, res) => {
  try {
    const products = await getSpecialOfferProducts();
    res.status(200).json({ msg: "fetch successfully", data: products, statuscode:200 });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

  const getProductById =  async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }
  try {
    const products = await fetchProductById(id);
    res.status(200).json({ msg: "fetch successfully", data: products, statuscode:200 });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
  
};

// This endpoint with no param is used for empty search query handling
 const searchProduct =  async (req, res) => {
  // const query = req.query.q;
  const {query} = req.body;
  
  try {
    if (!query) {
      return res.json([]);
    }
    const products = await searchProducts(query);
    res.status(200).json({ msg: "fetch successfully", data: products, statuscode:200 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export default {
  fetchAllProducts,
  featuredProduct,
  SpecialOffer,
  getProductById,
  searchProduct
};