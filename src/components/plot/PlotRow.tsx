import styled from 'styled-components';

const PlotRow = styled.div`

  display: flex;
  padding: 25px 0;
  overflow-x: auto;
  background-color: #d8eefc;

  & > * {
    margin: 0 1rem;
    display: inline-block;
  }
`;

export default PlotRow;
