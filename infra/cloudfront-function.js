// CloudFront Function (viewer request, 런타임 cloudfront-js-2.0)
// S3에는 /rooms/index.html 처럼 디렉터리마다 index.html 이 있다 (next.config.ts trailingSlash).
// scripts/serve-out.mjs 가 로컬에서 같은 규칙을 흉내 낸다. 둘을 함께 고친다.
//
//   /rooms/                          → /rooms/index.html
//   /rooms                           → 301 /rooms/  (확장자 없는 경로)
//   www.sunsetcoast.kr/...           → 301 sunsetcoast.kr/...
//
// Next 16 세그먼트 프리페치(__next.rooms.__PAGE__.txt)는 Linux 빌드에서 요청 경로와 같은 이름으로 나와서
// 바꿀 필요가 없다. Windows 빌드만 __next.rooms/__PAGE__.txt 로 나누어 만든다 → 배포는 CI(Linux) 빌드만 쓴다.
var CANONICAL_HOST = 'sunsetcoast.kr';

function handler(event) {
  var req = event.request;
  var uri = req.uri;
  var host = req.headers.host && req.headers.host.value;

  if (host && host !== CANONICAL_HOST && host.indexOf('www.') === 0) {
    return redirect('https://' + CANONICAL_HOST + uri + query(req.querystring));
  }

  if (uri.charAt(uri.length - 1) === '/') {
    req.uri = uri + 'index.html';
    return req;
  }

  var name = uri.slice(uri.lastIndexOf('/') + 1);
  if (name.indexOf('.') === -1) {
    return redirect(uri + '/' + query(req.querystring));
  }
  return req;
}

function redirect(location) {
  return { statusCode: 301, statusDescription: 'Moved Permanently', headers: { location: { value: location } } };
}

// querystring 객체 → "?a=1&b=2" (같은 키 여러 개: multiValue)
function query(qs) {
  var out = [];
  for (var k in qs) {
    var v = qs[k];
    var list = v.multiValue ? v.multiValue : [v];
    for (var i = 0; i < list.length; i++) out.push(list[i].value === '' ? k : k + '=' + list[i].value);
  }
  return out.length ? '?' + out.join('&') : '';
}
