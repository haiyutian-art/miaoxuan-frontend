<template>
	<view class="chat-container">
		<!-- 导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-left" @click="goBack">
				<uni-icons type="back" size="24" color="#333"></uni-icons>
			</view>
			<view class="navbar-title">AI 助教</view>
			<view class="navbar-right"></view>
		</view>

		<!-- 聊天消息区域 -->
		<scroll-view class="message-list" scroll-y="true" :scroll-top="scrollTop">
			<view v-for="(message, index) in messages" :key="index" class="message-item" :class="{'user-message': message.isUser, 'ai-message': !message.isUser}">
				<view class="message-bubble">
					<text>{{ message.text }}</text>
				</view>
			</view>
			<!-- AI 正在输入... -->
			<view v-if="isLoading" class="message-item ai-message">
				<view class="message-bubble loading-bubble">
					<view class="dot"></view>
					<view class="dot"></view>
					<view class="dot"></view>
				</view>
			</view>
		</scroll-view>

		<!-- 输入框区域 -->
		<view class="input-area">
			<input class="input-field" v-model="currentMessage" placeholder="请输入你的问题..." @confirm="sendMessage" />
			<button class="send-button" @click="sendMessage" :disabled="isLoading || !currentMessage">发送</button>
		</view>
	</view>
</template>

<script setup>
	import { ref, nextTick } from 'vue';
	import { askAI } from '@/api/ai.js';

	const messages = ref([
		{ text: '你好！我是你的 AI 学习助教，有什么可以帮助你的吗？', isUser: false }
	]);
	const currentMessage = ref('');
	const isLoading = ref(false);
	const scrollTop = ref(0);

	const sendMessage = async () => {
		if (!currentMessage.value.trim() || isLoading.value) return;

		messages.value.push({ text: currentMessage.value, isUser: true });
		const userQuestion = currentMessage.value;
		currentMessage.value = '';
		scrollToBottom();
		isLoading.value = true;

		try {
			const res = await askAI({ question: userQuestion });
			if (res && res.status === 0) {
				messages.value.push({ text: res.data, isUser: false });
			} else {
				messages.value.push({ text: '抱歉，我暂时无法回答这个问题。', isUser: false });
			}
		} catch (error) {
			messages.value.push({ text: '网络出错了，请稍后再试。', isUser: false });
		} finally {
			isLoading.value = false;
			scrollToBottom();
		}
	};
	
	const goBack = () => {
		uni.navigateBack();
	};

	const scrollToBottom = () => {
		nextTick(() => {
			scrollTop.value = messages.value.length * 1000;
		});
	};
</script>

<style scoped>
	.chat-container { display: flex; flex-direction: column; height: 100vh; background-color: #f5f7fa; }
	.custom-navbar { display: flex; align-items: center; justify-content: space-between; height: 44px; padding: 0 15px; background-color: #fff; border-bottom: 1px solid #eee; position: fixed; top: 0; left: 0; right: 0; z-index: 99; }
	.navbar-left, .navbar-right { width: 40px; }
	.navbar-title { font-size: 18px; font-weight: bold; }
	.message-list { flex: 1; padding: 60px 15px 70px; box-sizing: border-box; }
	.message-item { display: flex; margin-bottom: 15px; }
	.user-message { justify-content: flex-end; }
	.ai-message { justify-content: flex-start; }
	.message-bubble { max-width: 70%; padding: 10px 15px; border-radius: 12px; font-size: 16px; }
	.user-message .message-bubble { background-color: #4facfe; color: white; }
	.ai-message .message-bubble { background-color: #ffffff; color: #333; }
	.input-area { position: fixed; bottom: 0; left: 0; right: 0; display: flex; align-items: center; padding: 10px; background-color: #fff; border-top: 1px solid #eee; }
	.input-field { flex: 1; height: 40px; padding: 0 10px; background-color: #f5f7fa; border-radius: 20px; margin-right: 10px; }
	.send-button { height: 40px; line-height: 40px; background-color: #4facfe; color: white; border: none; border-radius: 20px; padding: 0 20px; }
	.loading-bubble { display: flex; align-items: center; justify-content: center; height: 41px; }
	.dot { width: 8px; height: 8px; border-radius: 50%; background-color: #999; margin: 0 3px; animation: bounce 1.4s infinite ease-in-out both; }
	.dot:nth-child(1) { animation-delay: -0.32s; }
	.dot:nth-child(2) { animation-delay: -0.16s; }
	@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
</style>