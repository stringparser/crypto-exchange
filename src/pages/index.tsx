import { Component } from 'react';

import PlotRow from '../components/plot/PlotRow';
import PageLayout from '../components/layout/PageLayout';
import PageSection from '../components/layout/PageSection';
import CoinStockArea from '../components/plot/CoinStockArea';
import { CoinItem, getCurrentCoinPosition, getCoinsSubscriptions } from '../services/CryptoService';

import { CRYPTO_WS_API } from '../services/constants';
import { parseWebSocketMessage } from '../services/helpers';

type State = {
  coins: CoinItem[];
  coinSubs: string[];
  selectedCoin?: CoinItem;
};

class Home extends Component {
  state: State = {
    coins: [],
    coinSubs: [],
  };

  private ws: SocketIOClient.Socket;

  async componentDidMount() {
    const coins = await getCurrentCoinPosition();
    const coinSubs = await getCoinsSubscriptions();
    const socketIO = await import('socket.io-client');

    this.ws = this.ws || socketIO.connect(CRYPTO_WS_API);
    this.ws.emit('SubAdd', { subs: coinSubs });

    this.ws.on('m', (message) => {
      const changedCoin = parseWebSocketMessage(message, this.state.coins);

      console.log('message', message);
      console.log('changedCoin', changedCoin);
      if (!changedCoin) return null;

      const coins = this.state.coins.map((coin) => {
        if (coin.name === changedCoin.name) {
          return changedCoin;
        } else {
          return coin;
        }
      });

      this.setState({
        coins,
        selectedCoin: this.state.selectedCoin && this.state.selectedCoin.name === changedCoin.name
          ? changedCoin
          : this.state.selectedCoin
      });
    });

    this.setState({
      coins,
      coinSubs,
    });
  }

  componentWillUnmount() {
    this.ws.emit('SubRemove', { subs: this.state.coinSubs });
    this.ws.close();
  }

  onSelectCoin = (coin: CoinItem) => () => {
    this.setState({ selectedCoin: coin });
  }

  render() {
    const { coins, selectedCoin } = this.state;

    return (
      <PageLayout>
        <PlotRow>
          {coins.map((coin, index) => (
            <CoinStockArea
              key={index}
              coin={coin}
              onClick={this.onSelectCoin(coin)}
            />
          ))}
        </PlotRow>
        {selectedCoin &&
          <PageSection>
            <CoinStockArea
              coin={selectedCoin}
              width={500}
              height={300}
            />
          </PageSection>
        }
      </PageLayout>
    );
  }
}

export default Home;
