const withTypescript = require('@zeit/next-typescript');

console.log('NODE_ENV', process.env.NODE_ENV);

exports = module.exports = withTypescript({
  assetPrefix: process.env.NODE_ENV === 'production'
    ? 'https://stringparser.github.io/crypto-exchange/docs/'
    : '',
  pageExtensions: ['tsx', 'ts'],
});
