const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function run() {
  // IDとパスワードを直接設定
  const loginId = '0061';
  const password = '0061';

  try {
    console.log("お店のサイトへログインを試みています...");
    
    // 1. ログイン用のセッション（クッキー）を確立するためにまずトップへ
    const session = axios.create({
      baseURL: 'https://www.story-tokyo.com',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // 2. ログイン実行
    const params = new URLSearchParams();
    params.append('login_id', loginId);
    params.append('password', password);
    params.append('login', 'ログイン');

    const loginRes = await session.post('/g_con/', params);
    
    // 3. スケジュール管理ページへ移動
    console.log("ログイン完了。スケジュールを取得中...");
    const scheduleRes = await session.get('/g_con/schedule.php');
    const html = scheduleRes.data;

    // 4. HTML解析 (出勤状況をパース)
    const $ = cheerio.load(html);
    let shiftData = [];

    $('tr, div, form').each((i, el) => {
      const text = $(el).text().replace(/\s+/g, ' ');
      const dateMatch = text.match(/(\d{2}\/\d{2})/);
      if (dateMatch) {
        const date = dateMatch[1];
        let time = "休み";
        $(el).find('select option:selected').each((j, opt) => {
          const val = $(opt).text().trim();
          if (val && val !== "選択..." && !val.includes("休み")) {
            time = val;
          }
        });
        
        if (!shiftData.some(d => d.date === date)) {
          shiftData.push({ date, time });
        }
      }
    });

    if (shiftData.length === 0) {
      console.log("解析されたシフトが0件でした。ログイン状況かHTML構造が変わった可能性があります。");
      return;
    }

    console.log("取得できたシフト一覧:", shiftData);

    // 5. profile.html の書き換え
    const profilePath = path.join(__dirname, 'profile.html');
    let profileHtml = fs.readFileSync(profilePath, 'utf8');

    const startTag = '<!-- SHIFT_START -->';
    const endTag = '<!-- SHIFT_END -->';

    const startIndex = profileHtml.indexOf(startTag);
    const endIndex = profileHtml.indexOf(endTag);

    if (startIndex === -1 || endIndex === -1) {
      console.error("エラー: profile.html 内に <!-- SHIFT_START --> と <!-- SHIFT_END --> のコメントタグが見つかりません。");
      return;
    }

    // LINE用のスケジュールテーブルを生成
    let tableHtml = '\n<table style="width:100%; border-collapse: collapse; color: #d4af37;">\n';
    shiftData.forEach(item => {
      tableHtml += `  <tr style="border-bottom: 1px solid #333;">\n`;
      tableHtml += `    <td style="padding: 8px; font-weight: bold;">${item.date}</td>\n`;
      tableHtml += `    <td style="padding: 8px; text-align: right;">${item.time}</td>\n`;
      tableHtml += `  </tr>\n`;
    });
    tableHtml += '</table>\n';

    const updatedHtml = 
      profileHtml.substring(0, startIndex + startTag.length) + 
      tableHtml + 
      profileHtml.substring(endIndex);

    fs.writeFileSync(profilePath, updatedHtml, 'utf8');
    console.log("profile.html を正常に更新しました！");

  } catch (error) {
    console.error("処理中にエラーが発生しました:", error.message);
  }
}

run();
