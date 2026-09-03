<template>
  <view class="mycourse-term-container blue-gradient-bg">
    <!-- 顶部导航栏 -->
    <nav-bar title="我的课程" :show-back="true"></nav-bar>
    
    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 学期选择区域 -->
      <view class="term-card card">
        <view class="card-title">选择学期</view>
        
        <!-- 加载中状态 -->
        <view class="loading-container" v-if="isLoading">
          <view class="loading-text">加载学期数据中...</view>
        </view>
        
        <!-- 无学期数据提示 -->
        <view class="no-term-data" v-if="!isLoading && terms.length === 0">
          <text>暂无学期数据</text>
        </view>
        
        <!-- 第一行 -->
        <view class="term-row" v-if="!isLoading && terms.length > 0">
          <view class="term-col" @tap="selectTerm(terms[0])" v-if="terms.length > 0">
            <view class="term-item" :class="{'active': terms[0].active}">
              <view class="term-content">
                <text class="term-name">{{ terms[0].name }}</text>
                <text class="term-date">{{ terms[0].date }}</text>
              </view>
              <view class="term-badge">
                <text class="term-count">已选 {{ terms[0].courseCount }} 门课程</text>
              </view>
            </view>
          </view>
          
          <view class="term-col" @tap="selectTerm(terms[1])" v-if="terms.length > 1">
            <view class="term-item" :class="{'active': terms[1].active}">
              <view class="term-content">
                <text class="term-name">{{ terms[1].name }}</text>
                <text class="term-date">{{ terms[1].date }}</text>
              </view>
              <view class="term-badge">
                <text class="term-count">已选 {{ terms[1].courseCount }} 门课程</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 第二行 -->
        <view class="term-row" v-if="!isLoading && terms.length > 2">
          <view class="term-col" @tap="selectTerm(terms[2])" v-if="terms.length > 2">
            <view class="term-item" :class="{'active': terms[2].active}">
              <view class="term-content">
                <text class="term-name">{{ terms[2].name }}</text>
                <text class="term-date">{{ terms[2].date }}</text>
              </view>
              <view class="term-badge">
                <text class="term-count">已选 {{ terms[2].courseCount }} 门课程</text>
              </view>
            </view>
          </view>
          
          <view class="term-col" @tap="selectTerm(terms[3])" v-if="terms.length > 3">
            <view class="term-item" :class="{'active': terms[3].active}">
              <view class="term-content">
                <text class="term-name">{{ terms[3].name }}</text>
                <text class="term-date">{{ terms[3].date }}</text>
              </view>
              <view class="term-badge">
                <text class="term-count">已选 {{ terms[3].courseCount }} 门课程</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 第三行 -->
        <view class="term-row" v-if="!isLoading && terms.length > 4">
          <view class="term-col" @tap="selectTerm(terms[4])" v-if="terms.length > 4">
            <view class="term-item" :class="{'active': terms[4].active}">
              <view class="term-content">
                <text class="term-name">{{ terms[4].name }}</text>
                <text class="term-date">{{ terms[4].date }}</text>
              </view>
              <view class="term-badge">
                <text class="term-count">已选 {{ terms[4].courseCount }} 门课程</text>
              </view>
            </view>
          </view>
          
          <view class="term-col" @tap="selectTerm(terms[5])" v-if="terms.length > 5">
            <view class="term-item" :class="{'active': terms[5].active}">
              <view class="term-content">
                <text class="term-name">{{ terms[5].name }}</text>
                <text class="term-date">{{ terms[5].date }}</text>
              </view>
              <view class="term-badge">
                <text class="term-count">已选 {{ terms[5].courseCount }} 门课程</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 第四行 -->
        <view class="term-row" v-if="!isLoading && terms.length > 6">
          <view class="term-col" @tap="selectTerm(terms[6])" v-if="terms.length > 6">
            <view class="term-item" :class="{'active': terms[6].active}">
              <view class="term-content">
                <text class="term-name">{{ terms[6].name }}</text>
                <text class="term-date">{{ terms[6].date }}</text>
              </view>
              <view class="term-badge">
                <text class="term-count">已选 {{ terms[6].courseCount }} 门课程</text>
              </view>
            </view>
          </view>
          
          <view class="term-col" @tap="selectTerm(terms[7])" v-if="terms.length > 7">
            <view class="term-item" :class="{'active': terms[7].active}">
              <view class="term-content">
                <text class="term-name">{{ terms[7].name }}</text>
                <text class="term-date">{{ terms[7].date }}</text>
              </view>
              <view class="term-badge">
                <text class="term-count">已选 {{ terms[7].courseCount }} 门课程</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 提示信息 -->
      <view class="tip-card card">
        <view class="tip-icon">
          <image src="/static/images/icon-info.svg" mode="aspectFit"></image>
        </view>
        <view class="tip-text">点击学期查看已选课程详情</view>
      </view>
    </view>
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'

