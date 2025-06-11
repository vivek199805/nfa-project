import axios from 'axios';

const BASE_URL = 'https://fakestoreapi.com';

// Mock data fallback
const mockProducts = [
  {
    id: 1,
    title: "Fjallraven - Foldsack No. 1 Backpack",
    price: 109.95,
    description: "Your perfect pack for everyday use and walks in the forest.",
    category: "men's clothing",
    image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
    rating: { rate: 3.9, count: 120 }
  },
  {
    id: 2,
    title: "Mens Casual Premium Slim Fit T-Shirts",
    price: 22.3,
    description: "Slim-fitting style, contrast raglan long sleeve...",
    category: "men's clothing",
    image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
    rating: { rate: 4.1, count: 259 }
  },
  // Add more mock products if needed
];

export async function fetchProducts() {
  try {
    const response = await axios.get(`${BASE_URL}/products`);
    if (response.status !== 200) throw new Error(`API error: ${response.statusText}`);
    return response.data;
  } catch (error) {
    return mockProducts;
  }
}

export async function fetchFeaturedProducts() {
  try {
    const products = await fetchProducts();
    return products.slice(0, 10);
  } catch (error) {
    return mockProducts.slice(0, 8);
  }
}

  export async function getSpecialOfferProducts() {
    try {
      const products = await fetchProducts();
      return products.filter(product => product.isSpecialOffer)
    } catch (error) {
    }
  }

export async function fetchProductById(id) {
  try {
    const response = await axios.get(`${BASE_URL}/products/${id}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    return mockProducts.find((p) => p.id === Number(id)) || null;
  }
}

export async function fetchProductsByCategory(category) {
  try {
    const response = await axios.get(`${BASE_URL}/products/category/${category}`);
    return response.data;
  } catch (error) {
    return mockProducts.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }
}

export async function submitReviewAPI({ productId, rating, comment }) {
  try {
    const response = await axios.post(`${BASE_URL}/products/${productId}/reviews`, {
      rating,
      comment
    });
    return response.data;
  } catch (error) {
    console.error("Failed to submit review:", error.message);
    throw error;
  }
}

 export async function searchProducts(query){
  const lowerQuery = query.toLowerCase();
  const results = await fetchProducts();
  return results.filter((product) =>
      product.category.toLowerCase().includes(lowerQuery) ||
      (product.description &&
        product.description.toLowerCase().includes(lowerQuery)),
  );
}
