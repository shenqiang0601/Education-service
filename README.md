# 智能教育答疑助手

一个基于Vue 3和大语言模型的智能教育答疑系统，能够解答计算机、数学、物理等学科知识，并提供错题诊断和学习路径推荐。

## 🚀 功能特性

### 核心功能
- **智能问答**：接入大语言模型，提供准确、专业的学科知识解答
- **Markdown渲染**：支持Markdown格式回复，包含代码高亮显示
- **流式响应**：采用流式输出，提升用户体验
- **快捷提问**：内置常见问题模板，一键快速提问
- **多学科支持**：覆盖计算机、数学、物理等多个学科领域
- **新建对话**：支持快速切换到新的对话场景

### 用户体验
- **响应式设计**：自适应不同屏幕尺寸
- **友好的UI**：基于MetaChat UI和Vue DevUI组件库
- **实时交互**：消息即时显示，滚动到底部
- **输入限制**：支持2000字以内的提问内容

## 🛠 技术栈

| 技术/框架 | 版本 | 用途 |
|---------|------|------|
| Vue | ^3.5.24 | 前端框架 |
| TypeScript | ~5.9.3 | 类型系统 |
| Vite | ^7.2.2 | 构建工具 |
| MetaChat Core | ^1.10.0 | UI组件库核心 |
| Vue DevUI | ^1.6.34 | UI组件 |
| OpenAI | ^6.8.1 | 大模型API客户端 |
| Marked | - | Markdown渲染 |
| Highlight.js | - | 代码高亮 |

## 📋 环境要求

- Node.js 18.x 或更高版本
- npm 9.x 或更高版本
- 一个有效的DeepSeek API密钥（用于大模型调用）

## 🚦 安装与启动

### 1. 克隆项目

```bash
git clone <repository-url>
cd Education-service
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置API密钥

修改 `src/config/model.config.ts` 文件，填入你的DeepSeek API密钥：

```typescript
// src/config/model.config.ts
export const modelConfig = {
  apiKey: '你的DeepSeek API密钥',
  baseURL: 'https://api.deepseek.com',
  model: 'deepseek-chat',
};
```

### 4. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

### 5. 构建生产版本

```bash
npm run build
```

构建后的文件将在 `dist` 目录中。

### 6. 预览生产版本

```bash
npm run preview
```

## ⚙️ 配置说明

### 环境变量

项目支持以下环境变量（可在 `.env` 文件中配置）：

- `VITE_MAAS_MODEL`：指定使用的大语言模型，默认为 `DeepSeek-V3`

### 模型配置

在 `src/config/model.config.ts` 中可以配置：

- `apiKey`：DeepSeek API密钥
- `baseURL`：API基础地址
- `model`：模型名称

## 📱 使用说明

### 欢迎页面

首次进入应用时，会显示欢迎页面，包含：
- 应用介绍
- 快捷提问选项

### 提问方式

1. **快捷提问**：点击欢迎页面或对话页面下方的快捷提问选项
2. **自定义提问**：在输入框中输入你的问题，按回车发送

### 新建对话

点击右下角的圆形加号按钮，可以清除当前对话记录，返回欢迎页面，开始新的对话。

## 📁 项目结构

```
Education-service/
├── public/               # 静态资源
├── src/                  # 源代码
│   ├── assets/           # 项目资源文件
│   ├── components/       # Vue组件
│   ├── config/           # 配置文件
│   │   └── model.config.ts  # 模型配置
│   ├── utils/            # 工具函数
│   │   └── markdown.ts    # Markdown处理
│   ├── App.vue           # 主应用组件
│   ├── main.ts           # 应用入口
│   └── style.css         # 全局样式
├── .gitignore            # Git忽略文件
├── index.html            # HTML入口
├── package.json          # 项目配置和依赖
├── tsconfig.json         # TypeScript配置
└── vite.config.ts        # Vite配置
```

## 🔧 开发说明

### 添加新的快捷提问

在 `App.vue` 文件中，修改 `introPrompt.list` 和 `simplePrompt` 数组，添加新的快捷提问选项：

```typescript
// 欢迎页面快捷提问
const introPrompt = {
  direction: 'horizontal',
  list: [
    {
      value: 'unique-id',
      label: '提问内容',
      iconConfig: { name: 'icon-info-o', color: '#5e7ce0' },
      desc: '描述信息',
    },
    // 更多选项...
  ],
};

// 对话页面快捷提问
const simplePrompt = [
  {
    value: 'unique-id',
    iconConfig: { name: 'icon-info-o', color: '#5e7ce0' },
    label: '提问内容',
  },
  // 更多选项...
];
```

### 自定义系统提示词

在 `fetchData` 函数中，可以修改系统提示词，调整AI助手的行为：

```typescript
const completion = await client.chat.completions.create({
  model: import.meta.env.VITE_MAAS_MODEL,
  messages: [
    {
      role: 'system',
      content: '你是一个专业的知识答疑学习助手...', // 自定义系统提示词
    },
    { role: 'user', content: ques },
  ],
  stream: true,
});
```

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目。

## 📝 许可证

[MIT](https://opensource.org/licenses/MIT)

## 📧 联系我们

如有问题或建议，请联系项目维护者。