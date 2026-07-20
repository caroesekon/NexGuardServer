const crypto = require('crypto');

const PREFIX = 'NXG';

const generateSegment = () => {
  return crypto.randomBytes(2).toString('hex').toUpperCase().slice(0, 4);
};

const generateKey = (plan) => {
  const planPrefix = plan.substring(0, 4).toUpperCase().padEnd(4, 'X');
  const segments = [
    planPrefix,
    generateSegment(),
    generateSegment(),
    generateSegment(),
    generateSegment(),
  ];
  return `${PREFIX}-${segments.join('-')}`;
};

const validateKey = (key) => {
  const pattern = /^NXG-[A-Z0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;
  return pattern.test(key);
};

const parseKey = (key) => {
  const parts = key.split('-');
  return {
    prefix: parts[0],
    plan: parts[1],
  };
};

module.exports = { generateKey, validateKey, parseKey };