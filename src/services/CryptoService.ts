import fetch from 'isomorphic-unfetch';
import { CRYPTO_API, CRYPTO_URL } from './constants';

type TopCoinList = {
  Type: number;
  Data: TopCoinItem[];
  Message: string;
};

type TopCoinItem = {
  CoinInfo: {
    Id: string;
    Url: string;
    Name: string;
    Type: number;
    FullName: string;
    Internal: string;
    ImageUrl: string;
    Algorithm: string;
    ProofType: string;
    BlockTime: number;
    BlockReward: number;
    BlockNumber: number;
    DocumentType: string;
    NetHashesPerSecond: number;
  },
  ConversionInfo: {
    RAW: string[];
    Market: string;
    Supply: number;
    SubBase: string;
    Conversion: string;
    CurrencyTo: string;
    SubsNeeded: string[];
    CurrencyFrom: string;
    TotalVolume24H: number;
    ConversionSymbol: string;
  }
};

function toAbsoluteUrl(url: string) {
  return /^\//.test(url)
    ? `${CRYPTO_URL}${url}`
    : url
  ;
}

export async function getTopCoinList(limit = 10, tsym = 'EUR'): Promise<TopCoinItem[]> {
  const res = await fetch(`${CRYPTO_API}/data/top/totalvol?limit=${limit}&tsym=${tsym}`)
  const body: TopCoinList = await res.json();

  return body.Data.map(el => ({
    ...el,
    CoinInfo: {
      ...el.CoinInfo,
      Url: toAbsoluteUrl(el.CoinInfo.Url),
      ImageUrl: toAbsoluteUrl(el.CoinInfo.ImageUrl),
    }
  }));
}

type ActiveExchanges = {
  [name: string]: {
    isActive: boolean;
  };
};

export async function getActiveExchanges() {
  const res = await fetch(`${CRYPTO_API}/data/all/cccaggexchanges`);
  const body: ActiveExchanges = await res.json();

  return Object.entries(body)
    .reduce((acc, [key, value]) => {
      if (value.isActive) {
        acc.push(key);
      }
      return acc;
    }, [])
  ;
}
