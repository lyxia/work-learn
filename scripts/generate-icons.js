import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建一个简单的 SVG 图标（使用 Canvas API 需要 Node.js 环境）
// 这里我们创建一个 SVG 文件，然后可以使用 sharp 或其他工具转换为 PNG
// 为了简化，我们直接创建一个 SVG 图标

const svgIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="512" height="512" fill="#FEF9C3" rx="100"/>
  
  <!-- 小岛形状 -->
  <path d="M 100 400 Q 150 350 200 380 T 300 380 T 400 400 L 400 512 L 100 512 Z" fill="#FCD34D" stroke="#F59E0B" stroke-width="8"/>
  
  <!-- 蛋仔角色 -->
  <circle cx="256" cy="280" r="80" fill="#FCD34D" stroke="#F59E0B" stroke-width="6"/>
  <circle cx="240" cy="260" r="12" fill="#1F2937"/>
  <circle cx="272" cy="260" r="12" fill="#1F2937"/>
  <path d="M 230 290 Q 256 310 282 290" stroke="#1F2937" stroke-width="4" fill="none" stroke-linecap="round"/>
  
  <!-- 装饰：云朵 -->
  <circle cx="150" cy="150" r="30" fill="white" opacity="0.8"/>
  <circle cx="180" cy="150" r="35" fill="white" opacity="0.8"/>
  <circle cx="210" cy="150" r="30" fill="white" opacity="0.8"/>
  
  <!-- 装饰：太阳 -->
  <circle cx="380" cy="120" r="40" fill="#FCD34D"/>
  <path d="M 380 60 L 380 80 M 380 180 L 380 200 M 320 120 L 340 120 M 440 120 L 460 120 M 340 80 L 355 95 M 420 80 L 405 95 M 340 160 L 355 145 M 420 160 L 405 145" stroke="#F59E0B" stroke-width="6" stroke-linecap="round"/>
</svg>`;

// 确保 public 目录存在
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 保存 SVG
const svgPath = path.join(publicDir, 'icon.svg');
fs.writeFileSync(svgPath, svgIcon);
console.log('✅ SVG 图标已创建:', svgPath);

// 尝试使用 sharp 转换为 PNG
try {
  const sharp = (await import('sharp')).default;
  
  const png192 = path.join(publicDir, 'pwa-192x192.png');
  const png512 = path.join(publicDir, 'pwa-512x512.png');
  
  await sharp(svgPath)
    .resize(192, 192)
    .png()
    .toFile(png192);
  console.log('✅ PNG 图标已创建:', png192);
  
  await sharp(svgPath)
    .resize(512, 512)
    .png()
    .toFile(png512);
  console.log('✅ PNG 图标已创建:', png512);
  
  console.log('🎉 所有图标已生成完成！');
} catch (error) {
  console.log('⚠️  sharp 未安装或转换失败，请手动转换 SVG 为 PNG');
  console.log('   安装: npm install -D sharp');
  console.log('   错误:', error.message);
}

