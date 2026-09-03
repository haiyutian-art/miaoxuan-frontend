/**
 * 用户相关API
 */
import request from '@/utils/request';

/**
 * 用户登录
 * @param {Object} data - 登录参数 {username, password, role}
 * @returns {Promise} 登录结果
 */
export function login(data) {
  return request.post('/login', data);
}

/**
 * 用户退出登录
 * @returns {Promise} 退出结果
 */
export function logout() {
  return request.post('/logout');
}

/**
 * 获取用户信息
 * @returns {Promise} 用户信息
 */
export function getUserInfo() {
  return request.get('/user/info');
}

/**
 * 重置密码（未登录状态）
 * @param {Object} data - 重置密码参数
 * @returns {Promise} 重置结果
 */
export function resetPassword(data) {
  return request.post('/reset-password', data);
}

/**
 * 获取验证码（用于重置密码）
 * @param {Object} data - 获取验证码参数
 * @returns {Promise} 获取结果
 */
export function getVerifyCode(data) {
  return request.post('/verification-code', data);
} 