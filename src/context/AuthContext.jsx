import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const normalizar = (cliente) => {
  if (!cliente) return null;
  return { ...cliente, id: cliente.id || cliente.id_cliente };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("luxe_cliente");
      return stored ? normalizar(JSON.parse(stored)) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const sync = () => {
      try {
        const stored = localStorage.getItem("luxe_cliente");
        setUser(stored ? normalizar(JSON.parse(stored)) : null);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener("clienteAtualizado", sync);
    return () => window.removeEventListener("clienteAtualizado", sync);
  }, []);

  const logout = () => {
    localStorage.removeItem("luxe_token");
    localStorage.removeItem("luxe_cliente");
    setUser(null);
    window.dispatchEvent(new CustomEvent("clienteAtualizado"));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
