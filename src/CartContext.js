import React, {createContext, useContext, useState, useEffect} from 'react';

const CartContext = createContext();
const API_BASE_URL = 'https://cedrick-unlunated-gwyn.ngrok-free.app';
export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({children}) => {
  const [cartCount, setCartCount] = useState(0);

  const fetchAndSetCartCount = async () => {
    const token = global.userToken;
    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      const cartResponse = await fetch(`${API_BASE_URL}/api/cart/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const cartData = await cartResponse.json();

      if (cartData.success) {
        let newCount = 0;
        for (const itemId in cartData.cartData) {
          newCount += cartData.cartData[itemId];
        }
        setCartCount(newCount);
      } else {
        setCartCount(0); // Reset jika fetch gagal
        console.error('Failed to fetch cart data:', cartData.message);
      }
    } catch (error) {
      console.error('Network error fetching cart:', error);
      setCartCount(0); // Reset jika terjadi kesalahan jaringan
    }
  };

  const incrementCart = () => {
    setCartCount(prevCount => prevCount + 1);
    fetchAndSetCartCount(); // Fetch ulang untuk sinkronisasi
  };

  const decrementCart = () => {
    setCartCount(prevCount => Math.max(0, prevCount - 1));
    fetchAndSetCartCount(); // Fetch ulang untuk sinkronisasi
  };

  const resetCartCount = () => {
    setCartCount(0);
    fetchAndSetCartCount(); // Fetch ulang untuk sinkronisasi
  };

  const value = {
    cartCount,
    incrementCart,
    decrementCart,
    resetCartCount,
    fetchAndSetCartCount, // Expose this function for external use
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
