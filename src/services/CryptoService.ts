import fetch from 'isomorphic-unfetch';
import { priceMultifull } from './mocks';

import { CRYPTO_API, CRYPTO_COINS, CRYPTO_ICONS_URL } from './constants';

export type CoinItem = {
  name: string;
  price: string;
  iconUrl: string;
  lastMarket?: string;
  histoMinute: CoinHistory[];
  priceChangeInDay: string;
  priceChangeInDayPerc: string;
};

function parserCurrency(input: string) {
  return input.replace(/[€\s,]+/g, '');
}

export const getCurrentCoinPosition = async (tsym = 'EUR'): Promise<CoinItem[]> => {
  const res = await fetch(`${CRYPTO_API}/data/pricemultifull?fsyms=${CRYPTO_COINS}&tsyms=${tsym}`);
  const body: (typeof priceMultifull) = await res.json();
  const coins = Object.keys(body.RAW);
  const priceDisplay = priceMultifull.DISPLAY;

  return Promise.all(
    coins.map(async (name: string) => {
      const display: (typeof priceDisplay)[keyof typeof priceDisplay] = body.DISPLAY[name];
      return {
        name: name,
        price: parserCurrency(display.EUR.PRICE),
        iconUrl: `${CRYPTO_ICONS_URL}/${name.toLowerCase()}.svg`,
        histoMinute: await getHistoMinute(name),
        priceChangeInDay: parserCurrency(display.EUR.CHANGEDAY),
        priceChangeInDayPerc: display.EUR.CHANGEPCTDAY,
      };
    })
  );
}

type CoinHistory = {
  low?: number;
  high?: number;
  time: number;
  open?: number;
  close: number;
  market?: string;
  volumeto?: number;
  volumefrom?: number;
};

export const getHistoMinute =
async (fsym = 'BTC', tsym = 'EUR', limit = 500): Promise<CoinHistory[]> => {
  const res = await fetch(
    `${CRYPTO_API}/data/histominute?fsym=${fsym}&tsym=${tsym}&limit=${limit}&tryConversion=false`
  );
  const body: { Data: CoinHistory[] } = await res.json();

  return body.Data;
};

type SocketSubscriptions = {
  [coinName: string]: {
    SubsNeeded: string[];
  };
}

export const getCoinsSubscriptions =
async (tsym = 'EUR'): Promise<string[]> => {
  const res = await fetch(`${CRYPTO_API}/data/subsWatchlist?fsyms=${CRYPTO_COINS}&tsym=${tsym}`);
  const body: SocketSubscriptions = await res.json();

  return Object.entries(body)
    .reduce((acc, [_, value]) => {
      if (value && value.SubsNeeded) {
        acc.push(...value.SubsNeeded);
      }
      return acc;
    }, [])
  ;
};
