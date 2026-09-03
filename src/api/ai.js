import request from '@/utils/request';

/**
 * 向 AI 提问
 * @param {Object} data - 问题参数 { question: "你的问题" }
 * @returns {Promise} AI 的回答
 */
export function askAI(data) {
  return request.post('/ai/chat', data);
}