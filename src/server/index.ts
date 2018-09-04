import { join } from 'path';
import { parse } from 'url';

import * as next from 'next';
import { createServer } from 'http';

import { IS_DEVELOPMENT, NODE_PORT } from '../config/env';

const app = next({
  dev: IS_DEVELOPMENT,
  dir: join(process.cwd(), 'src'),
});

app
  .prepare()
  .then(() => {
    const handle = app.getRequestHandler();

    const server = createServer(function (req, res) {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });


    server.listen(NODE_PORT, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${NODE_PORT}`);
    });
  })
;
