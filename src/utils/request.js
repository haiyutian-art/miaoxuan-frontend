/**
 * 封装通用请求方法
 */

import { API_BASE_URL as BASE_URL } from '@/config';

// 请求拦截器
const beforeRequest = (config) => {
  // 获取token
  const token = uni.getStorageSync('token');
  
  // 如果有token，同时添加到URL参数和请求头
  if (token) {
    // 处理URL参数
    const separator = config.url.includes('?') ? '&' : '?';
    config.url = `${config.url}${separator}token=${token}`;
    
    // 同时添加到请求头
    config.header = {
      ...config.header,
      'Authorization': token,  // 保留原有的Authorization头
      'X-Token': token  // 同时添加X-Token用于调试
    };
  }
  
  // 调试输出请求信息
  console.log('🚀【API请求】', config.method, config.url, config.data);
  
  return config;
};

// 响应拦截器
const handleResponse = (response) => {
  // 调试输出响应信息
  console.log('📩【API响应】', response.statusCode, response.data);
  
  // 处理HTTP错误
  if (response.statusCode !== 200) {
    uni.showToast({
      title: `请求失败: ${response.statusCode}`,
      icon: 'none'
    });
    return Promise.reject(response);
  }
  
  return response.data;
};

// 通用请求方法
const request = (options) => {
  // 合并默认配置
  const requestOptions = {
    url: BASE_URL + (options.url || ''),
    data: options.data,
    method: options.method || 'GET',
    header: {
      'Content-Type': 'application/json',
      ...options.header
    },
    dataType: 'json',
    timeout: 30000, // 设置30秒超时
    enableHttp2: true, // 启用HTTP2
    enableQuic: true, // 启用QUIC
    enableCache: true // 启用缓存
  };
  
  // 请求拦截
  beforeRequest(requestOptions);
  
  // 发送请求
  return new Promise((resolve, reject) => {
    console.log('开始请求:', requestOptions.url);
    
    uni.request({
      ...requestOptions,
      success: (res) => {
        console.log('请求成功:', requestOptions.url, res);
        try {
          const result = handleResponse(res);
          resolve(result);
        } catch (error) {
          console.error('处理响应错误:', error);
          reject(error);
        }
      },
      fail: (err) => {
        console.error('❌【API错误】', requestOptions.url, err);
        // 更详细的错误信息
        let errorMsg = '网络请求失败';
        if (err.errMsg.includes('timeout')) {
          errorMsg = '请求超时，请检查网络';
        } else if (err.errMsg.includes('connection')) {
          errorMsg = '无法连接到服务器，请检查网络或服务器状态';
        }
        
        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000
        });
        reject(err);
      }
    });
  });
};

// 导出便捷请求方法
export default {
  get: (url, data, options = {}) => {
    return request({
      url,
      data,
      method: 'GET',
      ...options
    });
  },
  post: (url, data, options = {}) => {
    return request({
      url,
      data,
      method: 'POST',
      ...options
    });
  },
  put: (url, data, options = {}) => {
    return request({
      url,
      data,
      method: 'PUT',
      ...options
    });
  },
  delete: (url, data, options = {}) => {
    return request({
      url,
      data,
      method: 'DELETE',
      ...options
    });
  }
}; 
