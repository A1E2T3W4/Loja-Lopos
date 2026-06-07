import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import I18nProvider from "./i18n";  // ← IMPORTANTE: importar o Provider

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Gestao from "./pages/Gestao";

import Home from "./pages/Home";
import Produtos from "./pages/Produtos";
import Carrinho from "./pages/Carrinho";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Perfil from "./pages/Perfil";


import "./styles/components.css";

const LojaLayout = ({ children }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
};

const AppRoutes = () => (
  <Routes>
    <Route path="/gestao/*" element={<Gestao />} />
   
    <Route
      path="/*"
      element={
        <LojaLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/carrinho" element={<Carrinho />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/perfil" element={<Perfil />} />
          </Routes>
        </LojaLayout>
      }
    />
  </Routes>
);

// App com I18nProvider envolvendo TUDO
const App = () => (
  <GoogleOAuthProvider clientId="962876254419-2f0bjvithckosnanio0frnvnrd7q2l2c.apps.googleusercontent.com">
    <AuthProvider>
      <CartProvider>
        <I18nProvider>  {/* ← Provider na raiz */}
          {/* ADICIONADO O BASENAME AQUI ABAIXO */}
          <BrowserRouter basename="/Loja-Lopos">
            <AppRoutes />
          </BrowserRouter>
        </I18nProvider>
      </CartProvider>
    </AuthProvider>
  </GoogleOAuthProvider>
);

export default App;
