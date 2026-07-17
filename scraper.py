import os
from playwright.sync_api import sync_playwright

# ここに直接記述（Privateリポジトリなら安全）
USER_ID = "0061" 
PASSWORD = "0061"

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("https://www.story-tokyo.com/g_con/")
        
        # ログイン処理（セレクタ名は実際の画面に合わせて調整）
        page.fill('input[name="user_id"]', USER_ID)
        page.fill('input[name="password"]', PASSWORD)
        page.click('button[type="submit"]')
        
        # ページが表示されるまで待つ
        page.wait_for_load_state("networkidle")
        
        # 取得した内容をファイルに出力（デバッグ用）
        with open("shift_result.txt", "w", encoding="utf-8") as f:
            f.write(page.content())
            
        browser.close()

if __name__ == "__main__":
    run()