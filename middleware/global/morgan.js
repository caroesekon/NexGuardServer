const morgan = require('morgan');
const logger = require('../../utils/logger');

const stream = {
  write: (message) => logger.info(message.trim()),
};

const skip = () => process.env.NODE_ENV === 'test';

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

module.exports = morganMiddleware;