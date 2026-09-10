export function assetRequest(request) {
  const url = new URL(request.url);
  if (url.pathname === "/bedtime") {
    url.pathname = "/bedtime/";
    return { redirect: url.toString() };
  }
  if (url.pathname.startsWith("/bedtime/")) {
    url.pathname = url.pathname.slice("/bedtime".length) || "/";
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
