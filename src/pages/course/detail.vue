<template>
  <view class="detail-container">
    <view class="header blue-gradient-bg">
      <!-- 返回按钮 -->
      <view class="back-button" @tap="goBack">
        <text class="iconfont icon-back"></text>
      </view>
      
      <!-- 课程信息卡片 -->
      <view class="course-card card">
        <view class="course-header">
          <text class="course-name">{{ courseDetail.courseName || '加载中...' }}</text>
          <view class="course-type">{{ courseDetail.courseType || '' }}</view>
        </view>
        
        <view class="course-info">
          <view class="info-item">
            <text class="iconfont icon-teacher"></text>
            <text class="info-text">{{ courseDetail.teacherName || '暂无' }}</text>
          </view>
          
          <view class="info-item">
            <text class="iconfont icon-time"></text>
            <text class="info-text">{{ getScheduleText() }}</text>
          </view>
          
          <view class="info-item">
            <text class="iconfont icon-location"></text>
            <text class="info-text">{{ courseDetail.address || '地点待定' }}</text>
          </view>
          
          <view class="info-item">
            <text class="iconfont icon-score"></text>
            <text class="info-text">{{ courseDetail.courseScore || '0' }}学分</text>
          </view>
        </view>
        
        <view class="course-stats">
          <view class="stats-item">
            <text class="stats-label">已选人数</text>
            <text class="stats-value">{{ courseDetail.number - courseDetail.stock || '0' }}</text>
          </view>
          
          <view class="stats-item">
            <text class="stats-label">课程容量</text>
            <text class="stats-value">{{ courseDetail.number || '0' }}</text>
          </view>
          
          <view class="stats-item">
            <text class="stats-label">剩余名额</text>
            <text class="stats-value">{{ courseDetail.stock || '0' }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="content">
      <!-- 选课按钮 -->
      <view class="action-section" v-if="!isLoading">
        <button 
          class="action-button" 
          :class="{'cancel': courseDetail.status === '1', 'disabled': courseDetail.stock <= 0 && courseDetail.status !== '1'}"
          @tap="handleCourseAction"
          :disabled="courseDetail.stock <= 0 && courseDetail.status !== '1'"
        >
          {{ courseDetail.status === '1' ? '退选课程' : '选择课程' }}
        </button>
        <text class="action-tip" v-if="courseDetail.status !== '1' && courseDetail.stock <= 0">
          该课程名额已满
        </text>
      </view>
      
      <!-- 课程详情 -->
      <view class="detail-section card">
        <view class="section-title">
          <text class="title-text">课程详情</text>
        </view>
        
        <view class="section-content">
          <text class="course-description">{{ courseDetail.courseDesc || '暂无课程描述' }}</text>
        </view>
      </view>
      
      <!-- 教师简介 -->
      <view class="teacher-section card">
        <view class="section-title">
          <text class="title-text">教师简介</text>
        </view>
        
        <view class="section-content">
          <text class="teacher-description">{{ courseDetail.teacherDesc || '暂无教师简介' }}</text>
        </view>
      </view>
      
      <!-- 课程评价 -->
      <view class="reviews-section card">
        <view class="section-title">
          <text class="title-text">学生评价</text>
        </view>
        
        <view class="section-content">
          <view v-if="reviews.length === 0" class="empty-reviews">
            <text>暂无学生评价</text>
          </view>
          
          <view v-else class="review-list">
            <view class="review-item" v-for="(review, index) in reviews" :key="index">
              <view class="review-header">
                <view class="reviewer-info">
                  <image class="reviewer-avatar" :src="review.avatar" mode="aspectFill"></image>
                  <text class="reviewer-name">{{ review.username }}</text>
                </view>
                <view class="review-rating">
                  <text class="iconfont icon-star" v-for="n in 5" :key="n" :class="{ 'active': n <= review.rating }"></text>
                </view>
              </view>
              
              <view class="review-content">
                <text>{{ review.content }}</text>
              </view>
              
              <view class="review-time">
                <text>{{ review.time }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { API_BASE_URL } from '@/config'

export default {
  components: {
  },
  data() {
    return {
      courseId: '',
      term: '',
      formattedTerm: '3-1', // 添加格式化后的学期字段
      courseDetail: {},
      reviews: [],
      isLoading: true,
      isAppEnvironment: false, // 添加APP环境标识
      baseUrl: API_BASE_URL, // 添加基础URL
      retryAttempts: 0, // 添加重试计数
      maxRetries: 2 // 最大重试次数
    }
  },
  onLoad(options) {
    // 检测是否为APP环境
    // #ifdef APP-PLUS
    this.isAppEnvironment = true;
    console.log('当前在APP环境中');
    // #endif
    
    if (options.id) {
      this.courseId = options.id;
      // 格式化学期参数
      this.term = options.term || '';
      this.formattedTerm = this.formatTerm(this.term);
      console.log('课程ID:', this.courseId, '学期:', this.term, '格式化后学期:', this.formattedTerm);
      this.fetchCourseDetailWithRetry();
    } else {
      uni.showToast({
        title: '课程ID不存在',
        icon: 'none'
      })
      setTimeout(() => {
        this.goBack()
      }, 1500)
    }
  },
  methods: {
    // 学期参数格式化函数
    formatTerm(term) {
      if (!term) return '3-1'; // 默认值
      
      // 确保是字符串格式
      const termStr = String(term).trim();
      
      // 清理可能导致问题的特殊字符
      const cleanTerm = termStr.replace(/[^\u4e00-\u9fa5\d-上下学期]/g, '');
      
      // 检查格式是否正确
      if (/^\d+-\d+$/.test(cleanTerm)) {
        return cleanTerm; // 已经是正确格式
      }
      
      // 尝试从字符串中提取数字
      const numMatch = cleanTerm.match(/\d+/);
      if (numMatch) {
        return `${numMatch[0]}-1`; // 提取第一个数字，默认第一学期
      }
      
      return '3-1'; // 默认值
    },
    
    // 获取课程详情(带重试机制)
    fetchCourseDetailWithRetry() {
      this.isLoading = true;
      
      // 获取token
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/login/index'
          });
        }, 1500);
        return;
      }
      
      // 准备请求参数和请求头
      const requestData = {
        term: this.formattedTerm,
        token: token // 在APP环境下确保token也在参数中
      };
      
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': token,
        'X-Token': token
      };
      
      console.log('请求课程详情，参数:', requestData);
      
      // 调用API获取课程详情(使用完整URL)
      uni.request({
        url: `${this.baseUrl}/student/course/${this.courseId}`,
        method: 'GET',
        data: requestData,
        header: headers,
        success: (res) => {
          if (res.statusCode === 200 && res.data.status === 0) {
            console.log('获取课程详情成功:', res.data.data);
            this.courseDetail = res.data.data || {};
            // 保存学期信息，确保退课时使用
            if (!this.courseDetail.term && this.formattedTerm) {
              this.courseDetail.term = this.formattedTerm;
            }
            // 模拟加载评价数据
            this.loadMockReviews();
            // 重置重试计数
            this.retryAttempts = 0;
          } else {
            console.error('获取课程详情失败:', res.data);
            // 检查是否是登录错误
            const errorMsg = res.data?.msg || '获取课程详情失败';
            if (errorMsg.includes('请先登录') || errorMsg.includes('登录过期')) {
              uni.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none',
                duration: 2000
              });
              
              setTimeout(() => {
                uni.navigateTo({
                  url: '/pages/login/index'
                });
              }, 1500);
              return;
            }
            
            uni.showToast({
              title: errorMsg,
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('请求课程详情失败:', err);
          
          // 在APP环境下进行重试
          if (this.isAppEnvironment && this.retryAttempts < this.maxRetries) {
            this.retryAttempts++;
            console.log(`请求失败，第${this.retryAttempts}次重试...`);
            setTimeout(() => {
              this.fetchCourseDetailWithRetry();
            }, 1000 * this.retryAttempts);
            return;
          }
          
          uni.showToast({
            title: this.isAppEnvironment ? 
                  '网络连接不稳定，请检查网络设置' : 
                  '网络错误，请检查连接',
            icon: 'none',
            duration: 3000
          });
        },
        complete: () => {
          // 只有在最后一次重试或成功时才更新加载状态
          if (!this.isAppEnvironment || this.retryAttempts >= this.maxRetries) {
            this.isLoading = false;
          }
        }
      });
    },
    
    // 处理课程操作(选课/退课)
    handleCourseAction() {
      if (this.courseDetail.status === '1') {
        // 已选课程，执行退课操作
        this.cancelCourse();
      } else {
        // 未选课程，执行选课操作
        this.chooseCourse();
      }
    },
    
    // 选课操作
    chooseCourse() {
      if (this.courseDetail.stock <= 0) {
        uni.showToast({
          title: '该课程已无剩余名额',
          icon: 'none'
        });
        return;
      }
      
      uni.showLoading({
        title: '正在选课...'
      });
      
      const token = uni.getStorageSync('token');
      
      // 准备请求参数
      const requestData = {
        courseId: this.courseId,
        term: this.formattedTerm,
        token: token
      };
      
      const headers = {
        'Authorization': token,
        'X-Token': token,
        'Content-Type': 'application/x-www-form-urlencoded'
      };
      
      uni.request({
        url: `${this.baseUrl}/student/course`,
        method: 'POST',
        data: requestData,
        header: headers,
        success: (res) => {
          uni.hideLoading();
          
          if (res.statusCode === 200 && res.data.status === 0) {
            uni.showToast({
              title: '选课成功',
              icon: 'success'
            });
            
            // 更新课程状态
            this.retryAttempts = 0; // 重置重试计数
            this.fetchCourseDetailWithRetry();
          } else {
            const errorMsg = res.data?.msg || '选课失败';
            // 检查是否是登录错误
            if (errorMsg.includes('请先登录') || errorMsg.includes('登录过期')) {
              uni.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none',
                duration: 2000
              });
              
              setTimeout(() => {
                uni.navigateTo({
                  url: '/pages/login/index'
                });
              }, 1500);
              return;
            }
            
            uni.showToast({
              title: errorMsg,
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          uni.hideLoading();
          console.error('选课请求失败:', err);
          
          // 在APP环境下提供更友好的错误提示
          let errorMsg = '网络错误，请重试';
          if (this.isAppEnvironment) {
            if (err.errMsg && err.errMsg.includes('timeout')) {
              errorMsg = '网络连接超时，请检查网络设置';
            } else if (err.errMsg && err.errMsg.includes('connection')) {
              errorMsg = '无法连接到服务器，请检查网络连接';
            }
          }
          
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 3000
          });
        }
      });
    },
    
    // 退课操作
    cancelCourse() {
      uni.showModal({
        title: '确认退课',
        content: `确定要退选 "${this.courseDetail.courseName}" 吗？`,
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '正在退课...'
            });
            
            const token = uni.getStorageSync('token');
            // 确保courseId为整数
            const courseId = parseInt(this.courseId, 10);
            
            // 使用保存的或格式化的学期参数
            const termToUse = this.courseDetail.term || this.formattedTerm;
            
            console.log('退课ID:', courseId, '类型:', typeof courseId);
            console.log('课程学期:', termToUse);
            
            // 准备请求参数
            const requestData = {
              term: termToUse,
              token: token
            };
            
            const headers = {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': token,
              'X-Token': token
            };
            
            uni.request({
              url: `${this.baseUrl}/student/course/${courseId}`,
              method: 'DELETE',
              data: requestData,
              header: headers,
              success: (res) => {
                uni.hideLoading();
                
                if (res.statusCode === 200 && res.data.status === 0) {
                  uni.showToast({
                    title: '退课成功',
                    icon: 'success'
                  });
                  
                  // 更新课程状态
                  this.retryAttempts = 0; // 重置重试计数
                  this.fetchCourseDetailWithRetry();
                } else {
                  // 处理错误情况
                  const errorMsg = res.data?.msg || '退课失败';
                  console.error('退课失败:', errorMsg);
                  
                  // 检查是否是登录错误
                  if (errorMsg.includes('请先登录') || errorMsg.includes('登录过期')) {
                    uni.showToast({
                      title: '登录已过期，请重新登录',
                      icon: 'none',
                      duration: 2000
                    });
                    
                    setTimeout(() => {
                      uni.navigateTo({
                        url: '/pages/login/index'
                      });
                    }, 1500);
                  } else {
                    uni.showToast({
                      title: errorMsg,
                      icon: 'none'
                    });
                  }
                }
              },
              fail: (err) => {
                uni.hideLoading();
                console.error('退课请求失败:', err);
                
                // 在APP环境下提供更友好的错误提示
                let errorMsg = '网络错误，请重试';
                if (this.isAppEnvironment) {
                  if (err.errMsg && err.errMsg.includes('timeout')) {
                    errorMsg = '网络连接超时，请检查网络设置';
                  } else if (err.errMsg && err.errMsg.includes('connection')) {
                    errorMsg = '无法连接到服务器，请检查网络连接';
                  }
                }
                
                uni.showToast({
                  title: errorMsg,
                  icon: 'none',
                  duration: 3000
                });
              }
            });
          }
        }
      });
    },
    
    // 获取上课时间文本
    getScheduleText() {
      const { courseDay, courseTimes } = this.courseDetail;
      if (!courseDay || !courseTimes) return '时间待定';
      
      const dayMap = {
        '1': '周一',
        '2': '周二',
        '3': '周三',
        '4': '周四',
        '5': '周五',
        '6': '周六',
        '7': '周日'
      };
      
      const timeMap = {
        '1': '第1-2节',
        '2': '第3-4节',
        '3': '第5-6节',
        '4': '第7-8节',
        '5': '第9-10节'
      };
      
      const day = dayMap[courseDay] || '';
      const times = courseTimes.split(',').map(t => timeMap[t] || '').join('、');
      
      return day + ' ' + times;
    },
    
    // 模拟加载评价数据
    loadMockReviews() {
      // 因为没有评价相关的API，这里模拟一些评价数据
      // 实际项目中应该从后端获取评价数据
      this.reviews = [
        {
          username: '张同学',
          avatar: '/static/images/avatar1.png',
          rating: 5,
          content: '老师讲课非常生动，内容丰富，对平时作业的指导也很细致，对学生非常负责，总体来说是一门很棒的课程！',
          time: '2023-06-15'
        },
        {
          username: '李同学',
          avatar: '/static/images/avatar2.png',
          rating: 4,
          content: '课程内容充实，实践环节安排合理，能够学到很多实用的知识，推荐选修。',
          time: '2023-05-20'
        },
        {
          username: '王同学',
          avatar: '/static/images/avatar3.png',
          rating: 5,
          content: '这门课的难度适中，老师上课方式很新颖，能够调动全班的积极性，课堂氛围很好。',
          time: '2023-04-10'
        }
      ];
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    }
  }
};
</script>

