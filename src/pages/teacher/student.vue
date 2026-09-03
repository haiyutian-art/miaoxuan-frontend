<template>
  <view class="student-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="nav-back" @tap="goBack">
          <image class="icon-svg" src="/static/images/icon-back.svg" mode="aspectFit"></image>
        </view>
        <text class="page-title">学生管理</text>
        <view class="header-actions">
          <text class="iconfont icon-search" @tap="showSearch"></text>
        </view>
      </view>
    </view>

    <!-- 过滤选项卡 -->
    <view class="filter-tabs">
      <view 
        class="tab-item active"
      >
        <text>全部学生</text>
        <view class="tab-line"></view>
      </view>
    </view>

    <!-- 学生列表 -->
    <view class="student-list" v-if="filteredStudents.length > 0">
      <view 
        class="student-card" 
        v-for="(student, index) in filteredStudents" 
        :key="index" 
        @tap="viewStudentDetail(student)"
        :animation="getCardAnimation(index)"
      >
        <view class="student-avatar">
          {{student.studentName ? student.studentName.slice(0, 1) : ''}}
        </view>
        
        <view class="student-info">
          <text class="student-name">{{student.studentName}}</text>
          <text class="student-id">{{student.studentNo}}</text>
          <view class="student-meta">
            <text class="meta-item">{{student.majorName || '未设置专业'}}</text>
          </view>
        </view>
        
        <view class="student-actions">
          <view class="action-btn grade-btn" @tap.stop="viewStudentGrade(student)">
            <text class="iconfont icon-grade"></text>
            <text>成绩</text>
          </view>
          <view class="action-btn message-btn" @tap.stop="sendMessage(student)">
            <text class="iconfont icon-message"></text>
            <text>消息</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载中 -->
    <view class="loading-state" v-if="isLoading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!isLoading && filteredStudents.length === 0">
      <image src="/static/images/empty-students.png" mode="aspectFit" class="empty-icon"></image>
      <text class="empty-text">暂无学生数据</text>
      <text class="empty-desc">当前没有符合条件的学生</text>
    </view>

    <!-- 搜索框 -->
    <view class="search-panel" v-if="showSearchPanel">
      <view class="search-header">
        <text class="title">搜索学生</text>
        <text class="close-btn" @tap="hideSearch">×</text>
      </view>
      <view class="search-input">
        <text class="iconfont icon-search"></text>
        <input 
          type="text" 
          placeholder="输入学生姓名或学号" 
          v-model="searchKey"
          confirm-type="search"
          @confirm="searchStudents"
        />
        <text class="clear-btn" v-if="searchKey" @tap="clearSearch">×</text>
      </view>
      <view class="search-btn" @tap="searchStudents">搜索</view>
    </view>
  </view>
</template>

<script>
import { API_BASE_URL } from '@/config'

