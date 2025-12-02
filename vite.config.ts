import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // 如果是 GitHub Pages 部署，使用仓库名称作为 base 路径
    // 如果是 username.github.io 仓库，base 应该是 '/'
    const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
    const base = repoName && !repoName.includes('.github.io') 
      ? `/${repoName}/` 
      : '/';
    
    return {
      base,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
