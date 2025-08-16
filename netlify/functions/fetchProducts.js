// netlify/functions/fetchProducts.js
const crypto = require("crypto");
const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  try {
    const ACCESS_KEY = process.env.COUPANG_ACCESS_KEY;
    const SECRET_KEY = process.env.COUPANG_SECRET_KEY;
    const PARTNER_ID = process.env.COUPANG_PARTNER_ID;

    if (!ACCESS_KEY || !SECRET_KEY || !PARTNER_ID) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "환경 변수가 설정되지 않았습니다." }),
      };
    }

    // 1. 요청 URL 설정
    const domain = "https://api-gateway.coupang.com";
    const resource = `/v2/providers/affiliate_open_api/apis/openapi/products/search`;
    const keyword = "노트북"; // 기본 검색어
    const query = `keyword=${encodeURIComponent(keyword)}&limit=12`;
    const url = `${domain}${resource}?${query}`;

    // 2. HMAC 인증 서명 생성
    const datetime = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const method = "GET";
    const message = `${datetime}${method}${resource}?${query}`;
    const signature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(message)
      .digest("hex");

    // 3. API 요청
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "X-Coupang-API-Key": ACCESS_KEY,
        "X-Coupang-Date": datetime,
        "X-Coupang-Signature": signature,
      },
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
