// 后端接口基础地址由 Vite 环境变量注入。
// 在 .env.development / .env.production 中维护，不要把真实地址写死在代码里。
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
