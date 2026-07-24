export default {
  async fetch(request, env) {
    // CORSエラー（外部ブラウザからのアクセスブロック）を回避
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method === "POST") {
      try {
        const data = await request.json();

        // Cloudflareの環境変数からトークンとIDを取得
        const CHANNEL_ACCESS_TOKEN = env.CHANNEL_ACCESS_TOKEN;
        const USER_ID = env.USER_ID;

        // フォームから送られてきたデータをすべて「◆項目名：内容」の形式で組み立て
        let messageText = `【WEBフォームからの送信】\n\n`;
        for (const [key, value] of Object.entries(data)) {
          messageText += `◆${key}：${value}\n`;
        }

        // LINE Messaging API へ送信
        const lineResponse = await fetch("https://api.line.me/v2/bot/message/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            to: USER_ID,
            messages: [{ type: "text", text: messageText }],
          }),
        });

        if (lineResponse.ok) {
          return new Response(JSON.stringify({ status: "success" }), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } else {
          return new Response(JSON.stringify({ status: "error" }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      } catch (err) {
        return new Response(JSON.stringify({ status: "error", message: err.message }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    }

    return new Response("Method not allowed", { status: 405 });
  },
};
