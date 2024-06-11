const { join } = require('path');
const { Dotenv } = require('dotenv-webpack');

module.exports = {
  plugins: [
    new Dotenv({
      path: join(__dirname, '.env'),
      safe: true,
    }),
  ],
};