<style lang="scss">
.detail-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.header {
  position: relative;
  padding-top: var(--status-bar-height);
  padding-bottom: 50rpx;
  overflow: hidden;
  
  .back-button {
    position: absolute;
    top: calc(var(--status-bar-height) + 20rpx);
    left: 30rpx;
    z-index: 10;
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10rpx);
    border-radius: 50%;
    
    .icon-back {
      font-size: 36rpx;
      color: #fff;
    }
  }
  
  .course-card {
    margin: 100rpx 30rpx 0;
    padding: 30rpx;
    background-color: #fff;
    border-radius: 20rpx;
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
    
    .course-header {
      margin-bottom: 30rpx;
      
      .course-name {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 10rpx;
        display: block;
      }
      
      .course-type {
        display: inline-block;
        font-size: 24rpx;
        color: #666;
        background-color: #f5f7fa;
        padding: 4rpx 16rpx;
        border-radius: 16rpx;
      }
    }
    
    .course-info {
      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 16rpx;
        
        .iconfont {
          font-size: 30rpx;
          color: #4361ee;
          margin-right: 16rpx;
        }
        
        .info-text {
          font-size: 28rpx;
          color: #666;
        }
      }
    }
    
    .course-stats {
      display: flex;
      justify-content: space-between;
      margin-top: 30rpx;
      padding-top: 30rpx;
      border-top: 1rpx solid #f0f0f0;
      
      .stats-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .stats-label {
          font-size: 24rpx;
          color: #999;
          margin-bottom: 10rpx;
        }
        
        .stats-value {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
        }
      }
    }
  }
}

