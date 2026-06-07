import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (produto) => {
    setCart((prev) => {
      const id = produto.id || produto.id_produto;
      const existe = prev.find((item) => item.id === id);
      if (existe) {
        return prev.map((item) =>
          item.id === id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prev, {
        ...produto,
        id: id,
        imagem: produto.imagem_url || produto.imagem,
        quantidade: 1
      }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantidade = (id, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantidade: Math.max(1, item.quantidade + delta) }
          : item
      )
    );
  };

  // ── Limpa todo o carrinho (usado após finalizar compra) ──────────────────
  const clearCart = () => setCart([]);

  const total = cart.reduce(
    (acc, item) => acc + item.preco * item.quantidade, 0
  );

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantidade, total, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
