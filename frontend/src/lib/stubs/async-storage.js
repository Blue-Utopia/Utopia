// Stub module for @react-native-async-storage/async-storage
// This is used by MetaMask SDK but not needed in web environments

// CommonJS export for compatibility
module.exports = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
  clear: async () => {},
  getAllKeys: async () => [],
  multiGet: async () => [],
  multiSet: async () => {},
  multiRemove: async () => {},
};

// ES6 export for compatibility
module.exports.default = module.exports;

