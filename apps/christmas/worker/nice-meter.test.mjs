import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import worker from './index.js';

const HOST = 'https://kids.corypahl.dev';
const year = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Detroit', year: 'numeric' }).format(new Date()));
const make = (path, method='GET', body, familyKey='family-key') =>
  new Request(HOST + '/api/' + path, {
    method,
    headers: {
      'X-Family-Key': familyKey,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

function memoryDb() {
  const values = new Map();
  return {
    prepare(sql) {
      let bindings=[];
      return {
        bind(...args) { bindings=args; return this; },
        async first() {
          assert.match(sql, /naughty_nice_answers/);
          const [child,y]=bindings;
          const row=values.get(child+':'+y);
          return row === undefined ? null : { value:row, updated_at:'2026-11-27 00:00:00' };
        },
        async run() {
          assert.match(sql,/INSERT INTO naughty_nice_answers/);
          const [child,y,v]=bindings;
          values.set(child+':'+y,v);
          return {meta:{changes:1}};
        },
      };
    },
    values
  };
}
function testEnv() { return {DB:memoryDb(),CHRISTMAS_FAMILY_KEY:'family-key',CHRISTMAS_PARENT_KEY:'parent-key',ASSETS:{fetch: async()=>new Response('ok')}}; }

describe('Naughty vs Nice D1 persistence', () => {
  it('requires the family key to read or write', async () => {
    const env=testEnv();
    assert.equal((await worker.fetch(make('nice-meter?child=emma','GET',undefined,''),env)).status,401);
    assert.equal((await worker.fetch(make('nice-meter','POST',{child:'emma',year,value:60},''),env)).status,401);
    assert.equal((await worker.fetch(make('nice-meter?child=emma','GET',undefined,'parent-key'),env)).status,401);
  });
  it('starts empty, stores a choice, reads it back and updates the same year', async () => {
    const env=testEnv();
    const get = async child=> (await worker.fetch(make('nice-meter?child='+child),env)).json();
    assert.deepEqual({...(await get('emma')),updatedAt:undefined},{year,value:null,updatedAt:undefined});
    let reply=await worker.fetch(make('nice-meter','POST',{child:'emma',year,value:25}),env);
    assert.equal(reply.status,200);
    assert.deepEqual(await reply.json(),{year,value:25});
    assert.equal((await get('emma')).value,25);
    assert.equal((await get('sophie')).value,null);
    reply=await worker.fetch(make('nice-meter','POST',{child:'emma',year,value:88}),env);
    assert.equal(reply.status,200);
    assert.equal((await get('emma')).value,88);
    assert.equal(env.DB.values.size,1);
  });
  it('rejects unknown children, other years, decimals and out-of-range values', async () => {
    const env=testEnv();
    for (const body of [
      {child:'other',year,value:50},{child:'emma',year:year+1,value:50},
      {child:'emma',year:year-1,value:50},{child:'emma',year,value:-1},
      {child:'emma',year,value:101},{child:'emma',year,value:23.8},
      {child:'emma',year,value:'80'},{child:'emma',year},
      null
    ]) {
      assert.equal((await worker.fetch(make('nice-meter','POST',body),env)).status,400);
    }
    assert.equal((await worker.fetch(make('nice-meter?child=unknown'),env)).status,400);
    assert.equal(env.DB.values.size,0);
  });
  it('disallows cross-origin writes', async () => {
    const env=testEnv();
    const req = make('nice-meter','POST',{child:'emma',year,value:90});
    req.headers.set('Origin','https://another-site.example');
    assert.equal((await worker.fetch(req,env)).status,403);
  });
});
