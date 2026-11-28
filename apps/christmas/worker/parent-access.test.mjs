import assert from 'node:assert/strict';
import { describe, it, before } from 'node:test';
import { verifiedParentEmail, parentAccessConfigured } from './parent-access.js';

const domain = 'christmas-tests.cloudflareaccess.com';
const env = {
  CHRISTMAS_PARENT_ACCESS_TEAM_DOMAIN: domain,
  CHRISTMAS_PARENT_ACCESS_AUD: 'parent-application-audience',
  CHRISTMAS_PARENT_ALLOWED_EMAILS: 'parent-one@example.com,parent-two@example.com',
};
let privateKey, jwk;
function b64(input) {
  return Buffer.from(input).toString('base64url');
}
async function issue(claims = {}, headers = {}) {
  const now = Math.floor(Date.now()/1000);
  const header = b64(JSON.stringify({ typ:'JWT', alg:'RS256', kid:'test-rsa-kid', ...headers }));
  const body = b64(JSON.stringify({
    iss:'https://' + domain, aud:[env.CHRISTMAS_PARENT_ACCESS_AUD], type:'app',
    email:'parent-one@example.com', iat:now, nbf:now-2, exp:now+3600,
    ...claims,
  }));
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, new TextEncoder().encode(header+'.'+body));
  return header+'.'+body+'.'+b64(signature);
}
function make(token) {
  return new Request('https://kids.corypahl.dev/api/parent/wishes', {
    headers:{ ...(token ? {'Cf-Access-Jwt-Assertion':token} : {}) },
  });
}
const fetchCerts=async url=>{
  assert.equal(url, 'https://'+domain+'/cdn-cgi/access/certs');
  return Response.json({keys:[jwk]});
};
before(async()=>{
  const pair=await crypto.subtle.generateKey(
    {name:'RSASSA-PKCS1-v1_5', modulusLength:2048, publicExponent:new Uint8Array([1,0,1]), hash:'SHA-256'},
    true,['sign','verify']);
  privateKey=pair.privateKey;
  jwk={...await crypto.subtle.exportKey('jwk', pair.publicKey),kid:'test-rsa-kid',use:'sig'};
});

describe('Cloudflare Access signed Google parent authentication',()=>{
  it('denies missing Access assertion, even if an email header is supplied',async()=>{
    assert.equal(await verifiedParentEmail(make(null),env,fetchCerts),null);
    const fake = new Request('https://kids.corypahl.dev/api/parent/wishes',{headers:{
      'Cf-Access-Authenticated-User-Email':'parent-one@example.com',
      'X-Parent-Key':'old-secret',
    }});
    assert.equal(await verifiedParentEmail(fake,env,fetchCerts),null);
  });
  it('accepts properly signed application token for an allowlisted Google email',async()=>{
    assert.equal(await verifiedParentEmail(make(await issue()),env,fetchCerts),'parent-one@example.com');
    assert.equal(await verifiedParentEmail(make(await issue({email:'PARENT-TWO@EXAMPLE.COM'})),env,fetchCerts),'parent-two@example.com');
  });
  it('rejects invalid signature, wrong issuer/audience and expired tokens',async()=>{
    const cases=[
      {aud:['other-app']},{iss:'https://another.cloudflareaccess.com'},
      {exp:Math.floor(Date.now()/1000)-5},{nbf:Math.floor(Date.now()/1000)+600},
      {iat:Math.floor(Date.now()/1000)+600},{type:'org'},
      {email:'unknown@example.com'},{email:''},
    ];
    for(const claims of cases)assert.equal(await verifiedParentEmail(make(await issue(claims)),env,fetchCerts),null);
    const token=await issue();
    const tampered=token.slice(0,-2)+(token.at(-1)==='a'?'b':'a')+token.at(-1);
    assert.equal(await verifiedParentEmail(make(tampered),env,fetchCerts),null);
    assert.equal(await verifiedParentEmail(make(await issue({}, {alg:'none'})),env,fetchCerts),null);
  });
  it('fails closed on missing team, audience, or exact parent allowlist',async()=>{
    const token=await issue();
    assert.equal(parentAccessConfigured({}),false);
    assert.equal(await verifiedParentEmail(make(token),{},fetchCerts),null);
    for(const key of ['CHRISTMAS_PARENT_ACCESS_AUD','CHRISTMAS_PARENT_ACCESS_TEAM_DOMAIN','CHRISTMAS_PARENT_ALLOWED_EMAILS']) {
      assert.equal(await verifiedParentEmail(make(token),{...env,[key]:''},fetchCerts),null);
    }
    assert.equal(parentAccessConfigured(env),true);
  });
});
