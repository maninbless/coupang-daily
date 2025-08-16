// netlify/functions/fetchProducts.js
const fetch = require("node-fetch");
const crypto = require("crypto");

exports.handler = async (event) => {
  try {
    // ✅ URL에서 keyword 파라미터 받기 (기본값: 노트북)
    const { keyword = "노트북", limit = 10 } = event.queryStringParameters;

    // ✅ 쿠팡 오픈 API 기본 정보
    const domain = "https://api-gateway.coupang.com";
    const path = `/v2/providers/affiliate_open_api/apis/openapi/v1/products/search?keyword=${encodeURIComponent(
      keyword
    )}&limit=${limit}`;

    const method = "GET";
    const accessKey = process.env.COUPANG_ACCESS_KEY;
    const secretKey = process.env.COUPANG_SECRET_KEY;

    if (!accessKey || !secretKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "쿠팡 API 키가 설정되지 않았습니다." }),
      };
    }

    // ✅ 날짜 포맷: 20250817T111530Z (밀리초 제거)
    const datetime = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");

    // ✅ 시그니처 생성
    const message = `${datetime}${method}${path}`;
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(message)
      .digest("hex");

    const authorization = `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`;

    // ✅ API 호출
    const response = await fetch(domain + path, {
      method,
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // ✅ 디버깅용 로그 (Netlify Functions 로그에서 확인 가능)
    console.log("쿠팡 API 응답:", data);

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("fetchProducts.js 오류:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
