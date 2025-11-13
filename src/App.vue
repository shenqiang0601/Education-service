<template>
  <McLayout class="container">
    <!-- 头部 -->
    <McHeader :title="'智能教育答疑助手'" :logoImg="'https://matechat.gitcode.com/logo.svg'">
      <template #operationArea>
        <div class="operations">
          <i class="icon-helping"></i>
        </div>
      </template>
    </McHeader>

    <!-- 启动页（欢迎页面） -->
    <McLayoutContent
        v-if="startPage"
        style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px"
    >
      <McIntroduction
          :logoImg="'https://matechat.gitcode.com/logo2x.svg'"
          :title="'智能教育答疑助手'"
          :subTitle="'Hi，欢迎使用智能教育答疑助手'"
          :description="description"
      ></McIntroduction>
      <McPrompt
          :list="introPrompt.list"
          :direction="introPrompt.direction"
          class="intro-prompt"
          @itemClick="onSubmit($event.label)"
      ></McPrompt>
    </McLayoutContent>

    <!-- 对话内容区 -->
    <McLayoutContent ref="messageContainer" class="content-container" v-else>
      <template v-for="(msg, idx) in messages" :key="idx">
        <!-- 用户消息 -->
        <McBubble
            v-if="msg.from === 'user'"
            :content="msg.content"
            :align="'right'"
            :avatarConfig="{ imgSrc: 'https://matechat.gitcode.com/png/demo/userAvatar.svg' }"
        >
        </McBubble>
        <!-- AI 回复 - 使用 McMarkdownCard 渲染 Markdown -->
        <McBubble
            v-else
            :avatarConfig="{ imgSrc: 'https://matechat.gitcode.com/logo.svg' }"
            :loading="msg.loading"
        >
          <McMarkdownCard v-if="!msg.loading" :content="msg.content" />
        </McBubble>
      </template>
    </McLayoutContent>

    <!-- 快捷提示 + 新建对话按钮 -->
    <div class="shortcut" style="display: flex; align-items: center; gap: 8px">
      <McPrompt
          v-if="!startPage"
          :list="simplePrompt"
          :direction="'horizontal'"
          style="flex: 1"
          @itemClick="onSubmit($event.label)"
      ></McPrompt>
      <Button
          style="margin-left: auto"
          icon="add"
          shape="circle"
          title="新建对话"
          size="md"
          @click="newConversation"
      />
    </div>

    <!-- 输入框 -->
    <McLayoutSender>
      <McInput :value="inputValue" :maxLength="2000" @change="(e) => (inputValue = e)" @submit="onSubmit">
        <template #extra>
          <div class="input-foot-wrapper">
            <div class="input-foot-left">
              <span v-for="(item, index) in inputFootIcons" :key="index">
                <i :class="item.icon"></i>
                {{ item.text }}
              </span>
              <span class="input-foot-dividing-line"></span>
              <span class="input-foot-maxlength">{{ inputValue.length }}/2000</span>
            </div>
            <div class="input-foot-right">
              <Button icon="op-clearup" shape="round" :disabled="!inputValue" @click="inputValue = ''">
                <span class="demo-button-content">清空输入</span>
              </Button>
            </div>
          </div>
        </template>
      </McInput>
    </McLayoutSender>
  </McLayout>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
// 引入 vue-devui 的 Button 组件
import { Button } from 'vue-devui/button';
import 'vue-devui/button/style.css';
import { modelConfig } from './config/model.config';
import OpenAI from 'openai';
import { renderMarkdown } from './utils/markdown';
import 'highlight.js/styles/github.css';

// 消息容器的引用
const messageContainer = ref<HTMLElement | null>(null);

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      const container = messageContainer.value.$el || messageContainer.value;
      container.scrollTop = container.scrollHeight;
    }
  });
};


// 初始化 OpenAI 客户端
const client = new OpenAI({
  apiKey: modelConfig.apiKey, // 模型 APIKey
  baseURL: modelConfig.baseURL, // 模型 API 地址
  dangerouslyAllowBrowser: true,
});

const onSubmit = (evt: string) => {
  if (!evt || typeof evt !== 'string') return;

  inputValue.value = '';
  startPage.value = false;

  // 用户发送消息
  messages.value.push({
    from: 'user',
    content: evt,
  });

  // 滚动到底部
  scrollToBottom();

  // 调用大模型 API
  fetchData(evt);
};

