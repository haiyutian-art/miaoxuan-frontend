<template>
  <view class="grade-container blue-gradient-bg">
    <!-- 移除气泡背景 -->
    
    <!-- 头部导航栏 -->
    <nav-bar title="成绩查询" :show-back="true"></nav-bar>
    
    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 学期选择 -->
      <view class="semester-selector card">
        <view class="selector-label">选择学期</view>
        <view class="selector-value">
          <picker @change="onSemesterChange" :value="semesterIndex" :range="semesters">
            <view class="picker-text">{{ semesters[semesterIndex] }}</view>
          </picker>
          <view class="selector-arrow">
            <image src="/static/images/icon-dropdown.svg" mode="aspectFit"></image>
          </view>
        </view>
      </view>
      
      <!-- 成绩列表 -->
      <view class="grade-list">
        <view class="grade-item card" v-for="(item, index) in currentGrades" :key="index">
          <view class="grade-top">
            <text class="course-name">{{ item.name }}</text>
            <text class="course-score" :class="getScoreClass(item.score)">{{ item.score }}</text>
          </view>
          <view class="grade-bottom">
            <text class="course-code">{{ item.code }}</text>
            <text class="course-credit">{{ item.credit }} 学分</text>
            <text class="course-status">{{ getStatusText(item.score) }}</text>
          </view>
        </view>
      </view>
      
      <!-- 加载状态 - 移除旋转动画 -->
      <view class="loading-container card" v-if="isLoading">
        <view class="loading-indicator"></view>
        <text class="loading-text">加载成绩数据中...</text>
      </view>
      
      <!-- 无成绩提示 -->
      <view class="no-data card" v-if="!isLoading && currentGrades.length === 0">
        <text v-if="error">{{ error }}</text>
        <text v-else>当前学期暂无成绩数据</text>
      </view>
      
      <!-- 统计信息 -->
      <view class="stat-card card">
        <view class="stat-item">
          <text class="stat-label">课程数量</text>
          <text class="stat-value">{{ currentGrades.length }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">平均分</text>
          <text class="stat-value">{{ averageScore }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">总学分</text>
          <text class="stat-value">{{ totalCredits }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'

import { API_BASE_URL } from '@/config'

export default {
  components: {
    NavBar
  },
  data() {
    return {
      semesters: [
        '大四下',
        '大四上',
        '大三下',
        '大三上',
        '大二下',
        '大二上',
        '大一下',
        '大一上'
      ],
      semesterCodes: [
        '4-2', // 对应数据库中的学期格式
        '4-1',
        '3-2',
        '3-1',
        '2-2',
        '2-1',
        '1-2',
        '1-1'
      ],
      semesterIndex: 0,
      grades: [],
      isLoading: false,
      error: null
    }
  },
  computed: {
    currentGrades() {
      return this.grades[this.semesterIndex] || [];
    },
    totalCredits() {
      return this.currentGrades.reduce((total, grade) => total + grade.credit, 0);
    },
    averageScore() {
      if (this.currentGrades.length === 0) return '0';
      const total = this.currentGrades.reduce((sum, grade) => sum + grade.score, 0);
      return (total / this.currentGrades.length).toFixed(1);
    }
  },
  onLoad() {
    // 页面加载时，获取第一个学期的成绩
    this.fetchGradeData(0);
  },
  methods: {
    onSemesterChange(e) {
      const index = e.detail.value;
      this.semesterIndex = index;
      // 切换学期时获取该学期的成绩
      this.fetchGradeData(index);
    },
    getScoreClass(score) {
      if (score >= 90) return 'score-excellent';
      if (score >= 80) return 'score-good';
      if (score >= 70) return 'score-medium';
      if (score >= 60) return 'score-pass';
      return 'score-fail';
    },
    getStatusText(score) {
      if (score >= 90) return '优秀';
      if (score >= 80) return '良好';
      if (score >= 70) return '中等';
      if (score >= 60) return '及格';
      return '不及格';
    },
    
    // 获取指定学期的成绩数据
    fetchGradeData(semesterIndex) {
      // 首先检查是否已经加载过该学期的数据
      if (this.grades[semesterIndex] && this.grades[semesterIndex].length > 0) {
        console.log(`使用已缓存的学期${semesterIndex}成绩数据`);
        return;
      }
      
      // 获取token和用户信息
      const token = uni.getStorageSync('token');
      const studentNo = uni.getStorageSync('studentNo');
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/login/index',
            animationType: 'none'
          });
        }, 1500);
        return;
      }
      
      // 设置加载状态
      this.isLoading = true;
      uni.showLoading({
        title: '加载成绩数据...'
      });
      
      // 获取学期代码
      const termCode = this.semesterCodes[semesterIndex];
      console.log(`请求学期${termCode}的成绩数据，使用token: ${token}`);
      
      // 发送请求获取成绩数据
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
          console.log('成绩数据返回:', JSON.stringify(res.data));
          
          if (res.data && res.data.status === 0) {
            // 处理成功获取的成绩数据
            const gradeList = this.processGradeData(res.data.data || []);
            
            // 更新指定学期的成绩数据
            if (!this.grades[semesterIndex]) {
              this.$set(this.grades, semesterIndex, []);
            }
            this.$set(this.grades, semesterIndex, gradeList);
            
            this.error = null;
          } else {
            // 处理错误
            const errorMsg = res.data?.msg || '获取成绩失败';
            console.error('获取成绩失败:', errorMsg);
            this.error = errorMsg;
            
            // 如果学期格式错误，尝试使用其他格式
            if (errorMsg.includes('学期格式') || errorMsg.includes('不存在')) {
              console.log('尝试使用不同的学期格式重新请求');
              // 尝试调整学期格式 (例如，1学期改为1-1, 2学期改为1-2等)
              const altTerms = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];
              if (altTerms.includes(termCode)) {
                // 已经是标准格式了
                console.log('已经使用标准学期格式，但仍然失败');
              } else {
                // 可能需要进一步调整格式
                console.log('需要进一步调整学期格式');
              }
            }
            
            // 如果是登录过期，提示用户重新登录
            if (errorMsg.includes('请先登录') || errorMsg.includes('登录过期')) {
              uni.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none'
              });
              setTimeout(() => {
                uni.navigateTo({
                  url: '/pages/login/index',
                  animationType: 'none'
                });
              }, 1500);
            } else {
              uni.showToast({
                title: errorMsg,
                icon: 'none'
              });
            }
            
            // 设置空数据
            if (!this.grades[semesterIndex]) {
              this.$set(this.grades, semesterIndex, []);
            }
          }
        },
        fail: (err) => {
          console.error('请求失败:', err);
          this.error = '网络请求失败';
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
          
          // 设置空数据
          if (!this.grades[semesterIndex]) {
            this.$set(this.grades, semesterIndex, []);
          }
        },
        complete: () => {
          this.isLoading = false;
          uni.hideLoading();
        }
      });
    },
    
    // 处理从后端获取的成绩数据，转换为前端需要的格式
    processGradeData(courseData) {
      if (!Array.isArray(courseData)) {
        console.warn('后端返回的数据不是数组');
        return [];
      }
      
      console.log('处理课程成绩数据:', courseData);
      
      return courseData.map(course => {
        console.log('处理单个课程数据:', JSON.stringify(course));
        
        // 从后端数据中提取需要的信息
        // 参考choose表字段: student_id, course_id, usual_grade, exam_grade, all_grade, my_term
        // 参考course表字段: course_id, course_name, course_score(学分)
        const gradeData = {
          code: course.courseId ? `CS${course.courseId}` : 'UNKNOWN',
          name: course.courseName || '未知课程',
          credit: parseFloat(course.courseScore || 0),
          score: parseFloat(course.allGrade || 0)
        };
        
        // 添加平时成绩和考试成绩的信息，可能为null
        if (course.usualGrade !== undefined && course.usualGrade !== null) {
          gradeData.usualGrade = parseFloat(course.usualGrade);
        }
        
        if (course.examGrade !== undefined && course.examGrade !== null) {
          gradeData.examGrade = parseFloat(course.examGrade);
        }
        
        // 保证成绩为有效数字
        if (typeof gradeData.score !== 'number' || isNaN(gradeData.score)) {
          gradeData.score = 0;
        }
        
        // 保证学分为有效数字
        if (typeof gradeData.credit !== 'number' || isNaN(gradeData.credit)) {
          gradeData.credit = 0;
        }
        
        return gradeData;
      });
    }
  }
}
</script>

