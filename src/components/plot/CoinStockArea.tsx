import styled from 'styled-components';
import { Component, RefObject, createRef } from 'react';

import { coinColors } from './constants';

import { timeFormat } from 'd3-time-format';
import { extent, bisector } from 'd3-array';
import { timeMinute, timeDay, timeHour } from 'd3-time';

import { AreaClosed, Line, Bar } from '@vx/shape';
import { AxisBottom } from '@vx/axis';
import { localPoint } from '@vx/event';
import { curveMonotoneX } from '@vx/curve';
import { GridRows, GridColumns } from '@vx/grid';
import { scaleTime, scaleLinear } from '@vx/scale';
import { withTooltip, Tooltip } from '@vx/tooltip';

import FlexLayout from '../layout/FlexLayout';
import { CoinItem, CoinHistory } from '../../services/CryptoService';

type StockAreaItem = {
  time: number;
  close: number;
};

// accessors
const xStock = (d: StockAreaItem) => new Date(d.time * 1000);
const yStock = (d: StockAreaItem) => {
  const [whole, decimals] = d.close.toString().split('.')
  return parseFloat(`${whole}.${(decimals || '00').slice(0, 2)}`);
};
const formatDate = timeFormat('%H:%M');
const bisectDate = bisector((d: StockAreaItem) => new Date(d.time * 1000)).left;

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
  // tooltip
  showTooltip?: (...args: any[]) => void;
  hideTooltip?: (...args: any[]) => void;
  tooltipTop?: number;
  tooltipLeft?: number;
  tooltipData?: any;
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

  handleTooltip = ({ event, data, xStock, xScale, yScale }) => {
    const { x } = localPoint(event);
    const { showTooltip } = this.props;

    const x0 = xScale.invert(x);
    const index = bisectDate(data, x0, 1);

    const d0 = data[index - 1];
    const d1 = data[index];
    let d = d0;

    if (d1 && d1.time) {
      d = x0 - xStock(d0.time) > xStock(d1.time) - x0 ? d1 : d0;
    } else {
      d = d0;
    }

    showTooltip({
      tooltipTop: yScale(d.close),
      tooltipData: d,
      tooltipLeft: x,
    });
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
      // tooltip
      tooltipTop,
      tooltipLeft,
      tooltipData,
      hideTooltip,
    } = this.props;


    const stock = this.getPlotDomains(histoMinute);
    const { aggregateBy } = this.state;

    // scales
    const xMax = width;
    const xScale = scaleTime({
      nice: true,
      range: [0, xMax],
      domain: extent(stock, xStock),
    });

    const xNumTicks = (
      aggregateBy === 'hour' && 12 ||
      14
    );

    const yMax = height;
    const yScale = scaleLinear({
      nice: true,
      range: [yMax, 0],
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
            <GridRows
              lineStyle={{ pointerEvents: 'none' }}
              scale={yScale}
              width={width}
              strokeDasharray="2,2"
              stroke="rgba(255,255,255,0.3)"
            />
            <GridColumns
              lineStyle={{ pointerEvents: 'none' }}
              scale={xScale}
              height={height}
              stroke="rgba(255,255,255,0.3)"
              strokeDasharray="2,2"
            />
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
              numTicks={xNumTicks}
              hideTicks={true}
              tickFormat={(value: Date) => formatDate(value)}
              hideAxisLine={true}
            />}
            <Bar
              x={0}
              y={0}
              width={width}
              height={height}
              fill="transparent"
              rx={14}
              data={stock}
              onTouchStart={data => event =>
                this.handleTooltip({
                  event,
                  data,
                  xStock,
                  xScale,
                  yScale,
                })}
              onTouchMove={data => event =>
                this.handleTooltip({
                  event,
                  data,
                  xStock,
                  xScale,
                  yScale,
                })}
              onMouseMove={data => event =>
                this.handleTooltip({
                  event,
                  data,
                  xStock,
                  xScale,
                  yScale,
                })}
              onMouseLeave={() => () => hideTooltip()}
            />
            {tooltipData && (
              <g>
                <Line
                  from={{ x: tooltipLeft, y: 0 }}
                  to={{ x: tooltipLeft, y: yMax }}
                  stroke="rgba(0,0,0,0.6)"
                  strokeWidth={2}
                  style={{ pointerEvents: 'none' }}
                  strokeDasharray="2,2"
                />
                <circle
                  cx={tooltipLeft}
                  cy={tooltipTop + 1}
                  r={4}
                  fill="black"
                  fillOpacity={0.1}
                  stroke="black"
                  strokeOpacity={0.1}
                  strokeWidth={2}
                  style={{ pointerEvents: 'none' }}
                />
                <circle
                  cx={tooltipLeft}
                  cy={tooltipTop}
                  r={4}
                  fill="rgba(0,0,0,0.6)"
                  stroke="white"
                  strokeWidth={2}
                  style={{ pointerEvents: 'none' }}
                />
              </g>
            )}
          </svg>
          {tooltipData && (
            <>
              <Tooltip
                top={tooltipTop - 12}
                left={tooltipLeft + 12}
                style={{
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                }}
              >
                {`$${yStock(tooltipData)}`}
              </Tooltip>
              <Tooltip
                top={yMax - 14}
                left={tooltipLeft}
                style={{
                  transform: 'translateX(-50%)',
                }}
              >
                {formatDate(xStock(tooltipData))}
              </Tooltip>
            </>
          )}
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

export default withTooltip(CoinStockArea);
