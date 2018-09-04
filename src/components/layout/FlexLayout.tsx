import styled from 'styled-components';

type FlexLayoutProps = {
  direction?: React.CSSProperties['flexDirection'];
  alignItems?: React.CSSProperties['alignItems'];
  justifyContent?: React.CSSProperties['justifyContent'];
}

const FlexLayout = styled<FlexLayoutProps, 'div'>('div')`
  display: flex;
  flex-direction: ${({ direction = 'row' }) => direction};

  align-items: ${({ alignItems = 'center' }) => alignItems};
  justify-content: ${({ justifyContent = 'center' }) => justifyContent};
`;

export default FlexLayout;
