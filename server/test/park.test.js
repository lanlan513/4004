// 园区 GIS 地图与实时追踪 API 测试
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import parkRouter from '../routes/park.js';

let server;
let baseUrl;

before(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/park', parkRouter);
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(() => server?.close());

async function getJson(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  return { status: response.status, body: await response.json() };
}

test('总览返回全部安全网格及电网状态', async () => {
  const { status, body } = await getJson('/api/park/overview');
  assert.equal(status, 200);
  assert.equal(body.code, 0);
  assert.ok(body.data.length >= 5);
  const zone = body.data.find((z) => z.id === 'trex');
  assert.ok(zone, '应包含霸王龙区');
  assert.ok(['on', 'off', 'fault'].includes(zone.fence.status));
  assert.ok(Array.isArray(zone.polygon) && zone.polygon.length >= 3);
  assert.equal(typeof zone.dinoCount, 'number');
});

test('实时追踪返回恐龙定位坐标', async () => {
  const { status, body } = await getJson('/api/park/tracking');
  assert.equal(status, 200);
  assert.ok(body.data.length > 0);
  for (const dino of body.data) {
    assert.equal(typeof dino.x, 'number');
    assert.equal(typeof dino.y, 'number');
    assert.ok(dino.zoneId);
    assert.ok(dino.heartRate > 0);
  }
});

test('网格详情包含监控数据', async () => {
  const { status, body } = await getJson('/api/park/zones/raptor');
  assert.equal(status, 200);
  assert.equal(body.data.id, 'raptor');
  assert.ok(Array.isArray(body.data.cameras));
  assert.ok(body.data.environment.temperature > 0);
  assert.ok(Array.isArray(body.data.dinosaurs));
});

test('未知网格返回 404', async () => {
  const { status, body } = await getJson('/api/park/zones/nowhere');
  assert.equal(status, 404);
  assert.equal(body.code, 404);
});

test('电网断电与恢复通电', async () => {
  const off = await getJson('/api/park/zones/fern/fence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'off' }),
  });
  assert.equal(off.status, 200);
  assert.equal(off.body.data.status, 'off');
  assert.equal(off.body.data.voltage, 0);

  const overview = await getJson('/api/park/overview');
  const fern = overview.body.data.find((z) => z.id === 'fern');
  assert.equal(fern.fence.status, 'off');

  const on = await getJson('/api/park/zones/fern/fence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'on' }),
  });
  assert.equal(on.status, 200);
  assert.equal(on.body.data.status, 'on');
  assert.ok(on.body.data.voltage > 9);
});

test('非故障网格不可修复，非法操作返回 400', async () => {
  const repair = await getJson('/api/park/zones/lake/fence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'repair' }),
  });
  assert.equal(repair.status, 400);

  const bad = await getJson('/api/park/zones/lake/fence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'explode' }),
  });
  assert.equal(bad.status, 400);
});

test('事件日志记录电网操作', async () => {
  await getJson('/api/park/zones/visitor/fence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'off' }),
  });
  await getJson('/api/park/zones/visitor/fence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'on' }),
  });
  const { body } = await getJson('/api/park/events');
  assert.ok(body.data.length > 0);
  assert.ok(body.data.some((e) => e.type === 'fence' && e.zoneId === 'visitor'));
});
