// netlify/functions/fetchProducts.js
export async function handler(event, context) {
  try {
    const accessKey = process.env.COUPANG_ACCESS_KEY;
    const secretKey = process.env.COUPANG_SECRET_KEY;
    const partnerId = process.env.COUPANG_PARTNER_ID;

    // 테스트용 API 엔드포인트 (베스트 상품 가져오기 예시)
    const endpoint = `https://api-gateway.coupang.com/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink`;

    // 요청 body (예: 특정 상품 링크 생성)
    const body = {
      coupangUrls: ["https://www.coupang.com/np/search?q=노트북"],
      subId: "test-sub-id"
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-COUPANG-API-ACCESS-KEY": accessKey,
        "X-COUPANG-API-SECRET-KEY": secretKey,
        "X-COUPANG-PARTNER-ID": partnerId,
      },
      body: JSON.stringify(body),
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
}
