<template>
  <view class="course-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="nav-back" @tap="goBack">
          <image class="icon-svg" src="/static/images/icon-back.svg" mode="aspectFit"></image>
        </view>
        <text class="page-title">课程管理</text>
        <view class="header-actions">
          <text class="iconfont icon-search" @tap="showSearch"></text>
        </view>
      </view>
    </view>

    <!-- 搜索面板 -->
    <view class="search-panel" v-if="isSearchVisible">
      <view class="search-header">
        <text class="title">搜索课程</text>
        <text class="close-btn" @tap="hideSearch">×</text>
      </view>
      <view class="search-input">
        <text class="iconfont icon-search"></text>
        <input 
          type="text" 
          placeholder="输入课程名称" 
          v-model="searchKey"
          confirm-type="search"
          @confirm="performSearch"
          focus
        />
        <text class="clear-btn" v-if="searchKey" @tap="clearSearch">×</text>
      </view>
      <view class="search-btn" @tap="performSearch">搜索</view>
    </view>

    <!-- 搜索结果提示 -->
    <view class="search-result-tip" v-if="searchKey && !isSearchVisible">
      <text>搜索：{{searchKey}}</text>
      <text class="clear-search" @tap="clearSearch">清除</text>
    </view>

    <!-- 过滤选项卡 -->
    <view class="filter-tabs">
      <view 
        class="tab-item" 
        v-for="(tab, index) in filterTabs" 
        :key="index" 
        :class="{ active: currentTab === index }"
        @tap="switchTab(index)"
      >
        <text>{{tab}}</text>
        <view class="tab-line" v-if="currentTab === index"></view>
      </view>
    </view>

    <!-- 课程列表 -->
    <view class="course-list" v-if="filteredCourses.length > 0">
      <view 
        class="course-card" 
        v-for="(course, index) in filteredCourses" 
        :key="index" 
        @tap="navigateToCourseDetail(course)"
        :animation="getCardAnimation(index)"
      >
        <view class="card-pattern" :class="'pattern-' + (index % 4 + 1)"></view>
        
        <view class="course-tag" :class="getTypeClass(course.courseType)">
          {{course.courseType}}
        </view>
        
        <view class="course-header">
          <text class="course-name">{{course.courseName}}</text>
          <text class="course-id">{{course.courseId}}</text>
        </view>
        
        <view class="course-info">
          <view class="info-item">
            <text class="iconfont icon-major"></text>
            <text class="info-text">{{course.majorName}}</text>
          </view>
          
          <view class="info-item">
            <text class="iconfont icon-time"></text>
            <text class="info-text">{{course.address}}</text>
          </view>
          
          <view class="info-item">
            <text class="iconfont icon-grade"></text>
            <text class="info-text">{{course.courseScore}}学分</text>
          </view>
        </view>
        
        <view class="course-footer">
          <view class="student-stat">
            <text class="stat-count">{{course.number}}</text>
            <text class="stat-label">学生人数</text>
          </view>
          
          <view class="grade-action" @tap.stop="navigateToGrade(course)">
            <text class="grade-btn">成绩录入</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="filteredCourses.length === 0 && !isLoading">
      <image src="/static/images/empty-courses.png" mode="aspectFit" class="empty-icon"></image>
      <text class="empty-text">{{getEmptyText()}}</text>
      <text class="empty-desc">{{getEmptyDesc()}}</text>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-if="isLoading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 悬浮按钮 -->
    <view class="floating-btn" @tap="showFilter">
      <text class="iconfont icon-filter"></text>
    </view>
  </view>
</template>

<script>
import { getTeacherCourses } from '@/api/course/index.js';

