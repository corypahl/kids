export function assetRequest(request) {
  const url = new URL(request.url);
  if (url.pathname === '/christmas') {
    url.pathname = '/christmas/';
    return { redirect: url.toString() };
  }
  if (url.pathname.startsWith('/christmas/')) {
    url.pathname = url.pathname.slice('/christmas'.length) || '/';
  }
  return { request: new Request(url, request) };
}

export default {
  async fetch(request, env) {
    const routed = assetRequest(request);
    if (routed.redirect) return Response.redirect(routed.redirect, 308);
    return env.ASSETS.fetch(routed.request);
  },
};
