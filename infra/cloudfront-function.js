// CloudFront Function (viewer request, 런타임 cloudfront-js-2.0)
// S3에는 /rooms.html, /rooms/bada.html 처럼 페이지마다 .html 파일이 있다 (next.config.ts trailingSlash: false).
// 주소는 끝에 / 와 .html 이 없는 형태 하나로 쓴다. scripts/serve-out.mjs 가 로컬에서 같은 규칙을 흉내 낸다. 둘을 함께 고친다.
//
//   /                                → /index.html
//   /rooms                           → /rooms.html  (확장자 없는 경로)
//   /rooms/                          → 301 /rooms   (끝의 / 제거)
//   sunsetcoast.kr/...               → 301 www.sunsetcoast.kr/...  (정규 주소는 www, src/lib/seed siteUrl)
//
// Next 16 세그먼트 프리페치(__next.rooms.__PAGE__.txt)는 Linux 빌드에서 요청 경로와 같은 이름으로 나와서
// 바꿀 필요가 없다. Windows 빌드만 __next.rooms/__PAGE__.txt 로 나누어 만든다 → 배포는 CI(Linux) 빌드만 쓴다.
var CANONICAL_HOST = 'www.sunsetcoast.kr';

function handler(event) {
  var req = event.request;
  var uri = req.uri;
  var host = req.headers.host && req.headers.host.value;

  if (host && host !== CANONICAL_HOST && host.indexOf('.cloudfront.net') === -1) {
    // 끝의 / 도 같이 떼서 한 번에 정규 주소로 보낸다
    return redirect('https://' + CANONICAL_HOST + (uri === '/' ? '/' : uri.replace(/\/+$/, '')) + query(req.querystring));
  }

  if (uri === '/') {
    req.uri = '/index.html';
    return req;
  }
  if (uri.charAt(uri.length - 1) === '/') {
    return redirect(uri.replace(/\/+$/, '') + query(req.querystring));
  }

  var name = uri.slice(uri.lastIndexOf('/') + 1);
  if (name.indexOf('.') === -1) {
    req.uri = uri + '.html';
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