export default {
  data() {
    return {
      courseList: [],
      filterTabs: ['全部课程', '本学期', '已结课'],
      currentTab: 0,
      cardAnimations: [],
      isLoading: true,
      sortType: 'default', // 默认排序类型
      sortOrder: 'asc', // 默认排序顺序
      searchKey: '', // 搜索关键词
      isSearchVisible: false // 搜索面板是否可见
    }
  },
  computed: {
    filteredCourses() {
      // 首先根据当前选中的标签筛选课程
      let result = []
      if (this.currentTab === 0) {
        result = [...this.courseList]
      } else if (this.currentTab === 1) {
        // 假设本学期课程包括2023级的课程
        result = this.courseList.filter(course => course.term && course.term.includes('2023'))
      } else {
        // 假设已结课的课程包括2022级及以前的课程
        result = this.courseList.filter(course => course.term && course.term.includes('2022'))
      }
      
      // 根据搜索关键词筛选
      if (this.searchKey) {
        const key = this.searchKey.toLowerCase().trim()
        result = result.filter(course => {
          const courseName = (course.courseName || '').toLowerCase()
          const courseId = String(course.courseId || '').toLowerCase()
          
          // 支持罗马数字和其他特殊字符的搜索
          // 处理罗马数字(I, V, X)等特殊情况
          const normalizedKey = key.replace(/v/gi, '[vｖⅤⅴ]')
                                  .replace(/i/gi, '[iｉⅠⅰ]')
                                  .replace(/x/gi, '[xｘⅩⅹ]')
          
          try {
            const regex = new RegExp(normalizedKey, 'i')
            return regex.test(courseName) || regex.test(courseId)
          } catch (e) {
            // 如果正则表达式无效，回退到普通包含搜索
            return courseName.includes(key) || courseId.includes(key)
          }
        })
      }
      
      // 然后根据排序类型和顺序进行排序
      return this.sortCourses(result)
    }
  },
  onLoad() {
    this.fetchCourses()
  },
  methods: {
    // 显示搜索面板
    showSearch() {
      this.isSearchVisible = true
    },
    
    // 隐藏搜索面板
    hideSearch() {
      this.isSearchVisible = false
    },
    
    // 执行搜索
    performSearch() {
      this.hideSearch()
      this.initCardAnimations()
    },
    
    // 清除搜索
    clearSearch() {
      this.searchKey = ''
      this.initCardAnimations()
    },
    
    // 根据类型和顺序排序课程
    sortCourses(courses) {
      const result = [...courses]
      
      switch (this.sortType) {
        case 'name': // 按课程名称排序
          result.sort((a, b) => {
            const nameA = a.courseName || ''
            const nameB = b.courseName || ''
            return this.sortOrder === 'asc' 
              ? nameA.localeCompare(nameB) 
              : nameB.localeCompare(nameA)
          })
          break
          
        case 'students': // 按学生人数排序
          result.sort((a, b) => {
            const numA = a.number || 0
            const numB = b.number || 0
            return this.sortOrder === 'asc' 
              ? numA - numB 
              : numB - numA
          })
          break
          
        case 'credit': // 按学分排序
          result.sort((a, b) => {
            const creditA = a.courseScore || 0
            const creditB = b.courseScore || 0
            return this.sortOrder === 'asc' 
              ? creditA - creditB 
              : creditB - creditA
          })
          break
          
        default: // 默认排序（不排序，保持原顺序）
          break
      }
      
      return result
    },
    
    // 获取空状态文本
    getEmptyText() {
      if (this.searchKey) {
        return '未找到匹配的课程'
      }
      return '暂无课程数据'
    },
    
    // 获取空状态描述
    getEmptyDesc() {
      if (this.searchKey) {
        return `没有找到包含"${this.searchKey}"的课程`
      }
      return '当前学期您暂无授课任务'
    },
    
    // 执行排序并显示提示
    applySorting(type) {
      // 如果点击的是当前排序类型，则切换排序顺序
      if (this.sortType === type) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        // 否则使用新的排序类型，并设置为升序
        this.sortType = type
        this.sortOrder = 'asc'
      }
      
      // 显示排序提示
      const orderText = this.sortOrder === 'asc' ? '升序' : '降序'
      let typeText = ''
      
      switch (type) {
        case 'name':
          typeText = '课程名称'
          break
        case 'students':
          typeText = '学生人数'
          break
        case 'credit':
          typeText = '学分'
          break
      }
      
      uni.showToast({
        title: `已按${typeText}${orderText}排列`,
        icon: 'none'
      })
      
      // 重新初始化卡片动画
      this.initCardAnimations()
    },
    
    goBack() {
      try {
        uni.reLaunch({
          url: '/pages/teacher/index'
        });
      } catch (error) {
        console.error('返回异常:', error);
        uni.reLaunch({
          url: '/pages/teacher/index'
        });
      }
    },
    switchTab(index) {
      this.currentTab = index
      this.initCardAnimations()
    },
    navigateToCourseDetail(course) {
      uni.navigateTo({
        url: `/pages/teacher/course-detail?id=${course.courseId}`
      })
    },
    navigateToGrade(course) {
      uni.navigateTo({
        url: `/pages/teacher/grade?courseId=${course.courseId}&courseName=${course.courseName}`
      })
    },
    fetchCourses() {
      this.isLoading = true
      
      // 获取token
      const token = uni.getStorageSync('token')
      
      if (!token) {
        console.error('未找到登录token，请先登录')
        uni.showModal({
          title: '提示',
          content: '您尚未登录或登录已过期，请重新登录',
          showCancel: false,
          success: function(res) {
            if (res.confirm) {
              uni.reLaunch({
                url: '/pages/login/index'
              })
            }
          }
        })
        this.isLoading = false
        return
      }
      
      console.log('开始获取教师课程列表，token:', token)
      
      // 调用API获取教师课程
      getTeacherCourses()
        .then(res => {
          console.log('获取教师课程响应:', res)
          
          if (res.status === 0 && res.data) {
            // 处理课程数据
            this.courseList = res.data.map(course => ({
              courseId: course.courseId || '',
              courseName: course.courseName || '',
              courseType: course.courseType || '选修课',
              majorName: course.majorName || '未知专业',
              courseScore: course.courseScore || 0,
              address: course.courseRoom || '未安排教室',
              term: course.term || '',
              number: course.number || 0
            }))
            
            console.log('课程数据处理完成:', this.courseList)
          } else if (res.status === 1 && res.msg === '登录过期了，请重新登录') {
            console.error('登录已过期')
            
            // 清除过期token
            uni.removeStorageSync('token')
            
            // 提示用户重新登录
            uni.showModal({
              title: '提示',
              content: '登录信息已过期，请重新登录',
              showCancel: false,
              success: function(res) {
                if (res.confirm) {
                  uni.reLaunch({
                    url: '/pages/login/index'
                  })
                }
              }
            })
          } else {
            console.error('获取课程列表失败:', res)
            uni.showToast({
              title: '获取课程数据失败',
              icon: 'none'
            })
          }
        })
        .catch(err => {
          console.error('获取课程列表请求异常:', err)
          uni.showToast({
            title: '网络错误，请稍后再试',
            icon: 'none'
          })
        })
        .finally(() => {
          this.isLoading = false
          this.initCardAnimations()
        })
    },
    showFilter() {
      uni.showActionSheet({
        itemList: ['按课程名称排序', '按学生人数排序', '按学分排序', '恢复默认排序'],
        success: (res) => {
          switch(res.tapIndex) {
            case 0: // 按课程名称排序
              this.applySorting('name')
              break
            case 1: // 按学生人数排序
              this.applySorting('students')
              break
            case 2: // 按学分排序
              this.applySorting('credit')
              break
            case 3: // 恢复默认排序
              this.sortType = 'default'
              this.sortOrder = 'asc'
              uni.showToast({
                title: '已恢复默认排序',
                icon: 'none'
              })
              this.initCardAnimations()
              break
          }
        }
      })
    },
    getTypeClass(type) {
      return type === '必修课' ? 'tag-required' : 'tag-elective'
    },
    initCardAnimations() {
      this.cardAnimations = []
      setTimeout(() => {
        this.filteredCourses.forEach((_, index) => {
          let animation = uni.createAnimation({
            duration: 300,
            timingFunction: 'ease',
            delay: index * 100
          })
          
          animation.opacity(1).translateY(0).step()
          this.cardAnimations[index] = animation.export()
        })
      }, 100)
    },
    getCardAnimation(index) {
      return this.cardAnimations[index]
    }
  }
}
</script>