import { API_BASE_URL } from '@/config'

export default {
  name: 'MyCourseTermPage',
  components: {
    NavBar
  },
  data() {
    return {
      terms: [],
      isLoading: true,
      termList: [
        { name: '大四下学期', id: '4-2' },
        { name: '大四上学期', id: '4-1' },
        { name: '大三下学期', id: '3-2' },
        { name: '大三上学期', id: '3-1' },
        { name: '大二下学期', id: '2-2' },
        { name: '大二上学期', id: '2-1' },
        { name: '大一下学期', id: '1-2' },
        { name: '大一上学期', id: '1-1' }
      ]
    }
  },
  mounted() {
    // 加载学期数据
    this.fetchTerms();
  },
  created() {
    // 立即初始化默认学期数据，确保视图可以立即显示
    this.useDefaultTerms();
    // 初始化完成后立即设置加载状态为false
    this.isLoading = false;
  },
  methods: {
    /**
     * 获取学期数据
     */
    fetchTerms() {
      const token = uni.getStorageSync('token');
      const userInfo = uni.getStorageSync('userInfo');
      
      if (!token || !userInfo) {
        uni.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/index/index',
            animationType: 'none'
          });
        }, 1000);
        return;
      }
      
      // 显示加载状态
      uni.showLoading({
        title: '加载学期数据...'
      });
      
      console.log('开始请求学期数据，使用token:', token);
      
      // 直接使用默认学期数据，确保显示所有六个学期
      this.useDefaultTerms();
      
      // 尝试获取各学期的课程数量
      this.fetchCourseCountsForTerms();
      
      // 确保加载状态被关闭
      setTimeout(() => {
        uni.hideLoading();
        this.isLoading = false;
      }, 1000); // 设置一个较短的超时时间来确保状态被重置
    },
    
    // 如果获取课程数据失败，则尝试获取学期数据
    fallbackToTermsAPI(token, defaultTerms) {
      // 直接使用默认学期数据，确保显示所有六个学期
      this.useDefaultTerms();
      
      // 隐藏加载提示
      setTimeout(() => {
        uni.hideLoading();
        this.isLoading = false;
      }, 500);
      
      // 尝试获取各学期的课程数量
      this.fetchCourseCountsForTerms();
    },
    
    // 从课程数据中提取学期信息
    processTermDataFromCourses(courseData, defaultTerms) {
      try {
        // 直接使用默认学期数据，确保显示所有六个学期
        this.useDefaultTerms();
        
        // 如果有课程数据，计算每个学期的课程数量
        if (Array.isArray(courseData) && courseData.length > 0) {
          // 为每个学期计数
          const courseCountMap = new Map();
          
          // 初始化默认计数为0
          this.terms.forEach(term => {
            courseCountMap.set(term.code, 0);
          });
          
          // 计算每个学期的课程数量
          courseData.forEach(course => {
            if (!course || typeof course !== 'object') return;
            
            // 尝试从不同的字段获取学期信息
            let term = course.term;
            
            // 如果没有找到term字段，尝试从其他可能的字段获取
            if (!term && course.termCode) {
              term = course.termCode;
            }
            
            // 如果学期代码有效且在我们的学期列表中
            if (term && courseCountMap.has(term)) {
              courseCountMap.set(term, courseCountMap.get(term) + 1);
            }
          });
          
          // 更新学期数据的课程数量
          this.terms = this.terms.map(term => {
            return {
              ...term,
              courseCount: courseCountMap.get(term.code) || 0
            };
          });
          
          console.log('更新后的学期数据:', this.terms);
        }
      } catch (error) {
        console.error('从课程数据处理学期信息出错:', error);
        // 使用默认学期数据
        this.useDefaultTerms();
      } finally {
          // 隐藏加载提示
        setTimeout(() => {
          uni.hideLoading();
          this.isLoading = false;
        }, 500);
      }
    },
    
    /**
     * 解析学期代码
     * @param {String} termCode 学期代码 (例如: "3-1")
     * @returns {Object} 学期信息
     */
    parseTermCode(termCode) {
      try {
        // 尝试解析 "3-1" 格式的学期代码
        if (termCode && termCode.includes('-')) {
          const parts = termCode.split('-');
          const year = parseInt(parts[0], 10);
          const semester = parts[1];
          
          let name = '';
          let startDate = '';
          let endDate = '';
          
          // 大学年份
          let baseYear = 2021; // 假设大一基准年为2021年
          const currentYear = new Date().getFullYear();
          
          // 计算入学年份
          if (year >= 1 && year <= 4) {
            // 年级-学期格式 (如"3-1"表示大三上学期)
            
            if (semester === '1') {
              name = `大${year}上学期`;
              startDate = `${currentYear}.09`;
              endDate = `${currentYear + 1}.01`;
            } else if (semester === '2') {
              name = `大${year}下学期`;
              startDate = `${currentYear + 1}.02`;
              endDate = `${currentYear + 1}.07`;
            } else {
              name = `大${year}第${semester}学期`;
              startDate = `${currentYear}.01`;
              endDate = `${currentYear}.12`;
            }
          } else {
            // 如果是老式"2023-1"格式，保留原有处理逻辑
            if (semester === '1') {
              name = `${year}-${year + 1}学年第一学期`;
              startDate = `${year}.09`;
              endDate = `${year + 1}.01`;
            } else if (semester === '2') {
              name = `${year}-${year + 1}学年第二学期`;
              startDate = `${year + 1}.02`;
              endDate = `${year + 1}.07`;
            } else {
              name = `${year}年第${semester}学期`;
              startDate = `${year}.01`;
              endDate = `${year}.12`;
            }
          }
          
          return { name, startDate, endDate };
        } else {
          // 如果不是标准格式，尝试直接使用
          return { 
            name: termCode || '未知学期', 
            startDate: '未知', 
            endDate: '未知' 
          };
        }
      } catch (error) {
        console.error('解析学期代码失败:', error);
        return { 
          name: termCode || '未知学期', 
          startDate: '未知', 
          endDate: '未知' 
        };
      }
    },
    
    /**
     * 处理学期数据
     */
    processTermData(data) {
      try {
        // 将原始数据保存
        this.termList = data;
        
        // 数据健壮性检查
        if (!data || !Array.isArray(data) || data.length === 0) {
          console.warn('获取到的课程数据为空或不是数组');
          this.useDefaultTerms();
          return;
        }
        
        // 检查数据是否为课程列表或学期列表
        if (data.length > 0 && data[0].hasOwnProperty('code')) {
          // 直接处理学期列表
          console.log('检测到学期列表数据，直接处理');
          
          // 转换为前端需要的格式
          let formattedTerms = data.map(term => {
            // 解析学期格式
            const termInfo = this.parseTermCode(term.code);
            return {
              code: term.code,
              name: term.name || termInfo.name,
              date: `${termInfo.startDate}-${termInfo.endDate}`,
              courseCount: 0, // 初始化课程数
              active: false
            };
          });
          
          // 默认选中第一个学期
          if (formattedTerms.length > 0) {
            formattedTerms[0].active = true;
          }
          
          // 更新学期数据
          this.terms = formattedTerms;
          console.log('处理后的学期数据:', this.terms);
        } else {
          // 使用默认学期数据
          this.useDefaultTerms();
        }
      } catch (error) {
        console.error('处理学期数据出错:', error);
        this.useDefaultTerms();
      } finally {
        // 隐藏加载提示
        setTimeout(() => {
          uni.hideLoading();
          this.isLoading = false;
        }, 500);
      }
    },
    
    /**
     * 使用默认学期数据
     */
    useDefaultTerms() {
      this.terms = [
        {
          code: '4-1',
          name: '大四上学期',
          date: '2024.09-2025.01',
          courseCount: 0,
          active: true
        },
        {
          code: '4-2',
          name: '大四下学期',
          date: '2025.02-2025.07',
          courseCount: 0,
          active: false
        },
        {
          code: '3-1',
          name: '大三上学期',
          date: '2023.09-2024.01',
          courseCount: 0,
          active: false
        },
        {
          code: '3-2',
          name: '大三下学期',
          date: '2024.02-2024.07',
          courseCount: 0,
          active: false
        },
        {
          code: '2-1',
          name: '大二上学期',
          date: '2022.09-2023.01',
          courseCount: 0,
          active: false
        },
        {
          code: '2-2',
          name: '大二下学期',
          date: '2023.02-2023.07',
          courseCount: 0,
          active: false
        },
        {
          code: '1-1',
          name: '大一上学期',
          date: '2021.09-2022.01',
          courseCount: 0,
          active: false
        },
        {
          code: '1-2',
          name: '大一下学期',
          date: '2022.02-2022.07',
          courseCount: 0,
          active: false
        }
      ];
      console.log('使用默认学期数据:', this.terms);
    },
    
    /**
     * 为默认学期数据获取课程数量
     */
    fetchCourseCountsForTerms() {
      // 先创建默认学期
      this.useDefaultTerms();
      
      // 获取token
      const token = uni.getStorageSync('token');
      if (!token) {
        // 如果没有token，也要确保加载状态关闭
        this.isLoading = false;
        uni.hideLoading();
        return;
      }
      
      // 为每个学期获取课程数量
      const termCodes = this.terms.map(term => term.code);
      
      // 创建一个Map来存储课程计数
      const courseCountMap = new Map();
      let pendingRequests = termCodes.length;
      
      // 设置安全超时，确保不会永远卡在加载状态
      const safetyTimeout = setTimeout(() => {
        if (this.isLoading) {
          console.log('安全超时触发，强制关闭加载状态');
          uni.hideLoading();
          this.isLoading = false;
        }
      }, 10000); // 10秒超时保障
      
      // 为每个学期获取课程数量
      termCodes.forEach(termCode => {
        uni.request({
          url: `${API_BASE_URL}/student/my-courses`,
          method: 'GET',
          data: {
            term: termCode,
            token: token
          },
          header: {
            'Content-Type': 'application/json; charset=UTF-8'
          },
          success: (res) => {
            if (res.data && res.data.status === 0 && Array.isArray(res.data.data)) {
              // 存储课程数量
              courseCountMap.set(termCode, res.data.data.length);
            }
          },
          complete: () => {
            pendingRequests--;
            
            // 当所有请求完成后，更新学期数据
            if (pendingRequests === 0) {
              clearTimeout(safetyTimeout); // 清除安全超时
              this.updateTermsWithCourseCount(courseCountMap);
              // 确保加载状态被关闭
              uni.hideLoading();
              this.isLoading = false;
            }
          }
        });
      });
    },
    
    /**
     * 使用课程计数更新学期
     */
    updateTermsWithCourseCount(courseCountMap) {
      this.terms = this.terms.map(term => {
        const count = courseCountMap.get(term.code) || 0;
        return {
          ...term,
          courseCount: count
        };
      });
    },
    
    /**
     * 使用默认学期数据但使用课程数据计算课程数量
     */
    useDefaultTermsWithCourseCount(courseData) {
      // 创建默认学期
      this.useDefaultTerms();
      
      // 如果有课程数据，计算课程数量
      if (Array.isArray(courseData) && courseData.length > 0) {
        // 为每个学期计数
        const courseCountMap = new Map();
        
        // 初始化默认计数为0
        this.terms.forEach(term => {
          courseCountMap.set(term.code, 0);
        });
        
        // 计算每个学期的课程数量
        courseData.forEach(course => {
          if (!course || typeof course !== 'object') return;
          
          // 尝试从不同的字段获取学期信息
          let term = course.term;
          
          // 如果没有找到term字段，尝试从其他可能的字段获取
          if (!term && course.termCode) {
            term = course.termCode;
          }
          
          // 如果学期代码有效且在我们的学期列表中
          if (term && courseCountMap.has(term)) {
            courseCountMap.set(term, courseCountMap.get(term) + 1);
          }
        });
        
        // 更新学期数据
        this.terms = this.terms.map(term => {
        return {
            ...term,
            courseCount: courseCountMap.get(term.code) || 0
        };
        });
      } else {
        // 如果没有课程数据，尝试从API获取课程数量
        this.fetchCourseCountsForTerms();
      }
    },
    
    /**
     * 选择学期并导航到课程列表页面
     */
    selectTerm(term) {
      if (!term) return;
      
      // 导航到课程列表页，传递学期信息
      uni.navigateTo({
        url: `/pages/mycourse/list?term=${encodeURIComponent(term.name)}&code=${encodeURIComponent(term.code)}`,
        animationType: 'none'
      });
    },
    
    /**
     * 显示错误提示
     * @param {String} message - 错误信息
     */
    showErrorToast(message) {
      uni.showToast({
        title: message,
        icon: 'none'
      });
    }
  }
}
</script>