export default {
  data() {
    return {
      studentList: [],
      isLoading: false,
      searchKey: '',
      showSearchPanel: false,
      cardAnimations: []
    }
  },
  computed: {
    filteredStudents() {
      let result = this.studentList;
      
      // 根据搜索关键词过滤
      if (this.searchKey) {
        const key = this.searchKey.toLowerCase();
        result = result.filter(student => 
          (student.studentName && student.studentName.toLowerCase().includes(key)) || 
          (student.studentNo && student.studentNo.toLowerCase().includes(key))
        );
      }
      
      return result;
    }
  },
  onLoad() {
    this.fetchStudents();
  },
  onShow() {
    // 页面显示时也刷新数据
    this.fetchStudents();
  },
  methods: {
    // 获取学生列表数据
    fetchStudents() {
      this.isLoading = true;
      
      // 获取token
      const token = uni.getStorageSync('token');
      if (!token) {
        console.error('未找到登录token');
        uni.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        this.useLocalDemoData();
        this.isLoading = false;
        return;
      }
      
      // 直接尝试获取所有学生列表
      this.fetchAllStudents(token);
    },
    
    // 直接获取所有学生列表
    fetchAllStudents(token) {
      console.log('直接获取所有学生列表');
      
      uni.request({
        url: `${API_BASE_URL}/teacher/students`,
        method: 'GET',
        data: { token },
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          console.log('获取全部学生响应:', res.statusCode);
          
          if (res.statusCode === 200 && res.data && res.data.status === 0) {
            const students = res.data.data || [];
            console.log('获取到的全部学生数量:', students.length);
            
            if (Array.isArray(students) && students.length > 0) {
              this.processStudentData(students);
            } else {
              // 如果无法获取所有学生，尝试获取课程列表
              this.fetchCourses(token);
            }
          } else {
            console.error('获取全部学生列表失败:', res.data?.msg || '未知错误');
            // 回退到获取课程列表
            this.fetchCourses(token);
          }
        },
        fail: (err) => {
          console.error('获取全部学生列表请求失败:', err);
          // 回退到获取课程列表
          this.fetchCourses(token);
        }
      });
    },
    
    // 获取教师课程列表
    fetchCourses(token) {
      console.log('获取教师课程列表');
      
      uni.request({
        url: `${API_BASE_URL}/teacher/courses`,
        method: 'GET',
        data: { token },
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          console.log('获取课程列表响应:', res.statusCode);
          
          if (res.statusCode === 200 && res.data && res.data.status === 0 && Array.isArray(res.data.data)) {
            const courses = res.data.data || [];
            console.log('获取到的课程数量:', courses.length);
            
            if (courses.length > 0) {
              // 依次获取每个课程的学生名单并合并
              this.fetchStudentsForAllCourses(courses, token);
            } else {
              console.log('教师没有课程，使用本地数据');
              this.useLocalDemoData();
            }
          } else {
            console.error('获取课程列表失败:', res.data?.msg || '未知错误');
            this.useLocalDemoData();
          }
        },
        fail: (err) => {
          console.error('获取课程列表失败:', err);
          this.useLocalDemoData();
        },
        complete: () => {
          if (this.studentList.length === 0) {
            this.useLocalDemoData();
          }
          this.isLoading = false;
        }
      });
    },
    
    // 依次获取每个课程的学生并合并
    fetchStudentsForAllCourses(courses, token) {
      console.log('开始获取所有课程的学生');
      
      const allStudents = [];
      let completedRequests = 0;
      
      courses.forEach(course => {
        // 获取该课程的学生
        this.fetchCourseStudents(course.courseId, token, (students) => {
          if (Array.isArray(students)) {
            allStudents.push(...students);
          }
          
          completedRequests++;
          
          // 当所有请求完成时
          if (completedRequests === courses.length) {
            // 处理合并后的学生数据
            this.processStudentData(allStudents);
          }
        });
      });
    },
    
    // 获取单个课程的学生，使用回调函数处理结果
    fetchCourseStudents(courseId, token, callback) {
      console.log(`获取课程${courseId}的学生`);
      
      uni.request({
        url: `${API_BASE_URL}/teacher/course/${courseId}/students`,
        method: 'GET',
        data: { token },
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data && res.data.status === 0) {
            const courseStudents = res.data.data || [];
            console.log(`课程${courseId}学生数量:`, courseStudents.length);
            
            // 解析课程学生数据
            const processedStudents = this.extractStudentData(courseStudents);
            
            // 返回处理后的学生数据
            callback(processedStudents);
          } else {
            console.error(`获取课程${courseId}学生失败:`, res.data?.msg || '未知错误');
            callback([]);
          }
        },
        fail: (err) => {
          console.error(`获取课程${courseId}学生请求失败:`, err);
          callback([]);
        }
      });
    },
    
    // 从不同格式的响应中提取学生数据
    extractStudentData(rawData) {
      const result = [];
      
      if (!Array.isArray(rawData)) {
        console.error('提取学生数据失败:非数组格式');
        return [];
      }
      
      rawData.forEach(item => {
        try {
          let student = null;
          
          // 检查多种可能的数据结构
          if (item.student) {
            // 如果数据在student字段中
            student = item.student;
          } else if (item.studentName || item.studentId || item.studentNo) {
            // 如果学生数据直接在顶层字段中
            student = item;
          } else if (item.id) {
            // 尝试其他可能的命名
            student = {
              studentId: item.id,
              studentName: item.name || '未知姓名',
              studentNo: item.no || '未知学号',
              majorName: item.major || item.majorName || '未知专业'
            };
          }
          
          if (student) {
            result.push({
              studentId: student.studentId || student.id || 0,
              studentNo: student.studentNo || student.no || '未知学号',
              studentName: student.studentName || student.name || '未知姓名',
              majorName: student.majorName || student.major || '未知专业'
            });
          }
        } catch (error) {
          console.error('处理学生数据项出错:', error);
        }
      });
      
      return result;
    },
    
    // 处理学生数据，去重并更新列表
    processStudentData(students) {
      console.log('处理学生数据,原始数量:', students.length);
      
      // 去除重复的学生记录
      const uniqueStudents = [];
      const seen = new Set();
      
      students.forEach(student => {
        const studentKey = student.studentId || student.studentNo;
        if (studentKey && !seen.has(studentKey)) {
          seen.add(studentKey);
          uniqueStudents.push(student);
        }
      });
      
      console.log('去重后的学生数量:', uniqueStudents.length);
      
      if (uniqueStudents.length > 0) {
        this.studentList = uniqueStudents;
        this.initCardAnimations();
      } else {
        console.error('处理后没有有效的学生数据，使用本地数据');
        this.useLocalDemoData();
      }
    },
    
    goBack() {
      try {
        uni.navigateBack({
          delta: 1,
          fail: (error) => {
            console.log('返回失败:', error);
            uni.switchTab({
              url: '/pages/teacher/index'
            });
          }
        });
      } catch (error) {
        console.error('返回异常:', error);
        uni.switchTab({
          url: '/pages/teacher/index'
        });
      }
    },
    
    viewStudentDetail(student) {
      uni.showToast({
        title: `查看学生: ${student.studentName}`,
        icon: 'none'
      });
    },
    
    viewStudentGrade(student) {
      // 跳转到成绩管理页面，携带学生ID和学生姓名
      // 使用本地存储临时保存学生信息，以便成绩页面可以获取
      uni.setStorageSync('selectedStudent', {
        studentId: student.studentId,
        studentName: student.studentName,
        studentNo: student.studentNo
      });
      
      // 跳转到成绩管理页面
      uni.navigateTo({
        url: '/pages/teacher/grade',
        success: () => {
          console.log('成功跳转到成绩管理页面');
        },
        fail: (err) => {
          console.error('跳转到成绩管理页面失败:', err);
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    },
    
    sendMessage(student) {
      uni.showToast({
        title: `发送消息给: ${student.studentName}`,
        icon: 'none'
      });
    },
    
    showSearch() {
      this.showSearchPanel = true;
    },
    
    hideSearch() {
      this.showSearchPanel = false;
    },
    
    clearSearch() {
      this.searchKey = '';
      this.initCardAnimations();
    },
    
    searchStudents() {
      this.hideSearch();
      this.initCardAnimations();
    },
    
    initCardAnimations() {
      this.cardAnimations = [];
      setTimeout(() => {
        this.filteredStudents.forEach((_, index) => {
          let animation = uni.createAnimation({
            duration: 300,
            timingFunction: 'ease',
            delay: index * 100
          });
          
          animation.opacity(1).translateY(0).step();
          this.cardAnimations[index] = animation.export();
        });
      }, 100);
    },
    
    getCardAnimation(index) {
      return this.cardAnimations[index];
    },
    
    // 使用本地模拟数据（仅当API请求失败时使用）
    useLocalDemoData() {
      // 模拟学生数据
      this.studentList = [
        {
          studentId: 1,
          studentNo: '2023001',
          studentName: '张三',
          majorName: '计算机科学与技术'
        },
        {
          studentId: 2,
          studentNo: '2023002',
          studentName: '李四',
          majorName: '计算机科学与技术'
        },
        {
          studentId: 3,
          studentNo: '2023003',
          studentName: '王五',
          majorName: '软件工程'
        },
        {
          studentId: 4,
          studentNo: '2022001',
          studentName: '赵六',
          majorName: '计算机科学与技术'
        },
        {
          studentId: 5,
          studentNo: '2022002',
          studentName: '钱七',
          majorName: '软件工程'
        }
      ];
      
      // 初始化动画
      this.initCardAnimations();
      this.isLoading = false;
    }
  }
}
</script>

<style lang="scss">
.student-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  padding-bottom: 40rpx;
}