<style lang="scss">
/* SVG图标样式 */
.icon-svg {
  width: 40rpx;
  height: 40rpx;
  fill: currentColor;
  color: currentColor;
}

/* 使用Unicode字符替代图标 */
.icon-back:before { content: '\2190'; } /* 左箭头 ← */
.icon-search:before { content: '\1F50D'; } /* 放大镜 🔍 */
.icon-filter:before { content: '\2699'; } /* 齿轮 ⚙ */
.icon-major:before { content: '\1F393'; } /* 毕业帽 🎓 */
.icon-time:before { content: '\23F0'; } /* 闹钟 ⏰ */
.icon-grade:before { content: '\1F4CA'; } /* 图表 📊 */

/* 通用图标样式 */
.iconfont {
  font-family: sans-serif;
  font-style: normal;
}

.course-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.header {
  height: 240rpx;
  position: relative;
  overflow: hidden;
  
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #1890ff, #722ed1);
    z-index: 1;
  }
  
  .header-content {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 60rpx 30rpx 0;
    height: 88rpx;
    width: 100%;
    box-sizing: border-box;
    
    .nav-back {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      transition: background-color 0.2s;
      
      &:active {
        background-color: rgba(255, 255, 255, 0.2);
      }
      
      .icon-svg {
        width: 40rpx;
        height: 40rpx;
        color: #ffffff;
      }
    }
    
    .page-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #ffffff;
    }
    
    .header-actions {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      
      .icon-search {
        font-size: 40rpx;
        color: #ffffff;
      }
    }
  }
}

