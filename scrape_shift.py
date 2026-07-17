# scrape_shift.py
import os
from playwright.sync_api import sync_playwright
import json

def run():
    # 環境変数からID/PWを取得
    user_id = os.environ.get("MY_ID")
    password = os.environ.get("MY_PASSWORD")
    
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        
        # ログイン処理
        page.goto("https://[店舗ログインURL]")
        page.fill('input[name="user_id"]', user_id)
        page.fill('input[name="password"]', password)
        page.click('button[type="submit"]')
        
        # データの取得ロジック（ここを実際のHTML構造に合わせて調整）
        # ...データを辞書形式で抽出...
        data = {"date": "2026-07-17", "status": "出勤"} 
        
        with open("shift_data.json", "w") as f:
            json.dump(data, f)
        browser.close()

if __name__ == "__main__":
    run()
