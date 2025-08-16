import crypto from "crypto";

export async function handler(event, context) {
  const ACCESS_KEY = process.env.COUPANG_ACCESS_KEY;
  const SECRET_KEY = process.env.COUPANG_SECRET_KEY;
  const PARTNER_ID = process.env.COUPANG_PARTNER_ID;

  // ✅ Coupang API 엔드포인트 (베스트셀러 예시: 노트북 카테고리)
  const domain = "https://api-gateway.coupang.com";
  const path = `/v2/providers/affiliate_open_api/apis/openapi/v1/bestsellers?categoryId=178255&subId=test`;
  const url = domain + path;

  // ✅ 날짜 + 서명 생성
  const datetime = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const method = "GET";
  const message = `${datetime}\n${method}\n${path}\n`;
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(message)
    .digest("hex");

  try {
    // ✅ Coupang API 호출
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `CEA algorithm=HmacSHA256, access-key=${ACCESS_KEY}, signed-date=${datetime}, signature=${signature}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // ✅ 링크 변환 (파트너스 링크 적용)
    const products = data.data.slice(0, 5).map(item => ({
      title: item.productName,
      link: `https://link.coupang.com/a/${PARTNER_ID}?lptag=${item.productId}`,
      image: item.productImage,
      price: item.productPrice,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(products),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
