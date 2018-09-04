import styled from 'styled-components';
import { Component, RefObject, createRef } from 'react';

import { coinColors } from './constants';

import { extent } from 'd3-array';
import { timeMinute, timeDay, timeHour } from 'd3-time';
import { AreaClosed } from '@vx/shape';
import { AxisBottom } from '@vx/axis';
import { curveMonotoneX } from '@vx/curve';
import { scaleTime, scaleLinear } from '@vx/scale';

import FlexLayout from '../layout/FlexLayout';
import { CoinItem, CoinHistory } from '../../services/CryptoService';

type StockAreaItem = {
  time: number;
  close: number;
};

// accessors
const xStock = (d: StockAreaItem) => new Date(d.time * 1000);
const yStock = (d: StockAreaItem) => d.close;

const PlotContainer = styled<Pick<Props, 'onClick'>, 'div'>('div')`
  color: white;
  stroke: white;
  display: inline-block;
  position: relative;

  ${({ onClick }) => onClick && 'cursor: pointer;'}
`;

const CoinSymbols = styled.div`
  top: 10px;
  left: 15px;
  position: absolute;

  display: flex;
  flex-direction: column;
  margin-right: 10px;
`;

const CoinValues = styled<Pick<Props, 'showAxis'>, 'div'>('div')`
  left: 15px;
  bottom: ${({ showAxis }) => showAxis ? '30px' : '15px' };
  position: absolute;

  display: block;
  white-space: pre-line;

  p {
    margin: 0;
  }
`;

const CoinName = styled.span``;
const CoinIcon = styled.img`
  max-width: 25px;
  max-height: 25px;
  border-radius: 50%;
`;

type PercChangeIconProps = {
  value: string;
};

const PercChangeIcon: React.SFC<PercChangeIconProps> = ({ value }) => (
  <span style={{
    width: '0',
    height: '0',
    display: 'inline-block',
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    [/^-/.test(value.trim()) ? 'borderTop' : 'borderBottom']:
      `6px solid ${/^-/.test(value.trim()) ? '#e84f4f' : '#0aea71'}`
    ,
    verticalAlign: 'middle',
  }} />
);

type Props = {
  coin?: CoinItem;
  width?: number;
  height?: number;
  onClick?: (ev: React.SyntheticEvent<HTMLElement>) => void;
  showAxis?: boolean;
  showControls?: boolean;
};

type State = {
  aggregateBy?: 'day' | 'hour' | 'minute';
};

class CoinStockArea extends Component<Props, State> {
  state: State = {
    aggregateBy: 'minute',
  };

  static defaultProps: Props = {
    width: 360,
    height: 160,
  };

  private svg: RefObject<SVGSVGElement>;

  constructor(props: Props, context: object) {
    super(props, context);

    this.svg = createRef<SVGSVGElement>();
  }

  onChangeAgreggation = (ev: React.SyntheticEvent<HTMLSelectElement>) => {
    const value = ev.currentTarget.value as State['aggregateBy'];

    if (/^(hour|minute)$/.test(value)) {
      this.setState({ aggregateBy: value });
    }
  }

  getPlotDomains(stock: CoinHistory[]): CoinHistory[] {
    const { aggregateBy } = this.state;

    const endTime = new Date(stock[stock.length - 1].time * 1000);
    const startTime = new Date(stock[0].time * 1000);

    console.log('endTime', endTime);
    console.log('startTime', startTime);

    const intervals = (
      aggregateBy === 'day' && timeDay.range(startTime, endTime) ||
      aggregateBy === 'hour' && timeHour.range(startTime, endTime) ||
      timeMinute.range(startTime, endTime)
    );

    return intervals
      .map(el => el.getTime() / 1000)
      .map((utime, index, utimes) => {
        const prev = utimes[index - 1] || 0;
        const next = utimes[index + 1] || 2 * Date.now();
        const values = stock.filter(el => el.time >= prev && el.time <= next);

        return {
          low: values.reduce((acc, el) => acc > el.close ? el.close : acc, 1E+6),
          high: values.reduce((acc, el) => acc < el.close ? el.close : acc, 0),
          time: utime,
          close: values.reduce((acc, el) => acc + el.close, 0) / values.length,
        };
      })
    ;
  }

  render() {
    const {
      coin: {
        name,
        price,
        iconUrl,
        lastMarket,
        histoMinute,
        priceChangeInDay,
        priceChangeInDayPerc,
      },
      width,
      height,
      showAxis,
      showControls,
    } = this.props;


    const stock = this.getPlotDomains(histoMinute);
    const { aggregateBy } = this.state;

    // scales
    const xScale = scaleTime({
      nice: true,
      range: [0, width],
      domain: extent(stock, xStock),
    });

    const yScale = scaleLinear({
      nice: true,
      range: [height, 0],
      domain: extent(stock, yStock),
    });

    return (
      <FlexLayout direction="column">
        <PlotContainer onClick={this.props.onClick}>
          <CoinSymbols>
            <CoinIcon src={iconUrl} />
            <CoinName>{name}</CoinName>
          </CoinSymbols>
          <CoinValues showAxis={showAxis}>
            <p>{price}€</p>
            {priceChangeInDay}{'€ '}
            <span style={{ marginRight: '10px' }} />
            <PercChangeIcon value={priceChangeInDayPerc} /> {priceChangeInDayPerc}%
            {lastMarket ? ` (${lastMarket})` : null}
          </CoinValues>
          <svg ref={this.svg} width={width} height={height}>
            <rect
              x={0}
              y={0}
              rx={4}
              fill={coinColors[name] || coinColors.defaultColor}
              width={width}
              height={height}
              stroke="transparent"
            />
            <defs>
              <linearGradient
                id="gradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="#FFFFFF"
                  stopOpacity={0.9}
                />
                <stop
                  offset="100%"
                  stopColor="#FFFFFF"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <AreaClosed
              x={xStock}
              y={yStock}
              data={stock}
              fill={'url(#gradient)'}
              curve={curveMonotoneX}
              stroke={'url(#gradient)'}
              xScale={xScale}
              yScale={yScale}
              strokeWidth={1}
            />
            {showAxis && <AxisBottom
              top={height - 30}
              left={0}
              scale={xScale}
              hideTicks={true}
              hideAxisLine={true}
            />}
          </svg>
        </PlotContainer>
        {showControls && (
          <div>
            Aggregated by{' '}
            <select onChange={this.onChangeAgreggation} value={aggregateBy}>
              <option value="minute">minute</option>
              <option value="hour">hour</option>
            </select>
          </div>
        )}
      </FlexLayout>
    );
  }
}

export default CoinStockArea;
