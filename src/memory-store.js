const map = new Map();

export default {
  get(key) {
    return map.get(key);
  },
  set(key, value) {
    map.set(key, value);
  },
  remove(key) {
    return map.delete(key);
  },
  has(key) {
    return map.has(key);
  },
  clear() {
    map.clear();
  },
  keys() {
    return Array.from(map.keys());
  }
};