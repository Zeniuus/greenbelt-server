import Koa from 'koa';
import Router from '@koa/router';
import { sync } from './profilePageSyncer';

const app = new Koa();
const router = new Router();

router.get('/sync', async (ctx) => {
  const successCount = await sync();
  console.log(`created ${successCount} new profile page(s)`);
  ctx.body = successCount
});
router.get('/healthz', (ctx) => {
  ctx.body = 'alive';
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(8080);
console.log('started to listen to port 8080');
