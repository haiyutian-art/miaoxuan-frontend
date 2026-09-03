# 秒选通

秒选通是一个基于 **uni-app + Vue 3 + Vite** 的跨端选课系统前端项目，面向学生和教师两类用户，覆盖登录、选课、课表、成绩查询、信息维护等功能。

当前主要支持 H5 平台，并保留了微信小程序、App 等多端编译能力。

## 功能特性

- 学生端
  - 账号登录、忘记密码
  - 课程浏览与选课、退课
  - 我的课程与课表
  - 成绩查询
  - 个人信息维护与密码修改
- 教师端
  - 教师工作台
  - 课程管理
  - 学生名单管理
  - 成绩录入与修改
  - 个人信息维护与密码修改
- AI 问答入口

## 技术栈

- uni-app
- Vue 3
- Vite 5
- Sass
- @dcloudio/uni-ui

## 环境要求

- Node.js 18 及以上版本
- npm 或 pnpm

## 快速开始

```bash
npm install
```

复制环境变量示例文件：

```bash
cp .env.example .env.development
cp .env.example .env.production
```

根据实际情况修改环境变量：

```env
VITE_API_BASE_URL=http://你的后端地址/api
VITE_API_PROXY_TARGET=http://你的后端地址
```

启动 H5 开发服务：

```bash
npm run dev:h5
```

## 环境变量说明

> 注意：`.env.development`、`.env.production` 已被 `.gitignore` 忽略，请勿提交真实后端地址。

| 变量名 | 说明 | 示例 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | 后端 API 基础地址，包含 `/api` | `http://120.55.112.108:8080/api` |
| `VITE_API_PROXY_TARGET` | H5 开发环境代理目标地址 | `http://120.55.112.108:8080` |

后端地址统一在 `src/config.js` 中读取，业务页面通过 `API_BASE_URL` 使用；H5 开发代理在 `vite.config.js` 中配置。

## 常用命令

### 开发

```bash
npm run dev:h5
npm run dev:mp-weixin
```

### 构建

```bash
npm run build:h5
npm run build:mp-weixin
```

完整的多端命令可以参考 `package.json` 中的 `scripts`。

## 目录结构

```text
.
├── src
│   ├── api                 # API 接口封装
│   ├── components          # 公共组件
│   ├── config.js           # 环境变量读取与统一配置
│   ├── pages               # 页面
│   ├── static              # 静态资源
│   ├── utils
│   │   └── request.js      # 请求封装
│   ├── App.vue
│   ├── main.js
│   ├── manifest.json
│   └── pages.json
├── .env.example            # 环境变量示例，可提交
├── package.json
├── vite.config.js
└── README.md
```

## 构建产物

- H5 构建产物输出到 `dist/`
- 其他平台编译产物输出到 `unpackage/`

这两个目录均已在 `.gitignore` 中忽略，不需要提交到仓库。

## 提交前检查

- 不要提交 `.env.development`、`.env.production`
- 不要提交 `node_modules/`、`dist/`、`unpackage/`
- 生产构建前确认 `.env.production` 中的后端地址已更新