/* 搜索面板样式 */
.search-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  z-index: 100;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  
  .search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333333;
    }
    
    .close-btn {
      font-size: 48rpx;
      color: #999999;
      padding: 10rpx;
    }
  }
  
  .search-input {
    position: relative;
    margin-bottom: 30rpx;
    
    input {
      width: 100%;
      height: 88rpx;
      background-color: #f5f5f5;
      border-radius: 44rpx;
      padding: 0 88rpx;
      font-size: 28rpx;
      color: #333333;
    }
    
    .icon-search {
      position: absolute;
      top: 50%;
      left: 30rpx;
      transform: translateY(-50%);
      font-size: 36rpx;
      color: #999999;
    }
    
    .clear-btn {
      position: absolute;
      top: 50%;
      right: 30rpx;
      transform: translateY(-50%);
      font-size: 36rpx;
      color: #999999;
      width: 48rpx;
      height: 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .search-btn {
    height: 88rpx;
    background-color: #1890ff;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: bold;
  }
}

/* 搜索结果提示样式 */
.search-result-tip {
  background-color: #f0f9ff;
  padding: 16rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  text {
    font-size: 26rpx;
    color: #1890ff;
  }
  
  .clear-search {
    padding: 6rpx 20rpx;
    background-color: rgba(24, 144, 255, 0.1);
    border-radius: 30rpx;
  }
}

.filter-tabs {
  background-color: #ffffff;
  display: flex;
  justify-content: space-around;
  height: 100rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    
    text {
      font-size: 28rpx;
      color: #666666;
      transition: all 0.3s;
    }
    
    &.active {
      text {
        color: #1890ff;
        font-weight: bold;
      }
      
      .tab-line {
        position: absolute;
        bottom: 0;
        width: 40rpx;
        height: 4rpx;
        background-color: #1890ff;
        border-radius: 2rpx;
      }
    }
  }
}

