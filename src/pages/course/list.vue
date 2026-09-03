<template>
  <view class="course-container">
    <!-- 背景装饰元素 -->
    <view class="background-decoration">
      <view class="bg-gradient"></view>
      <view class="bg-wave"></view>
      <view class="bg-circle"></view>
    </view>

    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-button" @tap="navigateBack">
        <text class="back-icon">
          <image src="/static/images/icon-back.svg" mode="aspectFit"></image>
        </text>
      </view>
      <view class="header-title">选课列表</view>
      <view class="filter-button" @tap="toggleFilterPanel">
        <text class="filter-icon">
          <image src="/static/images/icon-filter.svg" mode="aspectFit"></image>
        </text>
      </view>
    </view>
    
    <!-- 添加布局提示标签 -->
    <view class="header-notice" v-if="isReady">
      <text class="notice-text">两列网格布局</text>
    </view>
    
    <!-- 学期信息 -->
    <view class="term-info-bar">
      <view class="term-info">
        <view class="term-tag">{{termName}}</view>
        <view class="term-status" :class="{'active': true}">选课中</view>
      </view>
    </view>
    
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-box">
        <view class="search-icon">
          <image src="/static/images/icon-search.svg" mode="aspectFit"></image>
        </view>
        <input 
          class="search-input" 
          type="text" 
          placeholder="搜索课程名称或教师"
          v-model="searchKeyword"
          @confirm="handleSearch"
        />
        <text 
          class="clear-icon" 
          v-if="searchKeyword" 
          @tap="clearSearch"
        >×</text>
      </view>
    </view>
    
    <!-- 筛选面板 -->
    <view class="filter-panel" v-if="showFilterPanel">
      <view class="filter-panel-header">
        <text class="filter-title">筛选条件</text>
        <text class="reset-button" @tap="resetFilters">重置</text>
      </view>
      
      <view class="filter-group">
        <text class="filter-group-title">课程类型</text>
        <view class="filter-tags">
          <view 
            class="filter-tag" 
            v-for="(type, index) in courseTypes" 
            :key="'type-'+index"
            :class="{'active': selectedType === type}"
            @tap="selectType(type)"
          >{{type}}</view>
        </view>
      </view>
      
      <view class="filter-group">
        <text class="filter-group-title">所属专业</text>
        <view class="filter-tags">
          <view 
            class="filter-tag" 
            v-for="(major, index) in majors" 
            :key="'major-'+index"
            :class="{'active': selectedMajor === major.id}"
            @tap="selectMajor(major.id)"
          >{{major.name}}</view>
        </view>
      </view>
      
      <view class="filter-buttons">
        <button class="cancel-button" @tap="toggleFilterPanel">取消</button>
        <button class="confirm-button" @tap="applyFilters">确定</button>
      </view>
    </view>
    
    <!-- 课程列表区域 -->
    <scroll-view 
      class="course-list" 
      scroll-y="true"
      @scrolltolower="loadMore"
    >
      <view v-if="loading" class="loading-box">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <block v-else>
        <view class="course-grid">
          <view 
            class="course-card" 
            v-for="(course, index) in filteredCourses" 
            :key="index"
            @tap="viewCourseDetail(course)"
          >
            <view class="course-header">
              <view class="course-type-tag" :class="getTypeClass(course.type)">{{course.type}}</view>
              <view class="course-stock" :class="{'low-stock': course.stock < 10}">
                剩余名额: {{course.stock}}
              </view>
            </view>
            
            <view class="course-body">
              <view class="course-info">
                <text class="course-name">{{course.name}}</text>
                <text class="course-teacher">{{course.teacher}}</text>
              </view>
              
              <view class="course-score">
                <text class="score-value">{{course.score}}</text>
                <text class="score-label">学分</text>
              </view>
            </view>
            
            <view class="course-footer">
              <view class="course-schedule">
                <view class="schedule-icon">
                  <image src="/static/images/icon-schedule.svg" mode="aspectFit"></image>
                </view>
                <text class="schedule-text">{{course.schedule}}</text>
              </view>
              
              <button 
                class="select-button" 
                :class="{'selected': course.selected, 'disabled': course.stock <= 0}"
                @tap.stop="toggleCourseSelection(course)"
              >
                {{ course.selected ? '退选' : '选课' }}
              </button>
            </view>
          </view>
        </view>
        
        <view v-if="filteredCourses.length === 0" class="empty-box">
          <text class="empty-text">暂无符合条件的课程</text>
        </view>
        
        <view v-if="!loading && hasMore" class="load-more">
          <text class="load-more-text" @tap="loadMore">点击加载更多</text>
        </view>
      </block>
    </scroll-view>
    
    <!-- 底部按钮区域 -->
    <view class="bottom-button-area">
      <view class="add-all-button">
        已加载全部课程
      </view>
    </view>
    
    <!-- 遮罩层 -->
    <view class="mask" v-if="showFilterPanel" @tap="toggleFilterPanel"></view>
  </view>
