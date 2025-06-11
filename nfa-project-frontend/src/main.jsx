// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// Import Bootstrap CSS and JS directly
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// Import Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'swiper/css';
import Swiper from 'swiper/bundle';

// import styles bundle
import 'swiper/css/bundle';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <App />
  // </StrictMode>,
)
