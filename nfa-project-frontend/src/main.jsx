// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AppProviders } from "./app/providers";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "swiper/css";
import "swiper/css/bundle";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <AppProviders>
    <App />
  </AppProviders>,
  // </StrictMode>,
);
