import {
	createSSRApp
} from "vue";
import App from "./App.vue";
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'

// 导入请求模块用于测试连接
import request from './utils/request';
import { API_BASE_URL } from './config';

// 启动时测试后端连接
setTimeout(() => {
	console.log('🔍 正在测试与后端服务器的连接...');
	
	// 尝试请求用户信息接口
	uni.request({
		url: `${API_BASE_URL}/user/info`,
		method: 'GET',
		header: {
			'Content-Type': 'application/json'
		},
		success: (res) => {
			console.log('✅ 后端连接测试响应:', res);
			
			if (res.statusCode === 200) {
				console.log('✅ 成功连接到后端服务器!');
			} else {
				console.log('❌ 连接到后端服务器，但请求失败:', res.statusCode);
			}
		},
		fail: (err) => {
			console.error('❌ 无法连接到后端服务器:', err);
		}
	});
}, 2000);

export function createApp() {
	const app = createSSRApp(App);
	
	// 注册全局组件
	app.component('uni-icons', uniIcons)
	
	return {
		app,
	};
}