</template>

<script>
import { API_BASE_URL } from '@/config'

export default {
  data() {
    return {
      termId: '',
      termName: '',
      formattedTerm: '3-1', // 添加格式化后的学期字段
      searchKeyword: '',
      showFilterPanel: false,
      loading: false,
      hasMore: true,
      isReady: true,
      page: 1,
      pageSize: 10,
      isAppEnvironment: false, // 添加APP环境标识
      baseUrl: API_BASE_URL, // 添加基础URL
      retryAttempts: 0, // 添加重试计数
      maxRetries: 2, // 最大重试次数
      
      // 筛选数据
      courseTypes: ['创新创业类', '自然科学类', '公共艺术类', '限定艺术类'],
      selectedType: '',
      majors: [
        { id: 6, name: '信息安全' },
        { id: 7, name: '信息对抗' },
        { id: 8, name: '通信工程' },
        { id: 9, name: '物联网' },
        { id: 10, name: '电子信息工程' },
        { id: 11, name: '计算机科学与技术' }
      ],
      selectedMajor: '',
      
      // 课程数据
      courses: [
        {
          id: 1,
          name: '大学生创新创业指导',
          teacher: '张教授',
          score: 4,
          type: '创新创业类',
          major: 6,
          schedule: '星期三A101第7-8节{1-16周}',
          stock: 99,
          selected: false
        },
        {
          id: 2,
          name: '人体的奥秘',
          teacher: '王教授',
          score: 2,
          type: '自然科学类',
          major: 6,
          schedule: '星期四A102第5-6节{1-16周}',
          stock: 99,
          selected: false
        },
        {
          id: 3,
          name: '如何学好英语',
          teacher: '李教授',
          score: 1,
          type: '公共艺术类',
          major: 6,
          schedule: '星期一A103第7-8节{1-16周}',
          stock: 99,
          selected: false
        },
        {
          id: 4,
          name: '婚恋指导',
          teacher: '张教授',
          score: 2,
          type: '公共艺术类',
          major: 6,
          schedule: '星期二A104第3-4节{1-16周}',
          stock: 0,
          selected: false
        },
        {
          id: 5,
          name: '电影的艺术',
          teacher: '周教授',
          score: 1,
          type: '限定艺术类',
          major: 6,
          schedule: '星期三A105第7-8节{1-16周}',
          stock: 99,
          selected: false
        },
        {
          id: 8,
          name: '创业管理实战',
          teacher: '刘教授',
          score: 1,
          type: '创新创业类',
          major: 7,
          schedule: '星期一A108第7-8节{1-10周}',
          stock: 99,
          selected: false
        },
        {
          id: 10,
          name: '安全协议',
          teacher: '陈教授',
          score: 2,
          type: '自然科学类',
          major: 6,
          schedule: '星期五B114第7-8节{1-16周}',
          stock: 79,
          selected: false
        },
        {
          id: 12,
          name: '计算机病毒检测技术',
          teacher: '李教授',
          score: 2,
          type: '自然科学类',
          major: 8,
          schedule: '星期三B210第5-6节{1-16周}',
          stock: 99,
          selected: false
        }
      ],
      filteredCourses: []
    };
  },
  onLoad(options) {
    // 检测是否为APP环境
    // #ifdef APP-PLUS
    this.isAppEnvironment = true;
    console.log('当前在APP环境中');
    // #endif
    
    // 获取路由参数
    this.termId = options.termId || '';
    this.termName = options.termName || '';
    
    // 格式化学期参数
    this.formattedTerm = this.formatTerm(this.termId);
    console.log('原始学期:', this.termId, '格式化后学期:', this.formattedTerm);
    
    // 从后端获取课程数据
    this.fetchCoursesWithRetry();
  },
  methods: {
    navigateBack() {
      try {
        uni.navigateBack({
          delta: 1,
          fail: () => {
            uni.switchTab({
              url: '/pages/course/term'
            });
          }
        });
      } catch (e) {
        uni.switchTab({
          url: '/pages/course/term'
        });
      }
    },
    
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
    
    toggleFilterPanel() {
      this.showFilterPanel = !this.showFilterPanel;
    },
    handleSearch() {
      // 直接过滤，不使用延迟
      this.filterCourses();
    },
    clearSearch() {
      this.searchKeyword = '';
      // 直接过滤，不使用延迟
      this.filterCourses();
    },
    selectType(type) {
      this.selectedType = this.selectedType === type ? '' : type;
    },
    selectMajor(majorId) {
      this.selectedMajor = this.selectedMajor === majorId ? '' : majorId;
    },
    resetFilters() {
      this.selectedType = '';
      this.selectedMajor = '';
    },
    applyFilters() {
      this.showFilterPanel = false;
      this.filterCourses();
    },
    filterCourses() {
      this.page = 1;
      
      const filtered = this.courses.filter(course => {
        // 搜索关键词筛选
        const matchesKeyword = !this.searchKeyword || 
          course.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) || 
          course.teacher.toLowerCase().includes(this.searchKeyword.toLowerCase());
        
        // 课程类型筛选
        const matchesType = !this.selectedType || course.type === this.selectedType;
        
        // 专业筛选
        const matchesMajor = !this.selectedMajor || course.major === this.selectedMajor;
        
        return matchesKeyword && matchesType && matchesMajor;
      });
      
      // 模拟分页
      this.filteredCourses = filtered.slice(0, this.page * this.pageSize);
      this.hasMore = this.filteredCourses.length < filtered.length;
    },
    loadMore() {
      if (!this.hasMore || this.loading) return;
      
      this.loading = true;
      
      // 直接加载更多数据，不使用setTimeout
      this.page++;
      this.filterCourses();
      this.loading = false;
    },
    toggleCourseSelection(course) {
      if (course.stock <= 0 && !course.selected) {
        uni.showToast({
          title: '该课程已无名额',
          icon: 'none'
        });
        return;
      }
      
      // 获取token
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      // 显示加载中
      uni.showLoading({
        title: course.selected ? '正在退选...' : '正在选课...'
      });
      
      // 准备请求参数和请求头
      const requestData = {
        term: this.formattedTerm,
        token: token
      };
      
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': token,
        'X-Token': token
      };
      
      // 如果已选，则退选；否则选课
      if (course.selected) {
        // 退选课程
        uni.request({
          url: `${this.baseUrl}/student/course/${course.id}`,
          method: 'DELETE',
          data: requestData,
          header: headers,
          success: (res) => {
            uni.hideLoading();
            
            if (res.data && res.data.status === 0) {
              // 退选成功
              course.selected = false;
              course.stock++;
              uni.showToast({
                title: '退选成功',
                icon: 'success',
                duration: 1500
              });
            } else {
              // 退选失败
              const errorMsg = res.data?.msg || '退选失败';
              console.error('退选失败:', errorMsg);
              
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
                  icon: 'none',
                  duration: 2000
                });
              }
            }
          },
          fail: (err) => {
            uni.hideLoading();
            console.error('退选请求失败:', err);
            
            // 在APP环境下提供更友好的错误提示
            let errorMsg = '网络异常，请稍后重试';
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
              duration: 2000
            });
          }
        });
      } else {
        // 选课请求参数
        const selectData = {
          courseId: course.id,
          term: this.formattedTerm,
          token: token
        };
        
        // 选课
        uni.request({
          url: `${this.baseUrl}/student/course`,
          method: 'POST',
          data: selectData,
          header: headers,
          success: (res) => {
            uni.hideLoading();
            
            if (res.data && res.data.status === 0) {
              // 选课成功
              course.selected = true;
              course.stock--;
              uni.showToast({
                title: '选课成功',
                icon: 'success',
                duration: 1500
              });
            } else {
              // 选课失败
              const errorMsg = res.data?.msg || '选课失败';
              console.error('选课失败:', errorMsg);
              
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
                  icon: 'none',
                  duration: 2000
                });
              }
            }
          },
          fail: (err) => {
            uni.hideLoading();
            console.error('选课请求失败:', err);
            
            // 在APP环境下提供更友好的错误提示
            let errorMsg = '网络异常，请稍后重试';
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
              duration: 2000
            });
          }
        });
      }
    },
    viewCourseDetail(course) {
      // 跳转到课程详情页
      uni.navigateTo({
        url: `/pages/course/detail?id=${course.id}&term=${this.formattedTerm}`
      });
    },
    getTypeClass(type) {
      const classMap = {
        '创新创业类': 'tag-innovation',
        '自然科学类': 'tag-general',
        '公共艺术类': 'tag-public',
        '限定艺术类': 'tag-elective'
      };
      
      return classMap[type] || '';
    },
    // 从后端获取课程数据(带重试机制)
    fetchCoursesWithRetry() {
      const token = uni.getStorageSync('token');
      
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/index/index'
          });
        }, 1000);
        return;
      }
      
      this.loading = true;
      uni.showLoading({
        title: '加载课程数据...'
      });
      
      // 准备请求参数和请求头
      const requestData = {
        term: this.formattedTerm,
        token: token
      };
      
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': token,
        'X-Token': token
      };
      
      console.log('请求课程列表，参数:', requestData);
      
      uni.request({
        url: `${this.baseUrl}/student/course`,
        method: 'GET',
        data: requestData,
        header: headers,
        success: (res) => {
          if (res.data && res.data.status === 0 && Array.isArray(res.data.data)) {
            // 输出整个响应以进行调试
            console.log('API响应数据:', JSON.stringify(res.data.data[0]));
            
            // 处理后端返回的课程数据
            this.courses = res.data.data.map(item => {
              // 打印课程类型用于调试
              console.log('课程类型:', item.courseType);
              return {
                id: item.id || item.courseId,
                name: item.courseName || item.name,
                teacher: item.teacherName || item.teacher,
                score: parseFloat(item.courseScore || item.score || 0),
                type: item.courseType || item.type || '未知',
                major: item.majorId || item.major || 0,
                schedule: item.address || item.courseTime || item.schedule || '未知',
                stock: parseInt(item.stock || item.courseStock || 0),
                selected: item.status === "1" || item.selected === true || item.selected === 1
              };
            });
            
            // 重置重试计数
            this.retryAttempts = 0;
            
            // 应用过滤器
            this.filterCourses();
          } else {
            // 如果API返回错误
            const errorMsg = res.data?.msg || '未知错误';
            console.error('获取课程数据失败:', errorMsg);
            
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
                title: '获取课程数据失败，使用默认数据',
                icon: 'none',
                duration: 2000
              });
              
              // 使用本地测试数据
              this.filterCourses();
            }
          }
        },
        fail: (err) => {
          console.error('请求失败:', err);
          
          // 在APP环境下进行重试
          if (this.isAppEnvironment && this.retryAttempts < this.maxRetries) {
            this.retryAttempts++;
            console.log(`请求失败，第${this.retryAttempts}次重试...`);
            
            setTimeout(() => {
              this.fetchCoursesWithRetry();
            }, 1000 * this.retryAttempts);
            return;
          }
          
          // 在APP环境下提供更友好的错误提示
          let errorMsg = '网络异常，使用默认数据';
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
            duration: 2000
          });
          
          // 使用本地测试数据
          this.filterCourses();
        },
        complete: () => {
          // 只有在最后一次重试或成功时才更新加载状态
          if (!this.isAppEnvironment || this.retryAttempts >= this.maxRetries) {
            this.loading = false;
            uni.hideLoading();
          }
        }
      });
    }
  }
};
</script>