/* 顶部导航栏样式 */
.header {
  height: 240rpx;
  position: relative;
  overflow: hidden;
  width: 100%;
  
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #faad14, #d48806);
    z-index: 1;
  }
  
  .header-content {
    position: relative;
    z-index: 2;
    padding: 60rpx 40rpx 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    
    .nav-back {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      
      .icon-svg {
        width: 40rpx;
        height: 40rpx;
        color: #ffffff;
      }
    }
    
    .page-title {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      font-size: 36rpx;
      color: #ffffff;
      font-weight: bold;
      text-align: center;
      z-index: 1;
      white-space: nowrap;
    }
    
    .header-actions {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36rpx;
      color: #ffffff;
      z-index: 2;
    }
  }
}

/* 过滤选项卡样式 */
.filter-tabs {
  display: flex;
  background-color: #ffffff;
  padding: 0 30rpx;
  height: 88rpx;
  
  .tab-item {
    padding: 0 30rpx;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    text {
      font-size: 28rpx;
      color: #666666;
      transition: color 0.3s;
    }
    
    &.active text {
      color: #faad14;
      font-weight: bold;
    }
    
    .tab-line {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 48rpx;
      height: 6rpx;
      background-color: #faad14;
      border-radius: 3rpx;
    }
  }
}

/* 学生列表样式 */
.student-list {
  padding: 30rpx;
  
  .student-card {
    background-color: #ffffff;
    border-radius: 16rpx;
    margin-bottom: 24rpx;
    padding: 24rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
    transform: translateY(30rpx);
    opacity: 0;
    
    .student-avatar {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      background-color: #faad14;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40rpx;
      font-weight: bold;
      margin-right: 24rpx;
    }
    
    .student-info {
      flex: 1;
      
      .student-name {
        font-size: 32rpx;
        font-weight: bold;
        color: #333333;
        margin-bottom: 8rpx;
      }
      
      .student-id {
        font-size: 26rpx;
        color: #999999;
        margin-bottom: 8rpx;
      }
      
      .student-meta {
        display: flex;
        
        .meta-item {
          font-size: 24rpx;
          color: #999999;
          background-color: #f5f5f5;
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
          margin-right: 16rpx;
        }
      }
    }
    
    .student-actions {
      display: flex;
      
      .action-btn {
        width: 100rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        
        text {
          font-size: 22rpx;
          color: #666666;
          margin-top: 6rpx;
        }
        
        &.grade-btn {
          color: #1890ff;
        }
        
        &.message-btn {
          color: #52c41a;
        }
      }
    }
  }
}

/* 加载中样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  .loading-spinner {
    width: 80rpx;
    height: 80rpx;
    border: 4rpx solid #f3f3f3;
    border-top: 4rpx solid #faad14;
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

/* 空状态样式 */
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
    font-size: 32rpx;
    color: #333333;
    font-weight: bold;
    margin-bottom: 16rpx;
  }
  
  .empty-desc {
    font-size: 26rpx;
    color: #999999;
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
    background-color: #faad14;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: bold;
  }
}

/* SVG图标样式 */
.icon-svg {
  width: 40rpx;
  height: 40rpx;
  color: #ffffff;
}

/* 使用Unicode字符替代图标 */
.icon-search:before { content: '\1F50D'; } /* 放大镜 🔍 */
.icon-grade:before { content: '\1F4D2'; } /* 笔记本 📒 */
.icon-message:before { content: '\1F4AC'; } /* 消息 💬 */
</style> 
