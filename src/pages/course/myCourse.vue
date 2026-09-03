<template>
  <view class="my-course-container">
    <view class="header blue-gradient-bg">
      <text class="page-title">我的课程</text>
      <!-- 气泡背景 -->
      <bubbles></bubbles>
    </view>
    
    <view class="content">
      <!-- 学期选择器 -->
      <view class="term-selector card">
        <text class="section-title">学期选择</text>
        <scroll-view class="term-list" scroll-x="true" show-scrollbar="false">
          <view 
            class="term-item" 
            v-for="item in termList" 
            :key="item.value"
            :class="{ active: currentTerm === item.value }"
            @tap="selectTerm(item.value)"
          >
            <text class="term-name">{{ item.label }}</text>
          </view>
        </scroll-view>
      </view>
      
      <!-- 课程列表 -->
      <view class="course-list-section">
        <!-- 加载中状态 -->
        <view class="loading-state" v-if="isLoading">
          <view class="loading-icon"></view>
          <text class="loading-text">数据加载中...</text>
        </view>
        
        <!-- 空状态 -->
        <view class="empty-state" v-else-if="myCourses.length === 0">
          <image class="empty-icon" src="/static/images/empty-courses.png" mode="aspectFit"></image>
          <text class="empty-text">当前学期暂无已选课程</text>
          <button class="go-select-button" @tap="goToTermSelection">去选课</button>
        </view>
        
        <!-- 课程列表 -->
        <view class="course-list" v-else>
          <view class="course-card card" v-for="course in myCourses" :key="course.id" @tap="viewCourseDetail(course)">
            <view class="course-header">
              <text class="course-name">{{ course.courseName }}</text>
              <view class="course-type">{{ course.courseType }}</view>
            </view>
            
            <view class="course-info">
              <view class="info-row">
                <view class="info-item">
                  <text class="iconfont icon-teacher"></text>
                  <text class="info-text">{{ course.teacherName }}</text>
                </view>
                
                <view class="info-item">
                  <text class="iconfont icon-score"></text>
                  <text class="info-text">{{ course.courseScore }}学分</text>
                </view>
              </view>
              
              <view class="info-row">
                <view class="info-item">
                  <text class="iconfont icon-time"></text>
                  <text class="info-text">{{ getScheduleText(course) }}</text>
                </view>
              </view>
              
              <view class="info-row">
                <view class="info-item">
                  <text class="iconfont icon-location"></text>
                  <text class="info-text">{{ course.address || '地点待定' }}</text>
                </view>
              </view>
            </view>
            
            <view class="course-footer">
              <button class="action-button cancel" @tap.stop="cancelCourse(course)">退选课程</button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Bubbles from '@/components/Bubbles.vue'

import { API_BASE_URL } from '@/config'

export default {
  components: {
    Bubbles
  },
  data() {
    return {
      termList: [
        { label: '大四下学期', value: '4-2' },
        { label: '大四上学期', value: '4-1' },
        { label: '大三下学期', value: '3-2' },
        { label: '大三上学期', value: '3-1' },
        { label: '大二下学期', value: '2-2' },
        { label: '大二上学期', value: '2-1' },
        { label: '大一下学期', value: '1-2' },
        { label: '大一上学期', value: '1-1' }
      ],
      currentTerm: '3-2',
      myCourses: [],
      isLoading: false
    }
  },
  onLoad() {
    this.fetchMyCourses()
  },
  onShow() {
    // 当页面显示时重新获取数据，以便在选/退课后更新列表
    this.fetchMyCourses()
  },
  methods: {
    // 切换学期
    selectTerm(term) {
      if (this.currentTerm !== term) {
        this.currentTerm = term
        this.fetchMyCourses()
      }
    },
    
    // 获取课程时间描述
    getScheduleText(course) {
      const { courseDay, courseTimes } = course
      if (!courseDay || !courseTimes) return '时间待定'
      
      const dayMap = {
        '1': '周一',
        '2': '周二',
        '3': '周三',
        '4': '周四',
        '5': '周五',
        '6': '周六',
        '7': '周日'
      }
      
      const timeMap = {
        '1': '第1-2节',
        '2': '第3-4节',
        '3': '第5-6节',
        '4': '第7-8节',
        '5': '第9-10节'
      }
      
      const day = dayMap[courseDay] || ''
      const times = courseTimes.split(',').map(t => timeMap[t] || '').join('、')
      
      return day + ' ' + times
    },
    
    // 获取我的课程列表
    fetchMyCourses() {
      this.isLoading = true
      
      // 获取token
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/login/index'
          })
        }, 1500)
        return
      }
      
      // 调用API获取我的课程列表
      uni.request({
        url: '/api/student/my-courses',
        method: 'GET',
        data: {
          term: this.currentTerm
        },
        header: {
          'Authorization': token
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.status === 0) {
            console.log('获取我的课程成功:', res.data.data)
            this.myCourses = res.data.data || []
          } else {
            console.error('获取我的课程失败:', res.data)
            uni.showToast({
              title: res.data.msg || '获取课程列表失败',
              icon: 'none'
            })
          }
        },
        fail: (err) => {
          console.error('请求我的课程失败:', err)
          uni.showToast({
            title: '网络错误，请检查连接',
            icon: 'none'
          })
        },
        complete: () => {
          this.isLoading = false
        }
      })
    },
    
    // 查看课程详情
    viewCourseDetail(course) {
      uni.navigateTo({
        url: `/pages/course/detail?id=${course.courseId}&term=${this.currentTerm}`
      })
    },
    
    // 退选课程
    cancelCourse(course) {
      uni.showModal({
        title: '确认退课',
        content: `确定要退选 "${course.courseName}" 吗？`,
        success: (res) => {
          if (res.confirm) {
            this.performCancelCourse(course.id)
          }
        }
      })
    },
    
    // 执行退课操作
    performCancelCourse(courseId) {
      uni.showLoading({
        title: '正在退课...'
      })
      
      const token = uni.getStorageSync('token')
      // 确保courseId为整数
      const parsedCourseId = parseInt(courseId, 10)
      
      if (isNaN(parsedCourseId) || parsedCourseId <= 0) {
        uni.hideLoading()
        console.error('无效的课程ID:', courseId)
        uni.showToast({
          title: '无效的课程ID',
          icon: 'none'
        })
        return
      }
      
      console.log('退课ID:', parsedCourseId, '类型:', typeof parsedCourseId)
      console.log('学期:', this.currentTerm || '3-1')
      
      uni.request({
        url: `${API_BASE_URL}/student/course/${parsedCourseId}`,
        method: 'DELETE',
        data: {
          term: this.currentTerm || '3-1',
          token: token
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': token
        },
        success: (res) => {
          uni.hideLoading()
          
          if (res.statusCode === 200 && res.data.status === 0) {
            uni.showToast({
              title: '退课成功',
              icon: 'success'
            })
            
            // 重新获取课程列表
            this.fetchMyCourses()
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
          uni.hideLoading()
          console.error('退课请求失败:', err)
          uni.showToast({
            title: '网络错误，请重试',
            icon: 'none'
          })
        }
      })
    },
    
    // 前往选课页面
    goToTermSelection() {
      uni.switchTab({
        url: '/pages/course/term'
      })
    }
  }
}
</script>

