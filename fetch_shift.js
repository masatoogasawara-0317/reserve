const axios = require('axios');
const { URLSearchParams } = require('url');
const fs = require('fs');
const cheerio = require('cheerio');

async function run() {
  const loginId = '0061';
  const password = '0061';

  try {
    const instance = axios.create({
      baseURL: 'https://www.story-tokyo.com',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      withCredentials: true // クッキーを保持する設定
    });

    // 1. ログイン処理
    const loginData = new URLSearchParams();
    loginData.append('girl_user_tel', loginId);
    loginData.append('girl_user_login_pass', password);
    loginData.append('login', 'ログイン');

    console.log("ログイン試行中...");
    await instance.post('/g_con/', loginData);
    
    // 2. スケジュールページの取得
    console.log("スケジュールページを取得中...");
    const res = await instance.get('/g_con/schedule.php');
    
    // 3. データの抽出（ここが重要です！）
    const $ = cheerio.load(res.data);
    
    // お店のサイト構造に合わせて修正が必要な箇所です
    // 一旦、ページ内のテーブル全体を取得してみます
    const shiftContent = $('table').html(); 

    if (!shiftContent) {
      throw new Error("シフト表が見つかりませんでした。サイトの構造が変わった可能性があります。");
    }

    // 4. profile.htmlへ書き込み
    let profile = fs.readFileSync('profile.html', 'utf8');
    const regex = /<!-- SHIFT_START -->[\s\S]*?<!-- SHIFT_END -->/;
    const newContent = `<!-- SHIFT_START -->\n<table>${shiftContent}</table>\n<!-- SHIFT_END -->`;
    
    profile = profile.replace(regex, newContent);
    fs.writeFileSync('profile.html', profile);
    
    console.log("更新完了！");

  } catch (error) {
    console.error("エラー:", error.message);
    process.exit(1);
  }
}
run();
