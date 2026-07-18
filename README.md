# 滅蟲師傅官網 — GitHub Pages 獨立 URL 版本

## 網站結構

```
bruceleehk-site/
├── CNAME                    # 自訂域名指向
├── _config.yml              # Jekyll 配置
├── manifest.json            # PWA manifest
├── robots.txt               # 搜尋引擎爬蟲指引
├── sitemap.xml              # 網站地圖
├── 404.html                 # 自訂 404 頁面
├── index.html               # 首頁
├── assets/
│   ├── css/
│   │   └── style.css        # 主樣式表
│   ├── js/
│   │   └── main.js          # 主腳本
│   └── img/                 # 圖片資源（待擴充）
├── services/
│   └── index.html           # 蟲類服務頁
├── strategy/
│   └── index.html           # 有蟲就有計頁
├── info/
│   └── index.html           # 蟲類資訊頁
└── quote/
    └── index.html           # 免費報價頁
```

## 獨立 URL 架構

| 頁面 | 路徑 | 說明 |
|------|------|------|
| 首頁 | `/` | 首頁總覽，含服務、策略預覽、資訊預覽 |
| 蟲類服務 | `/services/` | 四大服務詳情及收費 |
| 有蟲就有計 | `/strategy/` | 九大策略完整內容 |
| 蟲類資訊 | `/info/` | 三篇資訊文章完整內容 |
| 免費報價 | `/quote/` | 線上報價表單 |

## 部署方式

1. 在 GitHub 建立名為 `bruceleehk.github.io` 的 repository（或任意名稱）
2. 將此目錄所有檔案推送到 `main` 分支
3. 在 GitHub repo 設定 → Pages → 選擇 `main` 分支
4. 確保域名 DNS 設定 CNAME 指向 `bruceleehk.github.io`
5. GitHub 會自動讀取 CNAME 文件，啟用 `www.bruceleehk.com` 自訂域名

## 相比原站的改進

1. **多頁獨立 URL**：原站為單頁錨點式導航，現改為 5 個獨立頁面，每個頁面有獨立 URL
2. **SEO 完整**：每頁獨立 title、description、canonical、OG tags
3. **sitemap.xml**：提供搜尋引擎完整站點地圖
4. **robots.txt**：指引搜尋引擎爬取
5. **CNAME**：確保自訂域名正確指向
6. **_config.yml**：啟用 Jekyll SEO 插件
7. **manifest.json**：PWA 支援
8. **404.html**：自訂 404 錯誤頁面
9. **JSON-LD 結構化數據**：LocalBusiness schema
10. **CSS/JS 外置**：樣式與腳本獨立文件，提升快取效率
