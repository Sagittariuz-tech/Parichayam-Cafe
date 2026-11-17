import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { setTimeout as wait } from 'node:timers/promises';

async function check(mode) {
  const port = mode === 'demo' ? 3107 : 3108;
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    env: { ...process.env, VERCEL: '1', CAFE_ORDER_MODE: mode, CAFE_DB_PATH: 'package.json/impossible.sqlite' },
    stdio: 'ignore', windowsHide: true,
  });
  try {
    const url = `http://127.0.0.1:${port}`;
    let ready = false;
    for (let i = 0; i < 60; i++) {
      try { ready = (await fetch(url)).ok; } catch {}
      if (ready) break;
      await wait(250);
    }
    assert(ready, 'Production server started');
    const payload = { reference: randomUUID(), dishId: 2, table: 11, quantity: 1, note: 'Sauce on the side' };
    async function post(data) {
      const response = await fetch(url + '/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
      return { status: response.status, body: await response.json() };
    }
    const result = await post(payload);
    if (mode === 'demo') {
      assert.equal(result.status, 201);
      assert.equal(result.body.status, 'demo');
      assert.equal(result.body.table_number, 11);
      assert.equal(result.body.dish, 'Chicken Sandwich');
      assert.deepEqual(await post(payload), result);
      for (const invalid of [{ table: 0 }, { table: 16 }, { quantity: 0 }, { quantity: 21 }, { dishId: -1 }, { reference: 'invalid' }, { note: 'x'.repeat(1000) }]) {
        assert.equal((await post({ ...payload, ...invalid })).status, 400);
      }
      console.log('PASS: Vercel demo with unusable storage, repeated reference, and seven invalid-input cases.');
    } else {
      assert.equal(result.status, 500);
      assert.equal(result.body.status, undefined);
      console.log('PASS: Live storage failure never returns a demo success.');
    }
  } finally { server.kill(); }
}
await check('demo');
await check('live');
