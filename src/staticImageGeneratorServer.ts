import Koa from 'koa';
import Router from '@koa/router';
import multer from '@koa/multer';

const app = new Koa();
const router = new Router();
const storage = multer.memoryStorage()
const upload = multer({ storage });

// TODO: 저장한지 1분 정도 뒤에 인메모리 캐시에서 날리기
const images: { [key: string]: multer.File } = {};

router.post('/images/:imageName', upload.single('image'), (ctx) => {
  const { imageName } = ctx.params;
  images[imageName] = ctx.request.file;
  ctx.body = 'success';
});
router.get('/images/:imageName', (ctx) => {
  const { imageName } = ctx.params;
  const { mimetype, buffer } = images[imageName];
  ctx.set({ 'Content-Type': mimetype });
  ctx.body = buffer;
});
router.get('/healthz', (ctx) => {
  ctx.body = 'alive';
})

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(8080);
