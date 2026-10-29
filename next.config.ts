import type { NextConfig } from 'next';

// 고객 사이트는 정적 파일만 만든다 (S3 + CloudFront). 서버 기능(API Route, SSR, ISR, middleware)은 쓰지 않는다.
const nextConfig: NextConfig = {
  output: 'export',
  // /rooms/nolmeong → /rooms/nolmeong/index.html 로 생성. CloudFront Function이 디렉터리 경로를 index.html로 연결한다.
  trailingSlash: true,
  // next/image 최적화는 정적 export에서 동작하지 않는다. 이미지는 scripts/build-images.mjs가 미리 만든다.
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