<style lang="scss">
.course-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #4361ee, #3a0ca3, #6930c3);
  background-size: 100% 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  padding-bottom: 40rpx;
  box-sizing: border-box;
  width: 100%;
  
  /* 添加强制处理确保卡片样式正确应用 */
  :deep(.course-card), 
  :deep(.course-grid view.course-card) {
    -webkit-border-radius: 20rpx !important;
    -moz-border-radius: 20rpx !important;
    border-radius: 20rpx !important;
    overflow: hidden !important;
  }
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  
  .bg-gradient {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  }
  
  .bg-wave {
    position: absolute;
    bottom: -100rpx;
    left: -100rpx;
    right: -100rpx;
    height: 300rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 100% 100% 0 0;
  }
  
  .bg-circle {
    position: absolute;
    top: 10%;
    right: 10%;
    width: 240rpx;
    height: 240rpx;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(247, 37, 133, 0.3) 0%, rgba(247, 37, 133, 0.1) 70%);
  }
}

/* 顶部导航栏 */
.header {
  width: 100%;
  height: 100rpx;
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 10;
  margin-top: 20rpx;
  
  .back-button, .filter-button {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .back-icon, .filter-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    
    image {
      width: 30rpx;
      height: 30rpx;
      filter: brightness(0) invert(1); /* 白色 */
    }
  }
  
  .header-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
  }
}

