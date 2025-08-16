// netlify/functions/fetchProducts.js
import fetch from "node-fetch";

export const handler = async (event, context) => {
  try {
    const { query, sort, category } = event.queryStringParameters;

    // 쿠팡 API 기본 정보
    const COUPANG_API_KEY = process.env.CP_API_KEY;  // Netlify 환경변수에 저장한 값
    const COUPANG_API_SECRET = process.env.CP_API_SECRET; // 필요하다면 추가
    const BASE_URL = "https://api-gateway.coupang.com/v2/providers/affiliate_open_api/apis/openapi/products/search";

    // 검색어 없으면 기본값
    const keyword = query || "노트북";

    // API URL
    const url = `${BASE_URL}?keyword=${encodeURIComponent(keyword)}&limit=5&sorter=${sort || "salesVolumeDesc"}`;

    // API 요청
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${COUPANG_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`쿠팡 API 요청 실패: ${response.status}`);
    }

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

