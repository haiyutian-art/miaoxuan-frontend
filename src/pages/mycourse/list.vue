<template>
  <view class="mycourse-list-container">
    <!-- 已移除动态背景装饰元素 -->
    
    <!-- 顶部装饰 -->
    <view class="decoration"></view>
    
    <!-- 头部区域 -->
    <view class="header">
      <view class="back-button" @tap="goBack">
        <text class="back-icon">
          <image src="/static/images/icon-back.svg" mode="aspectFit"></image>
        </text>
      </view>
      <view class="header-title">{{ currentTerm }}</view>
      <view class="placeholder"></view>
    </view>
    
    <!-- 添加布局提示标签 -->
    <view class="header-notice" v-if="isReady">
      <text class="notice-text">两列网格布局</text>
    </view>
    
    <!-- 课程列表 -->
    <view class="outer-container" v-if="isReady">
      <view class="course-grid">
        <view class="course-item" v-for="(course, index) in courseList" :key="index">
          <view class="course-top">
            <view class="course-code">{{ course.code }}</view>
            <view class="course-credit">{{ course.credit }} 学分</view>
          </view>
          <view class="course-name">{{ course.name }}</view>
          <view class="course-info">
            <view class="course-teacher">{{ course.teacher }}</view>
            <view class="course-time">{{ course.time }}</view>
            <view class="course-location">{{ course.location }}</view>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="loading-container">
      <view class="loading-text">加载中...</view>
    </view>
    
    <!-- 无课程提示 -->
    <view class="no-data" v-if="isReady && courseList.length === 0">
      <text>当前学期暂无已选课程</text>
    </view>
    
    <!-- 统计信息 -->
    <view class="stat-card" v-if="courseList.length > 0">
      <view class="stat-item">
        <text class="stat-label">课程总数</text>
        <text class="stat-value">{{ courseList.length }}</text>
      </view>
      <view class="stat-item">
        <text class="stat-label">总学分</text>
        <text class="stat-value">{{ totalCredits }}</text>
      </view>
    </view>
    
    <!-- 底部操作栏占位 -->
    <view class="bottom-space"></view>
  </view>
</template>

<script>
import { API_BASE_URL } from '@/config'