/* 添加布局提示标签 */
.header-notice {
  text-align: center;
  margin: 10rpx 0;
  opacity: 0.7;
}

.notice-text {
  font-size: 24rpx;
  color: #fff;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

/* 学期信息 */
.term-info-bar {
  padding: 10rpx 30rpx 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  
  .term-info {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 40rpx;
    padding: 8rpx 10rpx;
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
  }
  
  .term-tag {
    font-size: 28rpx;
    color: #fff;
    padding: 8rpx 20rpx;
    margin-right: 10rpx;
    font-weight: 500;
  }
  
  .term-status {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.9);
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    background: rgba(255, 255, 255, 0.15);
    
    &.active {
      background: rgba(47, 230, 148, 0.3);
      color: #fff;
    }
  }
}

/* 搜索栏 */
.search-bar {
  padding: 0 30rpx 20rpx;
  
  .search-input-box {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    backdrop-filter: blur(10px);
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
    
    .search-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60rpx;
      height: 60rpx;
      
      image {
        width: 32rpx;
        height: 32rpx;
        filter: brightness(0) saturate(100%) invert(40%) sepia(12%) saturate(176%) hue-rotate(179deg) brightness(94%) contrast(85%);
      }
    }
    
    .search-input {
      flex: 1;
      height: 80rpx;
      font-size: 28rpx;
      color: #333;
    }
    
    .clear-icon {
      font-size: 36rpx;
      color: #999;
      width: 60rpx;
      height: 60rpx;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}

/* 筛选面板 */
.filter-panel {
  position: absolute;
  right: 0;
  top: 100rpx;
  width: 75%;
  background: #fff;
  border-radius: 30rpx 0 0 30rpx;
  box-shadow: -10rpx 10rpx 30rpx rgba(0, 0, 0, 0.15);
  padding: 30rpx;
  z-index: 100;
  
  .filter-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .filter-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .reset-button {
      font-size: 28rpx;
      color: #4361ee;
    }
  }
  
  .filter-group {
    margin-bottom: 30rpx;
    
    .filter-group-title {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 20rpx;
      display: block;
    }
    
    .filter-tags {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -10rpx;
      
      .filter-tag {
        margin: 10rpx;
        padding: 10rpx 24rpx;
        font-size: 26rpx;
        border-radius: 40rpx;
        background: #f5f5f5;
        color: #666;
        transition: all 0.3s;
        
        &.active {
          background: #4361ee;
          color: #fff;
        }
      }
    }
  }
  
  .filter-buttons {
    display: flex;
    margin-top: 40rpx;
    
    .cancel-button, .confirm-button {
      flex: 1;
      height: 80rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .cancel-button {
      background: #f5f5f5;
      color: #666;
      margin-right: 20rpx;
    }
    
    .confirm-button {
      background: #4361ee;
      color: #fff;
    }
  }
}

/* 课程列表区域 */
.course-list {
  flex: 1;
  padding: 0 30rpx;
  box-sizing: border-box;
  width: 100%;
}

/* 课程网格 */
.course-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 10rpx 0;
  width: 100%;
  box-sizing: border-box;
}

