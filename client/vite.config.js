import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// 项目根目录（client 的上一级）。端口统一配置在根目录 .env 中：
//   VITE_PORT=5182  前端开发服务器端口
//   API_PORT=5002   后端 API 端口（/api 代理目标）
// 未配置 .env 时回退到默认 5173 / 5000
const projectRoot = fileURLToPath(new URL('..', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, '');
  const port = Number(env.VITE_PORT) || 5173;
  const apiPort = Number(env.API_PORT) || 5000;

  return {
    plugins: [react()],
    server: {
      port,
      strictPort: true,
      // 将 /api 请求代理到 Express 后端，避免开发环境跨域
      proxy: {
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
  };
});
