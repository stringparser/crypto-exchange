import styled from 'styled-components';
import { Component, RefObject, createRef } from 'react';

import { extent } from 'd3-array';

import { AreaClosed } from '@vx/shape';
import { curveMonotoneX } from '@vx/curve';
import { scaleTime, scaleLinear } from '@vx/scale';

import { CoinItem } from '../../services/CryptoService';
import { coinColors } from './constants';

type StockAreaItem = {
  time: number;
  close: number;
};

// accessors
const xStock = (d: StockAreaItem) => new Date(d.time * 1000);
const yStock = (d: StockAreaItem) => d.close;

// styles
const gutter = '10px';

const PlotContainer = styled<Pick<Props, 'onClick'>, 'div'>('div')`
  color: white;
  display: inline-block;
  position: relative;

  ${({ onClick }) => onClick && 'cursor: pointer;'}
`;

const CoinTopInfo = styled.div`
  top: ${gutter};
  left: ${gutter};
  position: absolute;

  display: flex;
  align-items: center;

  & > *:not(:first-child) {
    margin-left: 5px;
  }
`;

const CoinName = styled.span``;
const CoinIcon = styled.img`
  max-width: 25px;
  max-height: 25px;
  border-radius: 50%;
`;

const CoinBottomInfo = styled.div`
  left: ${gutter};
  bottom: ${gutter};
  position: absolute;

  display: block;
  align-items: center;
  white-space: pre-line;
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
};

class CoinStockArea extends Component<Props> {
  static defaultProps: Props = {
    width: 300,
    height: 160,
  };

  private svg: RefObject<SVGSVGElement>;

  constructor(props: Props, context: object) {
    super(props, context);
    this.svg = createRef<SVGSVGElement>();
  }

  render() {
    const {
      coin: {
        name,
        price,
        iconUrl,
        histoMinute: stock,
        priceChangeInDay,
        priceChangeInDayPerc,
      },
      width,
      height,
    } = this.props;

    // bounds
    const xMax = width;
    const yMax = height;

    // scales
    const xScale = scaleTime({
      range: [0, xMax],
      domain: extent(stock, xStock),
    });

    const yScale = scaleLinear({
      range: [0, yMax],
      domain: extent(stock, yStock),
    });

    return (
      <PlotContainer onClick={this.props.onClick}>
        <CoinTopInfo>
          <CoinIcon src={iconUrl} />
          <CoinName>{name}</CoinName>
        </CoinTopInfo>
        <CoinBottomInfo>
          <p>{price}</p>
          {priceChangeInDay}{'  '}
          <span style={{marginRight: '10px'}} />
          <PercChangeIcon value={priceChangeInDayPerc} /> {priceChangeInDayPerc}%
        </CoinBottomInfo>
        <svg ref={this.svg} width={width} height={height}>
          <rect
            x={0}
            y={0}
            rx={4}
            fill={coinColors[name] || coinColors.defaultColor}
            width={width}
            height={height}
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
        </svg>
      </PlotContainer>
    );
  }
}

export default CoinStockArea;