<style lang="scss">
.grade-container {
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

.semester-selector {
  padding: 24rpx;
  margin-bottom: 30rpx;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.selector-label {
  font-size: 28rpx;
  color: #333;
  margin-right: 20rpx;
  font-weight: 500;
}

.selector-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.picker-text {
  font-size: 28rpx;
  color: #4361ee;
  font-weight: bold;
}

.selector-arrow {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selector-arrow image {
  width: 24rpx;
  height: 24rpx;
  filter: brightness(0) saturate(100%) invert(30%) sepia(85%) saturate(1969%) hue-rotate(221deg) brightness(99%) contrast(89%);
}

.grade-list {
  margin-bottom: 30rpx;
  position: relative;
  z-index: 1;
}

.grade-item {
  padding: 24rpx;
  margin-bottom: 20rpx;
  
  &:active {
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
  }
}

.grade-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.course-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.course-score {
  font-size: 40rpx;
  font-weight: bold;
}

.score-excellent {
  color: #52c41a;
}

.score-good {
  color: #1890ff;
}

.score-medium {
  color: #faad14;
}

.score-pass {
  color: #fa8c16;
}

.score-fail {
  color: #f5222d;
}

.grade-bottom {
  display: flex;
  font-size: 24rpx;
  color: #666;
}

.course-code {
  margin-right: 20rpx;
}

.course-credit {
  margin-right: 20rpx;
}

.course-status {
  flex: 1;
  text-align: right;
  font-weight: 500;
}

.no-data {
  padding: 60rpx 30rpx;
  text-align: center;
  color: #666;
  font-size: 28rpx;
  margin-bottom: 30rpx;
}

.stat-card {
  padding: 30rpx;
  display: flex;
  justify-content: space-around;
  margin-bottom: 30rpx;
  position: relative;
  z-index: 1;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #4361ee;
}

/* 统计信息 */
.statistics {
  margin-top: 20rpx;
  padding: 30rpx;
}

/* 加载状态 - 使用静态指示器替代动画 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  margin: 20rpx;
}

.loading-indicator {
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #f3f3f3;
  border-top: 6rpx solid #2979ff;
  border-radius: 50%;
  margin-bottom: 20rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

/* 移除动画关键帧 */
/* 添加禁用所有动画的规则 */
.grade-container * {
  transition: none !important;
  animation: none !important;
  transform: none !important;
}
</style> 
