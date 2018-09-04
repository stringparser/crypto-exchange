import fetch from 'isomorphic-unfetch';
import { CRYPTO_API, CRYPTO_COINS, CRYPTO_ICONS_URL } from './constants';
import { mock, histoMinute, priceMultifull } from './mocks';

export type CoinItem = {
  name: string;
  iconUrl: string;
  histoMinute: CoinHistory[];
  price: string;
  priceChangeInDay: string;
  priceChangeInDayPerc: string;
};

export const getCurrentCoinPosition = async (tsym = 'EUR'): Promise<CoinItem[]> => {
  const res = await fetch(`${CRYPTO_API}/data/pricemultifull?fsyms=${CRYPTO_COINS}&tsyms=${tsym}`);
  const body: (typeof priceMultifull) = await res.json();
  const coins = Object.keys(body.RAW).slice(0, 3);
  const priceDisplay = priceMultifull.DISPLAY;

  return Promise.all(
    coins.map(async (name: string) => {
      const display: (typeof priceDisplay)[keyof typeof priceDisplay] = body.DISPLAY[name];
      return {
        name: name,
        iconUrl: `${CRYPTO_ICONS_URL}/${name.toLowerCase()}.svg`,
        histoMinute: await getHistoMinute(name),
        price: display.EUR.PRICE.split(/\s+/).reverse().join(' '),
        priceChangeInDay: display.EUR.CHANGEDAY.split(/\s+/).reverse().join(' '),
        priceChangeInDayPerc: display.EUR.CHANGEPCTDAY.split(/\s+/).reverse().join(' '),
      };
    })
  );
}

type CoinHistory = {
  low: number;
  high: number;
  time: number;
  open: number;
  close: number;
  volumeto: number;
  volumefrom: number;
};

export const getHistoMinute = mock(
  histoMinute,
  false,
  async function getHistoMinute(fsym = 'BTC', tsym = 'EUR', limit = 100): Promise<CoinHistory[]> {
    const res = await fetch(
      `${CRYPTO_API}/data/histominute?fsym=${fsym}&tsym=${tsym}&limit=${limit}&tryConversion=false`
    );
    const body: { Data: CoinHistory[] } = await res.json();

    return body.Data;
  }
);
