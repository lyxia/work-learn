<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1NAfKxKqO88E6ZCD4ZqWXgMUWdnjx3lCi

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

项目已配置 GitHub Actions 自动部署到 GitHub Pages。

### 设置步骤：

1. **启用 GitHub Pages**
   - 进入仓库的 Settings → Pages
   - Source 选择 "GitHub Actions"

2. **配置 Secrets（如果需要）**
   - 进入仓库的 Settings → Secrets and variables → Actions
   - 添加 `GEMINI_API_KEY` secret（如果应用需要 API 密钥）

3. **推送代码**
   - 推送到 `main` 分支后，GitHub Actions 会自动构建并部署
   - 或者手动触发：Actions → Deploy to GitHub Pages → Run workflow

4. **访问网站**
   - 部署完成后，在 Actions 页面可以看到部署 URL
   - 或者访问：`https://[你的用户名].github.io/[仓库名]/`

### 注意事项：

- 如果仓库名是 `username.github.io`，网站将部署在根路径 `/`
- 其他仓库名，网站将部署在 `/[仓库名]/` 路径下
- 构建过程会自动处理路径配置
