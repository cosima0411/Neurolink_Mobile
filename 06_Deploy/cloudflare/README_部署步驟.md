> 所屬遊戲：Neurolink Mobile
> 版本：v000.002.000
> 最後更新：2026-10-02

# Cloudflare 部署步驟（不接 GitHub，手動上傳）

這個資料夾裡有三樣東西：

```
index.html              ← 遊戲本體（含 GA4、頁尾版本/人數、全球紀錄面板）
functions/
  api/
    stats.js             ← 全球紀錄的小型後端（Cloudflare Pages Function）
README_部署步驟.md        ← 這份文件
```

## 一、建立 Cloudflare 帳號、建立專案

1. 到 https://dash.cloudflare.com 註冊／登入一個免費帳號。
2. 左側選單找「Workers 和 Pages」（或直接叫「Workers」，介面可能因版本而略有不同）。
3. 點「建立」→ 選擇上傳資產／靜態網站的方式（不要選「連接 Git」，因為我們這次不接 GitHub）。
4. 專案名稱輸入：**neurolink-mobile**
   這會決定妳的網址，之後大概會是 `https://neurolink-mobile.<妳的帳號子網域>.workers.dev` 或 `https://neurolink-mobile.pages.dev`（實際以 Cloudflare 當下顯示的為準）。
5. 把這個資料夾**整個**（`index.html` 跟 `functions/` 資料夾都要）拖曳上傳，或照畫面指示選擇資料夾上傳。

## 二、建立 KV 並綁定（全球紀錄一定要做這一步，不然 /api/stats 會壞掉）

1. 在 Cloudflare 左側選單找「儲存和資料庫」(Storage & Databases) → KV，建立一個新的 KV namespace，名字隨意，例如 `neurolink-stats`。
2. 回到妳剛剛建立的 `neurolink-mobile` 專案 → 進入「設定」(Settings) → 找「函式」(Functions) 或「繫結」(Bindings) 分頁。
3. 新增一個 KV namespace 綁定：
   - **變數名稱**：`NEUROLINK_STATS`　（這個名字要完全對，程式碼裡就是用這個名字去讀寫資料）
   - **KV namespace**：選剛剛建立的那個
4. 存檔後，通常需要重新部署一次（或等下次上傳）設定才會生效。

## 三、驗證

部署完成、綁定好 KV 之後：

1. 打開妳的新網址，確認遊戲畫面正常、標題畫面有出現版本號／人數那行文字、「📊 全球紀錄」按鈕可以點開。
2. 用瀏覽器打開 `妳的網址/api/stats`，應該會看到類似這樣的 JSON：
   ```json
   {"totalVisits":1,"bestFullCharge":0,"bestChaseSurvived":0,"avgChaseDistance":0}
   ```
   如果看到錯誤訊息或空白，最常見的原因就是 KV 綁定的變數名稱打錯，回去檢查「二、」的步驟。

## 四、之後要更新遊戲內容怎麼辦

因為這次選的是手動上傳、沒有接 GitHub，所以**之後我每次改完遊戲，都要重新把整個資料夾（含 `functions/`）交給妳，妳再到 Cloudflare 專案頁面重新上傳一次**，舊版會被新版蓋掉，網址不會變。KV 裡存的全球紀錄資料不會因為重新上傳網站而被清空，兩者是分開的。

## 五、GA4

網頁裡已經寫死了妳的 GA4 Measurement ID（`G-5SW38TE146`），部署到 Cloudflare 後就會開始收到資料，不需要再額外設定。資料會出現在 Google Analytics 後台的「報表」裡，不過不是每筆資料都即時，有時候要等幾分鐘到幾小時。
