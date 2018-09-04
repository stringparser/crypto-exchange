import { Component } from 'react';

import PlotRow from '../components/plot/PlotRow';
import PageLayout from '../components/layout/PageLayout';
import PageSection from '../components/layout/PageSection';
import CoinStockArea from '../components/plot/CoinStockArea';
import { CoinItem, getCurrentCoinPosition } from '../services/CryptoService';

type State = {
  coins: CoinItem[];
  selectedCoin?: CoinItem;
};

class Home extends Component {
  state: State = {
    coins: [],
  };

  async componentDidMount() {
    const coins = await getCurrentCoinPosition();

    this.setState({
      coins
    });
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
