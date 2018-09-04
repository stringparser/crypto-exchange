import { CoinItem } from './CryptoService';
import { TODAY_UNIX_TIME } from './constants';

function formatNumber(input: string) {
  const [whole, decimals] = input.split('.');
  const formatted = `${whole}.${(decimals ||  '00').slice(0, 2)}`;
  return formatted;
}

export function parseWebSocketMessage(message: string, coins: CoinItem[]): null | CoinItem {
  const [
    SubscriptionId,
    ExchangeName,
    FromCurrency,
    ToCurrency,
    Flag,
    Price,
    _a,
    _b,
    LastUpdate,
    LastVolume,
    LastVolumeTo,
    LastTradeId,
    Volume24h,
    Volume24hTo,
    lastMarket,
  ] = message.split('~');
  // Flag is for 1: price up, 2: price down, 4: prince unchanged
  // see: https://www.cryptocompare.com/api#-api-web-socket-current-
  if (!/^(1|2)$/.test(Flag)) {
    return null;
  }

  const coin = coins.find(coin => coin.name === FromCurrency);
  const priceNum = parseFloat(formatNumber(Price));
  const firstTrade = coin && coin.histoMinute.find(el => el.time >= TODAY_UNIX_TIME);

  if (!firstTrade || !priceNum) {
    return null;
  }

  return ({
    ...coin,
    histoMinute: coin.histoMinute.concat({
      time: Math.floor(Date.now() / 1000),
      close: priceNum,
      volumeto: parseFloat(Volume24hTo) || undefined,
      volumefrom: parseFloat(Volume24h) || undefined
    }),
    lastMarket: /^[a-z]+$/i.test(lastMarket) ? lastMarket : 'CryptoCompare',
    priceChangeInDay: formatNumber(`${priceNum - firstTrade.close}`),
    priceChangeInDayPerc: formatNumber(`${(priceNum - firstTrade.close) * 100 / firstTrade.close}`),
  });
}