export default {
  data() {
    return {
      currentTerm: '',
      termCode: '',
      courseList: [],
      isReady: false,
      isLoading: false,
      rawCourseList: []
    }
  },
  computed: {
    totalCredits() {
      return this.courseList.reduce((total, course) => total + course.credit, 0);
    }
  },
  onLoad(options) {
    if (options.term) {
      this.currentTerm = decodeURIComponent(options.term);
      this.isReady = false;
      
      // 获取学期代码
      if (options.code) {
        this.termCode = decodeURIComponent(options.code);
        console.log('收到学期代码:', this.termCode);
      } else {
        // 如果没有传入学期代码，使用名称转换得到
        this.termCode = this.convertTermToApiFormat(this.currentTerm);
        console.log('未传入学期代码，转换得到:', this.termCode);
      }
      
      // 从本地存储获取token
      const token = uni.getStorageSync('token');
      const userInfo = uni.getStorageSync('userInfo');
      
      if (!token || !userInfo) {
        uni.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        setTimeout(() => {
          uni.navigateBack({
            delta: 1
          });
        }, 1500);
        return;
      }
      
      // 根据学期获取对应的课程列表
      this.fetchCourseList();
    } else {
      uni.showToast({
        title: '未指定学期信息',
        icon: 'none',
        duration: 2000
      });
      setTimeout(() => {
        this.goBack();
      }, 1500);
    }
  },
  methods: {
    // 获取课程列表
    fetchCourseList() {
      // 确保已登录
      const token = uni.getStorageSync('token');
      const userInfo = uni.getStorageSync('userInfo');
      
      if (!token || !userInfo) {
        uni.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        this.goBack();
        return;
      }
      
      // 显示加载状态
      this.isLoading = true;
      uni.showLoading({
        title: '加载课程数据...'
      });
      
      // 优先使用传入的学期代码，如果没有则转换
      const apiTerm = this.termCode || this.convertTermToApiFormat(this.currentTerm);
      console.log('请求课程列表，学期:', this.currentTerm, '学期代码:', apiTerm);
      
      uni.request({
        url: `${API_BASE_URL}/student/my-courses`,
        method: 'GET',
        data: {
          term: apiTerm,
          token: token
        },
        header: {
          'Content-Type': 'application/json; charset=UTF-8'
        },
        success: (res) => {
          console.log('获取课程列表返回:', res);
          
          if (res.data && res.data.status === 0) {
            if (Array.isArray(res.data.data) && res.data.data.length > 0) {
              // 成功获取到课程数据
              this.courseList = this.processCourseData(res.data.data);
              console.log('处理后的课程数据:', this.courseList);
            } else {
              console.warn('后端返回了空的课程数据');
              this.courseList = [];
              uni.showToast({
                title: '本学期暂无课程数据',
                icon: 'none',
                duration: 2000
              });
            }
          } else {
            // 检查是否是登录错误
            const errorMsg = res.data?.msg || '未知错误';
            if (errorMsg.includes('请先登录')) {
              console.error('登录验证失败，尝试重新登录');
              uni.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none',
                duration: 2000
              });
              setTimeout(() => {
                uni.reLaunch({
                  url: '/pages/login/index',
                  animationType: 'none'
                });
              }, 1500);
              return;
            }
            
            // 清空课程列表并显示提示
            this.courseList = [];
            uni.showToast({
              title: '获取课程数据失败',
              icon: 'none',
              duration: 2000
            });
          }
        },
        fail: (err) => {
          console.error('获取课程数据请求失败:', err);
          // 清空课程列表并显示提示
          this.courseList = [];
          uni.showToast({
            title: '网络连接不稳定，请稍后再试',
            icon: 'none',
            duration: 2000
          });
        },
        complete: () => {
          // 隐藏加载提示和加载状态
          setTimeout(() => {
            uni.hideLoading();
            this.isReady = true;
            this.isLoading = false;
          }, 500);
        }
      });
    },
    
    // 将学期名称转换为API请求格式
    convertTermToApiFormat(termName) {
      if (!termName) {
        console.warn('未提供学期名称，使用默认值');
        return '3-1';
      }
      
      try {
        // 检查是否是"大X上/下学期"格式
        const gradeMatch = termName.match(/大(\d)([上下])学期/);
        if (gradeMatch && gradeMatch.length >= 3) {
          const year = gradeMatch[1];
          const semester = gradeMatch[2] === '上' ? '1' : '2';
          return `${year}-${semester}`;
        }
        
        // 提取年份信息（旧格式）
        const yearMatch = termName.match(/(\d{4})-(\d{4})/);
        let year = null;
        
        if (yearMatch && yearMatch.length >= 3) {
          year = yearMatch[1]; // 使用学年的开始年份
        }
        
        // 确定学期
        let semester = '1'; // 默认第一学期
        
        if (termName.includes('第一学期')) {
          semester = '1';
        } else if (termName.includes('第二学期')) {
          semester = '2';
        }
        
        // 返回API格式
        if (year) {
          return `${year}-${semester}`;
        } else {
          // 默认返回大三上学期
          return '3-1';
        }
      } catch (error) {
        console.error('转换学期格式失败:', error, termName);
        return '3-1'; // 默认返回大三上学期
      }
    },
    
    // 处理课程数据
    processCourseData(data) {
      try {
        if (!Array.isArray(data)) {
          console.warn('课程数据格式不正确，不是数组');
          return [];
        }
        
        if (data.length === 0) {
          console.warn('课程数据为空数组');
          return [];
        }
        
        console.log('原始课程数据结构:', JSON.stringify(data[0]));
        console.log('课程数量:', data.length);
        
        // 转换API返回的数据格式为本地使用的格式
        return data.map(item => {
          return {
            code: item.courseId || item.id || '',
            name: item.courseName || item.name || '未命名课程',
            credit: parseFloat(item.courseScore || item.score || 0),
            teacher: item.teacherName || item.teacher || '未知',
            time: item.courseTime || item.address || item.schedule || '时间未定',
            location: item.classroom || item.location || '地点待定',
            term: item.term || this.termCode
          };
        });
      } catch (error) {
        console.error('处理课程数据出错:', error);
        return [];
      }
    },
    
    // 将不再使用测试数据的方法
    useTestData() {
      // 该方法现在不再使用测试数据，而是显示空列表
      this.courseList = [];
      uni.showToast({
        title: '无法获取课程数据',
        icon: 'none',
        duration: 2000
      });
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1,
        animationType: 'none',
        fail: function() {
          // 如果导航返回失败，则切换到首页
          uni.switchTab({
            url: '/pages/index/index',
            animationType: 'none'
          });
        }
      });
    }
  }
}
</script>

<style lang="scss">
.mycourse-list-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #4361ee, #3f37c9, #6930c3);
  background-size: 100% 100%; /* 固定背景大小，不再使用动态效果 */
  padding-bottom: 100rpx;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 移除所有背景装饰的样式 */
.background-decoration {
  display: none;
}

/* 移除可能存在的过渡效果和位移动画 */
.course-item {
  transition: none !important;
  transform: none !important;
  animation: none !important;
}

.header {
  transition: none !important;
  animation: none !important;
}