<style lang="scss">
.my-course-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.blue-gradient-bg {
  background: linear-gradient(135deg, #4361ee, #3f37c9);
}

.header {
  position: relative;
  padding-top: var(--status-bar-height);
  padding-bottom: 60rpx;
  overflow: hidden;
  
  .page-title {
    position: relative;
    z-index: 1;
    font-size: 44rpx;
    font-weight: bold;
    color: #fff;
    padding: 40rpx 30rpx 0;
    display: block;
  }
}

.content {
  flex: 1;
  padding: 0 30rpx;
  margin-top: -30rpx;
}

.card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.term-selector {
  .term-list {
    white-space: nowrap;
    
    .term-item {
      display: inline-block;
      padding: 16rpx 30rpx;
      margin-right: 20rpx;
      background-color: #f5f7fa;
      border-radius: 40rpx;
      
      &.active {
        background-color: #4361ee;
        
        .term-name {
          color: #fff;
        }
      }
      
      .term-name {
        font-size: 26rpx;
        color: #666;
      }
    }
  }
}

.course-list-section {
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    
    .loading-icon {
      width: 60rpx;
      height: 60rpx;
      border: 6rpx solid #f3f3f3;
      border-top: 6rpx solid #4361ee;
      border-radius: 50%;
      animation: spin 1.5s ease-in-out infinite;
      margin-bottom: 20rpx;
    }
    
    .loading-text {
      font-size: 28rpx;
      color: #999;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    
    .empty-icon {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 30rpx;
    }
    
    .empty-text {
      font-size: 28rpx;
      color: #999;
      margin-bottom: 40rpx;
    }
    
    .go-select-button {
      background-color: #4361ee;
      color: #fff;
      font-size: 28rpx;
      padding: 16rpx 40rpx;
      border-radius: 40rpx;
      box-shadow: 0 10rpx 20rpx rgba(67, 97, 238, 0.3);
    }
  }
  
  .course-list {
    .course-card {
      .course-header {
        margin-bottom: 20rpx;
        
        .course-name {
          font-size: 32rpx;
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
        .info-row {
          display: flex;
          margin-bottom: 16rpx;
          
          .info-item {
            display: flex;
            align-items: center;
            margin-right: 40rpx;
            
            .iconfont {
              font-size: 28rpx;
              color: #4361ee;
              margin-right: 12rpx;
            }
            
            .info-text {
              font-size: 26rpx;
              color: #666;
            }
          }
        }
      }
      
      .course-footer {
        display: flex;
        justify-content: flex-end;
        margin-top: 20rpx;
        
        .action-button {
          padding: 12rpx 30rpx;
          font-size: 26rpx;
          border-radius: 30rpx;
          background-color: #fff;
          
          &.cancel {
            color: #ff4d4f;
            border: 2rpx solid #ff4d4f;
          }
        }
      }
    }
  }
}
</style> 