.content {
  flex: 1;
  padding: 30rpx;
  margin-top: -30rpx;
  
  .action-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30rpx;
    
    .action-button {
      width: 100%;
      height: 90rpx;
      line-height: 90rpx;
      text-align: center;
      background-color: #4361ee;
      color: #fff;
      font-size: 32rpx;
      font-weight: bold;
      border-radius: 45rpx;
      box-shadow: 0 10rpx 20rpx rgba(67, 97, 238, 0.3);
      transition: all 0.3s;
      
      &.cancel {
        background-color: #ff4d4f;
        box-shadow: 0 10rpx 20rpx rgba(255, 77, 79, 0.3);
      }
      
      &.disabled {
        background-color: #d9d9d9;
        color: rgba(0, 0, 0, 0.25);
        box-shadow: none;
      }
    }
    
    .action-tip {
      font-size: 24rpx;
      color: #ff4d4f;
      margin-top: 10rpx;
    }
  }
  
  .card {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  }
  
  .section-title {
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 2rpx solid #f0f0f0;
    
    .title-text {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      position: relative;
      padding-left: 20rpx;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 8rpx;
        height: 30rpx;
        background-color: #4361ee;
        border-radius: 4rpx;
      }
    }
  }
  
  .section-content {
    .course-description, .teacher-description {
      font-size: 28rpx;
      color: #666;
      line-height: 1.8;
    }
  }
  
  .reviews-section {
    .empty-reviews {
      display: flex;
      justify-content: center;
      padding: 40rpx 0;
      
      text {
        font-size: 28rpx;
        color: #999;
      }
    }
    
    .review-list {
      .review-item {
        padding: 20rpx 0;
        border-bottom: 2rpx solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16rpx;
          
          .reviewer-info {
            display: flex;
            align-items: center;
            
            .reviewer-avatar {
              width: 60rpx;
              height: 60rpx;
              border-radius: 50%;
              margin-right: 16rpx;
            }
            
            .reviewer-name {
              font-size: 28rpx;
              color: #333;
            }
          }
          
          .review-rating {
            .icon-star {
              font-size: 24rpx;
              color: #ddd;
              margin-left: 4rpx;
              
              &.active {
                color: #ffb800;
              }
            }
          }
        }
        
        .review-content {
          font-size: 28rpx;
          color: #333;
          line-height: 1.6;
          margin-bottom: 16rpx;
        }
        
        .review-time {
          text {
            font-size: 24rpx;
            color: #999;
          }
        }
      }
    }
  }
}
</style> 
