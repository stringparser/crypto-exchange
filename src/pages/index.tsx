import { getTopCoinList } from '../services/CryptoService';
import { Component } from 'react';

class Home extends Component {
  async componentDidMount() {
    const coins = await getTopCoinList();
    console.log(coins);
  }

  render() {
    return <h1>hi</h1>;
  }
}

export default Home;
