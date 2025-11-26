const generateConsigneeNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `CN${timestamp}${random}`;
};

const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

const convertObjectKeys = (obj, converter) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertObjectKeys(item, converter));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const newKey = converter(key);
      result[newKey] = convertObjectKeys(obj[key], converter);
      return result;
    }, {});
  }
  return obj;
};

const toSnakeCase = (obj) => convertObjectKeys(obj, camelToSnake);
const toCamelCase = (obj) => convertObjectKeys(obj, snakeToCamel);

module.exports = {
  generateConsigneeNumber,
  camelToSnake,
  snakeToCamel,
  toSnakeCase,
  toCamelCase,
};