.course-grid {
  transition: none !important;
  animation: none !important;
}

.decoration {
  display: none;
}

.header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx 20rpx;
}

.back-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.back-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.back-icon image {
  width: 30rpx;
  height: 30rpx;
  filter: brightness(0) invert(1);
}

.header-title {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

.placeholder {
  width: 60rpx;
}

.outer-container {
  width: 100%;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.course-grid {
  margin-bottom: 30rpx !important;
  position: relative !important;
  z-index: 1 !important;
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 24rpx !important;
  padding: 4rpx !important; 
  width: 100% !important;
  box-sizing: border-box !important;
}

/* 确保左右两列卡片的圆角一致 */
.course-grid view.course-item:nth-child(odd),
.course-grid view.course-item:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 16rpx !important;
  padding: 24rpx !important;
  display: flex !important;
  flex-direction: column !important;
  height: auto !important; /* 改为自适应高度 */
  min-height: 240rpx !important; /* 设置最小高度 */
  width: 100% !important;
  box-sizing: border-box !important;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1) !important;
  /* 移除过渡动画 */
  position: relative !important;
  margin: 0 !important;
  float: none !important;
  overflow: hidden !important;
}

.course-item {
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.1);
  /* 移除过渡动画 */
  position: relative;
}

.course-item:active {
  /* 移除动态效果，改为阴影变化 */
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}

.course-top {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 16rpx !important;
  height: auto !important; /* 改为自适应高度 */
  min-height: 40rpx !important;
}

.course-code {
  font-size: 28rpx !important;
  font-weight: bold !important;
  color: #4a89dc !important;
  line-height: 1.2 !important; /* 修改行高 */
  padding: 4rpx 0 !important;
}

.course-credit {
  font-size: 24rpx !important;
  color: #fff !important;
  background-color: #4a89dc !important;
  padding: 4rpx 14rpx !important;
  border-radius: 20rpx !important;
  line-height: 1.2 !important; /* 修改行高 */
  display: flex !important;
  align-items: center !important;
  font-weight: 500 !important;
  white-space: nowrap !important;
  margin-left: 8rpx !important;
}

.course-name {
  font-size: 30rpx !important;
  font-weight: bold !important;
  color: #333 !important;
  margin-bottom: 16rpx !important; /* 增加底部间距 */
  line-height: 1.3 !important; /* 修改行高 */
  overflow: hidden !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 2 !important; /* 最多显示两行 */
  -webkit-box-orient: vertical !important;
  text-overflow: ellipsis !important;
  height: auto !important; /* 自适应高度 */
  min-height: 40rpx !important;
  max-height: 80rpx !important; /* 最大高度限制 */
}

.course-info {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
  height: auto !important; /* 改为自适应高度 */
  min-height: 100rpx !important;
  overflow: visible !important; /* 改为可见 */
}

.course-teacher, .course-time, .course-location {
  position: relative !important;
  z-index: 2 !important;
  font-size: 24rpx !important; /* 减小字体大小 */
  color: #666 !important;
  margin-bottom: 10rpx !important; /* 增加底部间距 */
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  height: auto !important; /* 改为自适应高度 */
  line-height: 1.2 !important; /* 修改行高 */
  max-width: 100% !important;
  box-sizing: border-box !important;
  padding-left: 28rpx !important; /* 为图标预留空间 */
  position: relative !important;
}

/* 添加图标 */
.course-teacher:before,
.course-time:before,
.course-location:before {
  content: "";
  position: absolute !important;
  left: 0 !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  width: 20rpx !important;
  height: 20rpx !important;
  background-size: contain !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  opacity: 0.6 !important;
}

.course-teacher:before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E") !important;
}

.course-time:before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z'/%3E%3C/svg%3E") !important;
}

.course-location:before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E") !important;
}

/* 隐藏开发提示 */
.header-notice {
  display: none;
}

.no-data {
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 30rpx;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.stat-card {
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 30rpx;
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #4a89dc;
}

.bottom-space {
  height: 120rpx; /* 为底部导航栏留出空间 */
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200rpx;
  margin-top: 100rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

.notice-text {
  font-size: 24rpx;
  color: #666;
  background-color: #e6f7ff;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

/* 针对移动设备特别处理 */
@media screen and (max-width: 768px) {
  .course-grid view.course-item {
    border-radius: 16rpx !important;
    overflow: hidden !important;
  }
  
  /* 特别强调右侧卡片的圆角 */
  .course-grid view.course-item:nth-child(even) {
    border-top-right-radius: 16rpx !important;
    border-bottom-right-radius: 16rpx !important;
  }
}

/* 覆盖任何可能存在的动画 */
.mycourse-list-container * {
  transition: none !important;
  animation: none !important;
}
</style> 