<style lang="scss">
.mycourse-term-container {
  min-height: 100vh;
  position: relative;
  padding-bottom: 120rpx; /* 为底部Tab栏留出空间 */
  padding-top: var(--status-bar-height);
}

.content-area {
  position: relative;
  z-index: 2;
  padding: 160rpx 30rpx 30rpx; /* 为顶部导航预留空间 */
}

.card {
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.term-card {
  padding: 30rpx;
  margin-bottom: 30rpx;
  position: relative;
  z-index: 1;
  overflow: hidden;
  
  .card-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 25rpx;
    position: relative;
    padding-left: 20rpx;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 8rpx;
      height: 32rpx;
      background: linear-gradient(to bottom, #4361ee, #7209b7);
      border-radius: 4rpx;
    }
  }
}

// 学期网格布局
.term-grid {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -1%;
}

.term-col {
  width: 48%;
  margin: 0 1% 24rpx 1%;
  position: relative;
}

// 学期项目样式
.term-item {
  background-color: #f9f9f9;
  background-image: linear-gradient(135deg, #f9f9f9 0%, #f0f5ff 100%);
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  border: 1rpx solid rgba(74, 137, 220, 0.1);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  min-height: 150rpx;
  position: relative;
  overflow: hidden;
  transition: none !important;
  animation: none !important;
  
  &.active {
    background-image: linear-gradient(135deg, #f0f7ff 0%, #ebf4ff 100%);
    border: 1rpx solid rgba(74, 137, 220, 0.3);
    box-shadow: 0 6rpx 16rpx rgba(74, 137, 220, 0.15);
  }
}

// 学期内容样式
.term-content {
  flex: 1;
  margin-bottom: 16rpx;
  position: relative;
  z-index: 2;
  
  .term-name {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 8rpx;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-all;
  }
  
  .term-date {
    font-size: 24rpx;
    color: #666;
    display: block;
    line-height: 1.2;
  }
}

// 学期徽章样式
.term-badge {
  display: flex;
  justify-content: flex-end;
  position: relative;
  z-index: 2;
  
  .term-count {
    font-size: 24rpx;
    color: #4a89dc;
    text-align: right;
    font-weight: 500;
    padding: 4rpx 14rpx;
    border-radius: 20rpx;
    background-color: rgba(74, 137, 220, 0.1);
    display: inline-block;
    line-height: 1.4;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  }
}

.active .term-count {
  background-color: rgba(74, 137, 220, 0.2);
  color: #3a75cc;
}

// 提示卡片样式
.tip-card {
  padding: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30rpx;
  
  .tip-icon {
    width: 32rpx;
    height: 32rpx;
    margin-right: 10rpx;
    
    image {
      width: 100%;
      height: 100%;
      opacity: 0.6;
    }
  }
  
  .tip-text {
    font-size: 26rpx;
    color: #777;
    text-align: center;
  }
}

.term-row {
  display: flex;
  flex-direction: row;
  margin-bottom: 24rpx;
  width: 100%;
}

.notice-text {
  font-size: 26rpx;
  color: #777;
  text-align: center;
}

// 加载中和无数据样式
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200rpx;
  margin: 30rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
  text-align: center;
}

.no-term-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200rpx;
  margin: 30rpx 0;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 20rpx;
  text {
    font-size: 28rpx;
    color: #999;
  }
}

.blue-gradient-bg {
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  min-height: 100vh;
}

/* 移除所有动画和过渡效果 */
.mycourse-term-container * {
  transition: none !important;
  animation: none !important;
  transform: none !important;
}
</style> 
