import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import worker from './index.js';

const HOST = 'https://kids.corypahl.dev';
const year = Number(new Intl.DateTimeFormat('en-US', {timeZone:'America/Detroit',year:'numeric'}).format(new Date()));
function request(path, method='GET', body, key='family-key') {
  return new Request(HOST+'/api/'+path,{
    method,
    headers:{'X-Family-Key':key,...(body===undefined?{}:{'Content-Type':'application/json'})},
    body:body===undefined?undefined:JSON.stringify(body)
  });
}
function env() {
  const db = new Map();
  return {
    DB:{
      prepare(sql) {
        let args=[];
        return {
          bind(...values){args=values;return this;},
          async all() {
            assert.match(sql,/christmas_passport_stamps/);
            const [child,y]=args;
            const stamps=[...db.keys()].filter(v=>v.startsWith(child+':'+y+':')).map(v=>({stamp:v.split(':').at(-1)}));
            return {results:stamps};
          },
          async run() {
            assert.match(sql,/INSERT OR IGNORE INTO christmas_passport_stamps/);
            const [child,y,stamp]=args;
            db.set(child+':'+y+':'+stamp,true);
            return {meta:{changes:1}};
          }
        };
      }
    },
    CHRISTMAS_FAMILY_KEY:'family-key',
    CHRISTMAS_PARENT_KEY:'parent-key',
    ASSETS:{fetch:async()=>new Response('asset')},
    stamps:db,
  };
}
describe('seasonal Christmas passport',()=>{
  it('requires family authorization and validates profile',async()=>{
    const e=env();
    assert.equal((await worker.fetch(request('passport?child=emma','GET',undefined,''),e)).status,401);
    assert.equal((await worker.fetch(request('passport','POST',{child:'emma',stamp:'cursive'},''),e)).status,401);
    assert.equal((await worker.fetch(request('passport?child=unknown'),e)).status,400);
    assert.equal((await worker.fetch(request('passport','POST',{child:'other',stamp:'cursive'}),e)).status,400);
  });
  it('keeps stamps private per child and unique per season',async()=>{
    const e=env();
    const before=await (await worker.fetch(request('passport?child=emma'),e)).json();
    assert.deepEqual(before,{year,stamps:[]});
    for(const stamp of ['cursive','cursive','present-bounce']) {
      const resp=await worker.fetch(request('passport','POST',{child:'emma',stamp}),e);
      assert.equal(resp.status,200);
    }
    const one=await (await worker.fetch(request('passport?child=emma'),e)).json();
    assert.deepEqual(new Set(one.stamps),new Set(['cursive','present-bounce']));
    assert.equal(e.stamps.size,2);
    const other=await (await worker.fetch(request('passport?child=sophie'),e)).json();
    assert.deepEqual(other.stamps,[]);
  });
  it('rejects forged achievements and cross-site writes',async()=>{
    const e=env();
    for(const body of [null,{}, {child:'emma',stamp:'made-up'},{child:'emma',stamp:7},{child:'emma',stamp:''}])
      assert.equal((await worker.fetch(request('passport','POST',body),e)).status,400);
    const req=request('passport','POST',{child:'emma',stamp:'cursive'});
    req.headers.set('Origin','https://attacker.invalid');
    assert.equal((await worker.fetch(req,e)).status,403);
    assert.equal(e.stamps.size,0);
  });
});
