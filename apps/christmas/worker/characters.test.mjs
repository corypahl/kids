import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import worker from './index.js';

const url = 'https://kids.corypahl.dev';
const elf = {
  skin:'#F6CEAA', hair:'#5A3528', hairStyle:'fringe', eyes:'#513829',
  face:'smile', outfit:'tunic', outfitColor:'#C54C5C', hat:'pointy',
  accessory:'wand', boots:'#664B42', scene:'snow'
};
const snowman = {
  shape:'classic', face:'smile', eyes:'coal', nose:'carrot', arms:'sticks',
  hat:'top', scarf:'red', buttons:'coal', scene:'snow'
};

function memoryDb() {
  const rows = new Map();
  return {
    rows,
    prepare(sql) {
      let args=[];
      return {
        bind(...values) { args=values; return this; },
        async all() {
          assert.match(sql,/FROM character_creations/);
          const [child,kind]=args;
          return {results:[...rows.values()].filter(row=>row.child===child&&row.kind===kind).slice(0,24)};
        },
        async first() {
          assert.match(sql,/COUNT\(\*\)/);
          const [child,kind]=args;
          return {total:[...rows.values()].filter(row=>row.child===child&&row.kind===kind).length};
        },
        async run() {
          if(sql.startsWith('INSERT INTO character_creations')) {
            const [id,child,kind,name,look_json]=args;
            rows.set(id,{id,child,kind,name,look_json,updated_at:'2026-11-26'});
            return {meta:{changes:1}};
          }
          if(sql.startsWith('UPDATE character_creations')) {
            const [name,look_json,id,child,kind]=args, row=rows.get(id);
            if(!row||row.child!==child||row.kind!==kind)return {meta:{changes:0}};
            rows.set(id,{...row,name,look_json});
            return {meta:{changes:1}};
          }
          if(sql.startsWith('DELETE FROM character_creations')) {
            const [id,child,kind]=args, row=rows.get(id);
            if(!row||row.child!==child||row.kind!==kind)return {meta:{changes:0}};
            rows.delete(id);return {meta:{changes:1}};
          }
          throw new Error('Unhandled SQL: '+sql);
        }
      };
    }
  };
}

function mockRequest(path, {method='GET', body, family, parent}={}) {
  const headers={};
  if(family)headers['X-Family-Key']=family;
  if(parent)headers['X-Parent-Key']=parent;
  if(body!==undefined)headers['Content-Type']='application/json';
  return new Request(url+path,{
    method, headers, body:body===undefined?undefined:JSON.stringify(body)
  });
}
function env() {
  return {DB:memoryDb(),CHRISTMAS_FAMILY_KEY:'secret-family',CHRISTMAS_PARENT_KEY:'different-parent-key',
    ASSETS:{fetch:async()=>new Response('static')}};
}

describe('Christmas character creations',()=>{
  it('requires the child/family credential, not a parent credential',async()=>{
    const e=env();
    assert.equal((await worker.fetch(mockRequest('/api/characters?child=emma&kind=elf'),e)).status,401);
    assert.equal((await worker.fetch(mockRequest('/api/characters?child=emma&kind=elf',{parent:'different-parent-key'}),e)).status,401);
    assert.equal((await worker.fetch(mockRequest('/api/characters?child=emma&kind=elf',{family:'secret-family'}),e)).status,200);
  });
  it('creates, lists, updates, and deletes a design by child and kind',async()=>{
    const e=env(), auth={family:'secret-family'};
    const creation={child:'emma',kind:'elf',name:'Sparkle',look:elf};
    const res=await worker.fetch(mockRequest('/api/characters',{...auth,method:'POST',body:creation}),e);
    assert.equal(res.status,201);
    const {id}=await res.json();
    assert.match(id,/^[a-f0-9-]{36}$/);
    const list=await worker.fetch(mockRequest('/api/characters?child=emma&kind=elf',auth),e);
    const entries=(await list.json()).creations;
    assert.equal(entries.length,1);
    assert.deepEqual(entries[0].look,elf);
    assert.equal(entries[0].name,'Sparkle');
    const newLook={...elf,hair:'#B185D8',hat:'crown'};
    const save=await worker.fetch(mockRequest('/api/characters/'+id,{...auth,method:'PATCH',body:{...creation,name:'Jingle',look:newLook}}),e);
    assert.equal(save.status,200);
    assert.equal((await e.DB.prepare('SELECT id, child, kind, name, look_json, updated_at FROM character_creations').bind('emma','elf').all()).results[0].name,'Jingle');
    const deleteOther=await worker.fetch(mockRequest('/api/characters/'+id+'?child=sophie&kind=elf',{...auth,method:'DELETE'}),e);
    assert.equal(deleteOther.status,404);
    const deleteCorrect=await worker.fetch(mockRequest('/api/characters/'+id+'?child=emma&kind=elf',{...auth,method:'DELETE'}),e);
    assert.equal(deleteCorrect.status,200);
    assert.equal(e.DB.rows.size,0);
  });
  it('allows snowman designs but rejects unrecognized options and extra keys',async()=>{
    const e=env(),auth={family:'secret-family',method:'POST'};
    const valid={child:'adam',kind:'snowman',name:'Frosty',look:snowman};
    assert.equal((await worker.fetch(mockRequest('/api/characters',{...auth,body:valid}),e)).status,201);
    for (const body of [
      {...valid,look:{...snowman,hat:'javascript:alert(1)'}},
      {...valid,look:{...snowman,extra:'not-allowed'}},
      {...valid,look:{...snowman,scarf:'#ff0000'}},
      {...valid,look:{...snowman,hat:null}},
      {...valid,name:'X'.repeat(26)},
      {...valid,child:'stranger'},
      {...valid,kind:'reindeer'}
    ]) {
      assert.equal((await worker.fetch(mockRequest('/api/characters',{...auth,body}),e)).status,400);
    }
    assert.equal(e.DB.rows.size,1);
  });
  it('limits each childs saved gallery to 24 creations per type',async()=>{
    const e=env(),auth={family:'secret-family',method:'POST'};
    for(let i=0;i<24;i++){
      const res=await worker.fetch(mockRequest('/api/characters',{...auth,body:{child:'sophie',kind:'elf',name:'Elf '+i,look:elf}}),e);
      assert.equal(res.status,201);
    }
    const blocked=await worker.fetch(mockRequest('/api/characters',{...auth,body:{child:'sophie',kind:'elf',name:'One more',look:elf}}),e);
    assert.equal(blocked.status,409);
    assert.equal((await worker.fetch(mockRequest('/api/characters',{...auth,body:{child:'sophie',kind:'snowman',name:'Snowy',look:snowman}}),e)).status,201);
    assert.equal(e.DB.rows.size,25);
  });
});