.course-list {
  padding: 40rpx 30rpx;
  width: 100%;
  box-sizing: border-box;
  
  .course-card {
    position: relative;
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.05);
    overflow: hidden;
    opacity: 0;
    transform: translateY(30rpx);
    width: 100%;
    box-sizing: border-box;
    
    .card-pattern {
      position: absolute;
      top: 0;
      right: 0;
      width: 180rpx;
      height: 180rpx;
      opacity: 0.04;
      transform: rotate(30deg) translate(40rpx, -100rpx);
      
      &.pattern-1 {
        background: linear-gradient(45deg, transparent 25%, #1890ff 25%, #1890ff 50%, transparent 50%, transparent 75%, #1890ff 75%);
        background-size: 20rpx 20rpx;
      }
      
      &.pattern-2 {
        background: linear-gradient(45deg, transparent 25%, #52c41a 25%, #52c41a 50%, transparent 50%, transparent 75%, #52c41a 75%);
        background-size: 20rpx 20rpx;
      }
      
      &.pattern-3 {
        background: linear-gradient(45deg, transparent 25%, #faad14 25%, #faad14 50%, transparent 50%, transparent 75%, #faad14 75%);
        background-size: 20rpx 20rpx;
      }
      
      &.pattern-4 {
        background: linear-gradient(45deg, transparent 25%, #722ed1 25%, #722ed1 50%, transparent 50%, transparent 75%, #722ed1 75%);
        background-size: 20rpx 20rpx;
      }
    }
    
    .course-tag {
      position: absolute;
      top: 0;
      right: 0;
      padding: 6rpx 30rpx;
      font-size: 22rpx;
      color: #ffffff;
      border-bottom-left-radius: 16rpx;
      
      &.tag-required {
        background-color: #1890ff;
      }
      
      &.tag-elective {
        background-color: #52c41a;
      }
    }
    
    .course-header {
      margin-bottom: 30rpx;
      
      .course-name {
        font-size: 36rpx;
        font-weight: bold;
        color: #333333;
        margin-bottom: 10rpx;
        display: block;
      }
      
      .course-id {
        font-size: 24rpx;
        color: #999999;
        display: block;
      }
    }
    
    .course-info {
      margin-bottom: 30rpx;
      
      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 16rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .iconfont {
          font-size: 30rpx;
          color: #1890ff;
          margin-right: 16rpx;
          width: 40rpx;
          text-align: center;
        }
        
        .info-text {
          font-size: 28rpx;
          color: #666666;
        }
      }
    }
    
    .course-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20rpx;
      border-top: 1rpx solid #f0f0f0;
      
      .student-stat {
        display: flex;
        flex-direction: column;
        
        .stat-count {
          font-size: 40rpx;
          font-weight: bold;
          color: #1890ff;
          line-height: 1;
          margin-bottom: 6rpx;
        }
        
        .stat-label {
          font-size: 24rpx;
          color: #999999;
        }
      }
      
      .grade-action {
        .grade-btn {
          background-color: rgba(24, 144, 255, 0.1);
          color: #1890ff;
          padding: 16rpx 40rpx;
          border-radius: 40rpx;
          font-size: 28rpx;
          font-weight: bold;
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  
  .empty-icon {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: 30rpx;
  }
  
  .empty-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 10rpx;
  }
  
  .empty-desc {
    font-size: 26rpx;
    color: #999999;
  }
}

.floating-btn {
  position: fixed;
  right: 40rpx;
  bottom: 100rpx;
  width: 100rpx;
  height: 100rpx;
  background-color: #1890ff;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(24, 144, 255, 0.3);
  
  .icon-filter {
    font-size: 50rpx;
    color: #ffffff;
  }
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  
  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 6rpx solid #f0f0f0;
    border-top: 6rpx solid #1890ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20rpx;
  }
  
  .loading-text {
    font-size: 28rpx;
    color: #999999;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}
</style> 