/* 课程卡片 */
.course-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  height: 260rpx;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  margin: 0;
  
  &:active {
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
  }
  
  .course-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;
    width: 100%;
    
    .course-type-tag {
      font-size: 20rpx;
      padding: 4rpx 12rpx;
      border-radius: 20rpx;
      color: #fff;
      height: 22rpx;
      line-height: 1;
      display: flex;
      align-items: center;
      font-weight: 500;
      flex-shrink: 0;
      max-width: 120rpx;
      overflow: hidden;
      
      &.tag-innovation {
        background: linear-gradient(135deg, #2fe694, #0ead69);
      }
      
      &.tag-general {
        background: linear-gradient(135deg, #4cc9f0, #4361ee);
      }
      
      &.tag-public {
        background: linear-gradient(135deg, #4361ee, #3a0ca3);
      }
      
      &.tag-elective {
        background: linear-gradient(135deg, #7209b7, #3f37c9);
      }
    }
    
    .course-stock {
      font-size: 20rpx;
      color: #999;
      height: 22rpx;
      line-height: 22rpx;
      text-align: right;
      white-space: nowrap;
      max-width: 120rpx;
      
      &.low-stock {
        color: #f72585;
      }
    }
  }
  
  .course-body {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12rpx;
    height: 90rpx;
    width: 100%;
    
    .course-info {
      flex: 1;
      padding-right: 10rpx;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: calc(100% - 60rpx);
      
      .course-name {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 8rpx;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
      }
      
      .course-teacher {
        font-size: 24rpx;
        color: #666;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    
    .course-score {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 60rpx;
      flex-shrink: 0;
      
      .score-value {
        font-size: 36rpx;
        font-weight: bold;
        color: #f72585;
      }
      
      .score-label {
        font-size: 20rpx;
        color: #999;
      }
    }
  }
  
  .course-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    width: 100%;
    
    .course-schedule {
      display: flex;
      align-items: center;
      width: calc(100% - 100rpx);
      
      .schedule-icon {
        width: 24rpx;
        height: 24rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 6rpx;
        flex-shrink: 0;
        
        image {
          width: 18rpx;
          height: 18rpx;
          filter: brightness(0) saturate(100%) invert(50%) sepia(10%) saturate(500%) hue-rotate(180deg) brightness(90%) contrast(90%);
        }
      }
      
      .schedule-text {
        font-size: 20rpx;
        color: #888;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
      }
    }
    
    .select-button {
      width: 90rpx;
      height: 48rpx;
      line-height: 48rpx;
      text-align: center;
      font-size: 24rpx;
      border-radius: 24rpx;
      background: #4361ee;
      color: #fff;
      padding: 0;
      margin: 0;
      flex-shrink: 0;
      
      &.selected {
        background: #f72585;
      }
      
      &.disabled {
        background: #ccc;
        opacity: 0.7;
      }
    }
  }
}

/* 加载状态 */
.loading-box {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
    border-top: 4rpx solid #fff;
    border-radius: 50%;
    animation: spin 1.5s ease-in-out infinite;
    margin-bottom: 20rpx;
  }
  
  .loading-text {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.7);
  }
}

/* 空状态 */
.empty-box {
  padding: 60rpx;
  display: flex;
  justify-content: center;
  
  .empty-text {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.7);
    background: rgba(255, 255, 255, 0.1);
    padding: 15rpx 30rpx;
    border-radius: 40rpx;
  }
}

/* 加载更多 */
.load-more {
  padding: 30rpx;
  display: flex;
  justify-content: center;
}

.load-more-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.1);
  padding: 12rpx 30rpx;
  border-radius: 40rpx;
}

/* 底部按钮 */
.bottom-button-area {
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: center;
}

.add-all-button {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border-radius: 40rpx;
  padding: 16rpx 40rpx;
  font-size: 28rpx;
  text-align: center;
}

/* 遮罩层 */
.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 99;
}

/* 动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 
