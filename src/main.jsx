import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import I18nProvider from "./i18n";

// Na raiz da app:
<I18nProvider>
  <App />
</I18nProvider>

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="962876254419-2f0bjvithckosnanio0frnvnrd7q2l2c.apps.googleusercontent.com">
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </GoogleOAuthProvider>
);