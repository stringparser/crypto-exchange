const withTypescript = require('@zeit/next-typescript');

console.log('NODE_ENV', process.env.NODE_ENV);

exports = module.exports = withTypescript({
  assetPrefix: process.env.NODE_ENV === 'production'
    ? 'https://cdn.rawgit.com/stringparser/crypto-exchange/master/docs/'
    : '',
  pageExtensions: ['tsx', 'ts'],
});
