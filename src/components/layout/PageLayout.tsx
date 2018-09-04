import Head from 'next/head';
import { injectGlobal } from 'styled-components';

import { contentFont, FontHeadLink } from '../Font';

injectGlobal`
  html {
    font-size: 15px;
  }

  html,
  body {
    margin: 0;
  }
  body {
    ${contentFont}
    background-color: snow;
  }
  * {
    z-index: 0;
    box-sizing: border-box;
  }
  a {
    color: currentColor;
  }
`;

type PageProps = {
  title?: string;
};

const PageLayout: React.SFC<PageProps> = ({ title, children }) => (
  <main>
    <Head>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width" user-scalable="no" />

      <title>{['Crypto Exchanges', title].filter(v => v).join(' | ')}</title>
      <meta name="description" content="Javier Carrillo Milla. Freelance Software Engineer" />
      <FontHeadLink />

      <meta name="theme-color" content="#000" />
    </Head>

    {children}
  </main>
);

export default PageLayout;
