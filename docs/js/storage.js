
const LS_KEYS = {
  PRODUCTS: "sc_products",
  CART: "sc_cart"
};


const storage = {
  save: function (key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  load: function (key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error("Error leyendo storage", e);
      return fallback;
    }
  },
  clear: function (key) {
    localStorage.removeItem(key);
  }
};
