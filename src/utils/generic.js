/**
 * Good to have utilities
 */

export const trimStrLength = (str, length) => {
  length = length || 30;
  if (str.length > length) {
    const eachSide = parseInt(length / 2 - 1);
    return `${str.substr(0, eachSide)}...${str.substr(-eachSide)}`;
  }
  return str;
};

export const memoize = (fn) => {
  // 1
  const cache = {}; // 2
  return (...args) => {
    // 3
    const stringifiedArgs = JSON.stringify(args); // 4
    const result = (cache[stringifiedArgs] = cache[stringifiedArgs] || fn(...args)); // 5
    return result; // 6
  };
};
