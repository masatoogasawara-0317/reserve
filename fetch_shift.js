const axios = require('axios');
const { URLSearchParams } = require('url');

async function run() {
  const loginId = '0061'; // ID
  const password = '0061'; // パスワード

  try {
    const instance = axios.create({
      baseURL: 'https://www.story-tokyo.com',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    // ログイン処理（特定したname属性を使用）
    const loginData = new URLSearchParams();
    loginData.append('girl_user_tel', loginId); // ID欄
    loginData.append('girl_user_login_pass', password); // パスワード欄
    loginData.append('login', 'ログイン'); // ボタンの指定

    console.log("ログイン試行中...");
    await instance.post('/g_con/', loginData);
    
    // スケジュールページの取得
    const res = await instance.get('/g_con/schedule.php');
    console.log("ログイン成功、データ取得開始");
    
    // （ここにHTML解析のロジックが続きます）
    
  } catch (error) {
    console.error("ログインエラー:", error.message);
  }
}
run();
