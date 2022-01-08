import Koa from 'koa';
import Router from '@koa/router';
import { sync } from './profilePageSyncer';
import temporaryImageHolder from './temporaryImageHolder';

const app = new Koa();
const router = new Router();

router.get('/images/:imageName', (ctx) => {
  const { imageName } = ctx.params;
  const { mimeType, buffer } = temporaryImageHolder.get(imageName);
  ctx.set({ 'Content-Type': mimeType });
  ctx.body = buffer;
});
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
