const withTypescript = require('@zeit/next-typescript');

console.log('NODE_ENV', process.env.NODE_ENV);

exports = module.exports = withTypescript({
  pageExtensions: ['tsx', 'ts'],
});