const fetchData = async (ques: string) => {
  // 添加一个 loading 状态的消息
  messages.value.push({
    from: 'model',
    content: '',
    id: '',
    loading: true,
  });

  // 滚动到底部显示 loading
  scrollToBottom();

  try {
    const completion = await client.chat.completions.create({
      model: import.meta.env.VITE_MAAS_MODEL, // DeepSeek-V3
      messages: [
        {
          role: 'system',
          content: '你是一个专业的知识答疑学习助手，擅长解答各类学科，计算机等问题。回答要清晰、准确，并提供代码示例。使用 Markdown 格式回复。',
        },
        { role: 'user', content: ques },
      ],
      stream: true, // 开启流式返回
    });

    // 处理流式响应
    for await (const chunk of completion) {
      messages.value[messages.value.length - 1].loading = false;
      const content = chunk.choices[0]?.delta?.content || '';
      const chatId = chunk.id;
      messages.value[messages.value.length - 1].content += content;
      messages.value[messages.value.length - 1].id = chatId;

      // 每次收到新内容都滚动到底部
      scrollToBottom();
    }
  } catch (error) {
    console.error('API 调用失败:', error);
    messages.value[messages.value.length - 1].loading = false;
    messages.value[messages.value.length - 1].content = '抱歉，我遇到了一些问题，请稍后再试。';
    scrollToBottom();
  }
};

const description = [
  '我可以帮助你学习关于计算机，数学，物理等学科知识的答疑解惑。',
  '提供学生错题集、错误诊断、学习路径推荐等服务。',
];

const introPrompt = {
  direction: 'horizontal',
  list: [
    {
      value: 'vue3',
      label: '二叉树遍历混淆”后，系统识别错误类型并推荐关联知识点',
      iconConfig: { name: 'icon-info-o', color: '#5e7ce0' },
      desc: '二叉树遍历混淆”后，系统识别错误类型并推荐关联知识点',
    },
    {
      value: 'closure',
      label: '基于当前问题"二叉树遍历”，系统推荐"递归实现”、“栈模拟递归"、“Morris遍历"三个知识点',
      iconConfig: { name: 'icon-star', color: 'rgb(255, 215, 0)' },
      desc: '二叉树遍历”，系统推荐',
    },
  ],
};

const simplePrompt = [
  {
    value: 'async',
    iconConfig: { name: 'icon-info-o', color: '#5e7ce0' },
    label: '抛物线公式是什么？',
  },
  {
    value: 'performance',
    iconConfig: { name: 'icon-star', color: 'rgb(255, 215, 0)' },
    label: '如何理解牛顿三大定律',
  },
];

const startPage = ref(true);
const inputValue = ref('');
const inputFootIcons = [
  { icon: 'icon-at', text: '智能体' },
  { icon: 'icon-standard', text: '词库' },
  { icon: 'icon-add', text: '附件' },
];

const messages = ref<any[]>([]);

const newConversation = () => {
  startPage.value = true;
  messages.value = [];
};

/*const onSubmit = (evt: string) => {
  if (!evt || typeof evt !== 'string') return;

  inputValue.value = '';
  startPage.value = false;

  // 用户发送消息
  messages.value.push({
    from: 'user',
    content: evt,
  });

  // 模拟 AI 回复（后续接入真实 API）
  setTimeout(() => {
    messages.value.push({
      from: 'model',
      content: `这是对"${evt}"的模拟回复。稍后我们将接入真实的大模型 API。`,
      loading: false,
    });
  }, 500);
};*/
</script>

<style>
.container {
  width: 1000px;
  margin: 20px auto;
  height: calc(100vh - 82px);
  padding: 20px;
  gap: 8px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 16px;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: auto;
}

.input-foot-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-right: 8px;
}

.input-foot-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-foot-left span {
  font-size: 14px;
  color: #252b3a;
  cursor: pointer;
}

.input-foot-dividing-line {
  width: 1px;
  height: 14px;
  background-color: #d7d8da;
}

.input-foot-maxlength {
  font-size: 14px;
  color: #71757f;
}

.demo-button-content {
  font-size: 14px;
}
</style>