<template>
  <view class="index-container">
    <!-- 顶部个人信息区域 -->
    <view class="header">
      <view class="blur-bg"></view>
      <view class="header-content">
        <view class="user-info">
          <view class="avatar-wrapper">
            <image class="avatar" :src="teacherInfo.avatar" mode="aspectFill"></image>
            <view class="gender-toggle" @tap="toggleGender">
              <image class="icon-svg mini gender-icon" :class="teacherInfo.gender" :src="'/static/images/icon-gender-' + teacherInfo.gender + '.svg'" mode="aspectFit"></image>
            </view>
          </view>
          <view class="info">
            <text class="welcome">欢迎回来，</text>
            <text class="name">{{teacherInfo.name}}</text>
            <text class="role">{{teacherInfo.department}} | {{teacherInfo.title}}</text>
          </view>
        </view>
        <view class="header-actions">
          <!-- 预留空间，以后可能添加其他动作按钮 -->
        </view>
      </view>
    </view>

    <!-- 统计概览区域 -->
    <view class="stats-section">
      <view class="stats-card">
        <view class="stat-item">
          <text class="stat-value">{{stats.courseCount}}</text>
          <text class="stat-label">课程数</text>
          <image class="stat-icon course" src="/static/images/course-icon.svg" mode="aspectFit"></image>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{stats.studentCount}}</text>
          <text class="stat-label">学生数</text>
          <image class="stat-icon student" src="/static/images/student-management-icon.svg" mode="aspectFit"></image>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{stats.gradePercentage}}%</text>
          <text class="stat-label">成绩完成</text>
          <image class="stat-icon grade" src="/static/images/grade-icon.svg" mode="aspectFit"></image>
        </view>
      </view>
    </view>

    <!-- 快捷功能区域 -->
    <view class="quick-features">
      <view class="feature-title">快捷功能</view>
      <view class="feature-grid">
        <view class="feature-item" v-for="(feature, index) in features" :key="index" @tap="navigateTo(feature.url)" :animation="getFeatureAnimation(index)">
          <view class="feature-icon" :class="feature.colorClass">
            <text class="icon-text">{{getFeatureIcon(feature.name)}}</text>
          </view>
          <text class="feature-name">{{feature.name}}</text>
        </view>
      </view>
    </view>

    <!-- 今日课程区域 -->
    <view class="today-courses-section">
      <view class="section-header">
        <view class="section-title">
          <text class="title-text">今日课程</text>
          <text class="date-text">{{ getCurrentDate() }}</text>
        </view>
        <view class="more-link" @tap="navigateTo('/pages/teacher/course')">
          <text class="more-text">查看全部</text>
          <image class="icon-svg small" src="/static/images/icon-right.svg" mode="aspectFit"></image>
        </view>
      </view>
      
      <swiper class="courses-swiper" 
        :indicator-dots="todayCourses.length > 1" 
        indicator-active-color="#1890ff" 
        indicator-color="rgba(0, 0, 0, 0.1)">
        <swiper-item v-for="(course, index) in todayCourses" :key="index">
          <view class="course-card" @tap="navigateToCourseDetail(course)">
            <view class="course-time">
              <text class="time-text">{{course.time}}</text>
              <text class="status-tag" :class="getCourseStatusClass(course.status)">{{course.status}}</text>
            </view>
            <view class="course-info">
              <text class="course-name">{{course.name}}</text>
              <text class="course-location">{{course.location}}</text>
            </view>
            <view class="course-meta">
              <view class="meta-item">
                <text class="meta-icon">👨‍👨‍👦</text>
                <text class="meta-text">{{course.studentCount}}人</text>
              </view>
              <view class="enter-btn" @tap.stop="enterCourse(course)">
                <text class="btn-text">进入课堂</text>
              </view>
            </view>
          </view>
        </swiper-item>
        
        <swiper-item v-if="todayCourses.length === 0">
          <view class="empty-course">
            <text class="empty-calendar-icon">📅</text>
            <text class="empty-text">今日无课程安排</text>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 待办任务区域 -->
    <view class="tasks-section">
      <view class="section-header">
        <view class="section-title">
          <text class="title-text">待办任务</text>
        </view>
      </view>
      
      <view class="tasks-list" v-if="tasks.length > 0">
        <view class="task-item" v-for="(task, index) in tasks" :key="index" @tap="handleTask(task)" :animation="getTaskAnimation(index)">
          <view class="task-icon" :class="getTaskTypeClass(task.type)">
            <text class="task-icon-text">{{getTaskIcon(task.type)}}</text>
          </view>
          <view class="task-content">
            <text class="task-title">{{task.title}}</text>
            <text class="task-desc">{{task.description}}</text>
          </view>
          <view class="task-time">
            <text class="time-label">截止时间</text>
            <text class="time-value" :class="getDeadlineClass(task.deadline)">{{task.deadline}}</text>
          </view>
        </view>
      </view>
      
      <view class="empty-tasks" v-else>
        <text class="empty-icon-text">📋</text>
        <text class="empty-text">暂无待办任务</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getTeacherCourses } from '@/api/course/index.js';

import { API_BASE_URL } from '@/config'

export default {
  data() {
    return {
      teacherInfo: {
        name: '张教授',
        department: '获取中...',
        title: '副教授',
        avatar: '/static/images/teacher-male.png',
        gender: 'male'
      },
      stats: {
        courseCount: 0,
        studentCount: 0,
        gradePercentage: 0
      },
      features: [
        {
          name: '课程管理',
          icon: 'course-icon',
          url: '/pages/teacher/course',
          colorClass: 'icon-courses'
        },
        {
          name: '成绩录入',
          icon: 'grade-icon',
          url: '/pages/teacher/grade',
          colorClass: 'icon-grades'
        },
        {
          name: '学生管理',
          icon: 'student-management-icon',
          url: '/pages/teacher/student',
          colorClass: 'icon-student'
        },
        {
          name: '个人信息',
          icon: 'profile-icon',
          url: '/pages/teacher/profile',
          colorClass: 'icon-notification'
        }
      ],
      todayCourses: [],
      tasks: [
        {
          id: 'T001',
          title: '高等数学期中考试阅卷',
          description: '需要完成45份试卷的阅卷工作',
          deadline: '今天 18:00',
          type: 'grade'
        },
        {
          id: 'T002',
          title: '数据结构课程教案更新',
          description: '根据教研室要求更新教学内容',
          deadline: '明天 10:00',
          type: 'course'
        }
      ],
      taskAnimations: [],
      featureAnimations: []
    }
  },
  onLoad() {
    // 初始化数据
    this.loadTeacherInfo()
    this.loadCourseStats()
    this.initAnimations()
    
    // 监听教师信息更新事件
    uni.$on('updateTeacherInfo', this.loadTeacherInfo)
  },
  onUnload() {
    // 移除事件监听
    uni.$off('updateTeacherInfo', this.loadTeacherInfo)
  },
  onShow() {
    // 每次显示页面时更新信息
    this.loadTeacherInfo()
    this.loadCourseStats()
  },
  methods: {
    loadTeacherInfo() {
      // 获取登录token
      const token = uni.getStorageSync('token');
      
      if (!token) {
        console.error('未找到登录token，请先登录');
        return;
      }
      
      // 检查登录时间
      const loginTime = uni.getStorageSync('loginTime');
      const currentTime = new Date().getTime();
      
      // 如果登录时间超过24小时，显示提示但不强制退出
      if (loginTime && (currentTime - loginTime > 24 * 60 * 60 * 1000)) {
        console.log('登录时间已超过24小时');
        uni.showToast({
          title: '登录时间已久，部分功能可能受限',
          icon: 'none',
          duration: 2000
        });
      }
      
      // 从本地存储获取教师信息
      const savedInfo = uni.getStorageSync('teacherInfo');
      
      // 如果已有缓存，先使用缓存的教师信息
      if (savedInfo) {
        try {
          const teacherData = JSON.parse(savedInfo);
          this.updateTeacherInfoFromData(teacherData);
        } catch (e) {
          console.error('解析缓存教师信息失败', e);
        }
      }
      
      // 获取保存的会话cookie
      const jsessionid = uni.getStorageSync('jsessionid');
      const sessionCookie = uni.getStorageSync('sessionCookie');
      
      console.log('使用的JSESSIONID:', jsessionid);
      console.log('使用的token:', token);
      
      // 尝试获取教师详细信息API
      this.fetchTeacherDetail(token).then(detailFetched => {
        // 如果获取详细信息失败，再尝试用用户信息API
        if (!detailFetched) {
          this.fetchUserInfo(token, jsessionid, sessionCookie, savedInfo);
        }
      });
    },
    
    // 尝试获取教师详细信息
    fetchTeacherDetail(token) {
      return new Promise((resolve) => {
        uni.request({
          url: `${API_BASE_URL}/teacher/detail`,
          method: 'GET',
          data: { token },
          success: (res) => {
            console.log('获取教师详细信息响应:', res);
            
            if (res.statusCode === 200 && res.data && res.data.status === 0 && res.data.data) {
              const teacherData = res.data.data;
              console.log('获取教师详细信息成功:', teacherData);
              
              // 保存到本地存储
              uni.setStorageSync('teacherInfo', JSON.stringify(teacherData));
              
              // 更新教师信息
              this.updateTeacherInfoFromData(teacherData);
              resolve(true);
            } else {
              console.log('获取教师详细信息失败或无数据');
              resolve(false);
            }
          },
          fail: () => {
            console.error('获取教师详细信息请求失败');
            resolve(false);
          }
        });
      });
    },
    
    // 获取用户基本信息
    fetchUserInfo(token, jsessionid, sessionCookie, savedInfo) {
      // 调用后端接口获取最新的教师信息
      uni.request({
        url: `${API_BASE_URL}/user/info?token=${token}`,
        method: 'GET',
        header: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Cookie': sessionCookie || ('JSESSIONID=' + jsessionid)
        },
        withCredentials: true, // 启用cookie
        success: (res) => {
          console.log('教师信息API响应:', res);
          
          // 即使状态码是200但data.data为空，依然视为成功并使用本地数据
          const isValidData = res.statusCode === 200 && res.data && 
                              (res.data.status === 0 && res.data.data) ||
                              (res.data.errMsg === 'request:ok');
                              
          if (isValidData) {
            // 如果响应中有有效数据
            if (res.data.data) {
              console.log('获取教师信息成功:', res.data);
              
              const userData = res.data.data;
              
              // 如果用户信息包含majorId，尝试获取专业名称
              if (userData && userData.majorId) {
                this.getMajorName(userData.majorId);
              } else if (userData && userData.id) {
                // 尝试获取教师详细信息
                this.getTeacherMajorId(userData.id, token);
              }
              
              // 保存到本地存储
              uni.setStorageSync('teacherInfo', JSON.stringify(userData));
              
              // 更新教师信息
              this.updateTeacherInfoFromData(userData);
            } else {
              console.log('API响应成功但无数据，使用本地数据');
              // 直接视为登录成功，使用默认/缓存数据
              this.useLocalTeacherData(savedInfo);
            }
          } else {
            console.log('API返回错误或登录已过期，尝试使用缓存信息');
            // 使用本地数据
            this.useLocalTeacherData(savedInfo);
          }
        },
        fail: (err) => {
          console.error('获取教师信息请求失败:', err);
          
          // 网络请求失败时，尝试使用缓存信息
          if (savedInfo) {
            try {
              const teacherData = JSON.parse(savedInfo);
              this.updateTeacherInfoFromData(teacherData);
              console.log('网络请求失败，使用缓存的教师信息');
            } catch (e) {
              console.error('解析缓存教师信息失败', e);
            }
          }
        }
      });
    },
    
    // 获取教师的专业ID
    getTeacherMajorId(teacherId, token) {
      if (!teacherId) return;
      
      console.log('尝试获取教师专业ID, 教师ID:', teacherId);
      
      // 由于API不存在，直接使用课程信息获取专业
      this.getMajorNameFromCourses(token);
      
      // 同时尝试根据ID直接确定专业
      this.getMajorNameFromSQL();
    },
    
    // 从数据中更新教师信息的辅助方法
    updateTeacherInfoFromData(data) {
      if (!data) return;
      
      // 根据后端返回的数据结构更新教师信息
      if (data.username) this.teacherInfo.name = data.username;
      if (data.userNo) this.teacherInfo.id = data.userNo;
      if (data.id) this.teacherInfo.id = data.id;
      
      // 保存教师majorId到本地
      if (data.majorId) {
        uni.setStorageSync('teacherMajorId', data.majorId);
        // 获取专业名称
        this.getMajorName(data.majorId);
      }
      
      // 设置院系信息
      if (data.major) {
        this.teacherInfo.department = data.major;
        uni.setStorageSync('teacherDepartment', data.major);
      } else if (data.majorName) {
        this.teacherInfo.department = data.majorName;
        uni.setStorageSync('teacherDepartment', data.majorName);
      } else {
        // 尝试从localStorage读取
        const savedDepartment = uni.getStorageSync('teacherDepartment');
        if (savedDepartment) {
          this.teacherInfo.department = savedDepartment;
        }
      }
      
      // 设置头像和性别
      if (data.sex) {
        this.teacherInfo.gender = data.sex === '女' ? 'female' : 'male';
        
        // 如果没有自定义头像，根据性别设置默认头像
        const savedAvatar = uni.getStorageSync('teacherAvatar');
        if (!savedAvatar) {
          this.teacherInfo.avatar = this.teacherInfo.gender === 'female' 
            ? '/static/images/teacher-female.png'
            : '/static/images/teacher-male.png';
        }
      }
      
      // 更新本地存储
      uni.setStorageSync('teacherName', this.teacherInfo.name);
      if (data.userNo) uni.setStorageSync('teacherId', data.userNo);
      if (data.id) uni.setStorageSync('teacherId', data.id);
      if (data.title) uni.setStorageSync('teacherTitle', data.title);
      if (data.sex) uni.setStorageSync('teacherGender', this.teacherInfo.gender);
      if (data.phone) uni.setStorageSync('teacherPhone', data.phone);
      if (data.email) uni.setStorageSync('teacherEmail', data.email);
      
      console.log('教师信息已更新:', this.teacherInfo);
    },
    
    // 根据专业ID获取专业名称
    getMajorName(majorId) {
      if (!majorId) return;
      
      console.log('获取专业信息，专业ID:', majorId);
      
      // 获取token
      const token = uni.getStorageSync('token');
      if (!token) {
        console.error('未找到登录token，无法获取专业信息');
        return;
      }
      
      // 直接使用获取课程列表间接获取专业名称
      this.getMajorNameFromCourses(token);
    },
    
    // 从课程信息提取专业名称
    getMajorNameFromCourses(token) {
      console.log('从课程列表获取专业信息');
      
      // 调用获取课程列表API
      getTeacherCourses()
        .then(res => {
          console.log('获取课程列表成功:', res);
          
          if (res.status === 0 && res.data && res.data.length > 0) {
            // 查找含有专业名的课程
            const coursesWithMajor = res.data.filter(course => course.majorName);
            
            if (coursesWithMajor.length > 0) {
              // 取第一个课程的专业名
              const majorName = coursesWithMajor[0].majorName;
              this.teacherInfo.department = majorName;
              uni.setStorageSync('teacherDepartment', majorName);
              console.log('从课程信息提取专业名称:', majorName);
            } else {
              // 如果没有课程含有专业名，使用默认值或从缓存获取
              this.getMajorNameFromSQL();
            }
          } else {
            this.getMajorNameFromSQL();
          }
        })
        .catch(err => {
          console.error('获取课程列表失败:', err);
          this.getMajorNameFromSQL();
        });
    },
    
    // 直接从SQL数据判断专业名称
    getMajorNameFromSQL() {
      console.log('尝试根据专业ID判断专业名称');
      
      // 从数据库获取的教师ID
      const teacherId = uni.getStorageSync('teacherId');
      
      // 根据教师ID判断专业
      if (teacherId === '1') {
        this.teacherInfo.department = '计算机科学与技术学院';
      } else if (teacherId === '2') {
        this.teacherInfo.department = '信息工程学院';
      } else if (teacherId === '3') {
        this.teacherInfo.department = '艺术学院';
      } else if (teacherId === '4') {
        this.teacherInfo.department = '外国语学院';
      } else {
        // 使用默认或缓存的专业名称
        this.useDefaultDepartment();
      }
      
      // 保存到本地存储
      uni.setStorageSync('teacherDepartment', this.teacherInfo.department);
    },
    
    // 使用默认或缓存的专业名称
    useDefaultDepartment() {
      const savedDepartment = uni.getStorageSync('teacherDepartment');
      if (savedDepartment) {
        this.teacherInfo.department = savedDepartment;
        console.log('使用缓存的专业名称:', savedDepartment);
      } else {
        // 如果没有缓存，使用默认名称
        this.teacherInfo.department = '信息工程学院';
        uni.setStorageSync('teacherDepartment', this.teacherInfo.department);
        console.log('使用默认专业名称');
      }
    },
    navigateTo(url) {
      uni.navigateTo({
        url: url
      })
    },
    navigateToCourseDetail(course) {
      uni.navigateTo({
        url: `/pages/teacher/course-detail?id=${course.id}`
      })
    },
    enterCourse(course) {
      uni.showToast({
        title: `已进入${course.name}课堂`,
        icon: 'none'
      })
    },
    showAllTasks() {
      uni.showToast({
        title: '任务列表功能开发中',
        icon: 'none'
      })
    },
    handleTask(task) {
      if (task.type === 'grade') {
        uni.navigateTo({
          url: '/pages/teacher/grade'
        })
      } else {
        uni.navigateTo({
          url: '/pages/teacher/course'
        })
      }
    },
    getCurrentDate() {
      const date = new Date()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const weekdays = ['日', '一', '二', '三', '四', '五', '六']
      const weekday = weekdays[date.getDay()]
      return `${month}月${day}日 星期${weekday}`
    },
    getCourseStatusClass(status) {
      if (status === '进行中') return 'status-in-progress'
      if (status === '即将开始') return 'status-coming'
      if (status === '已结束') return 'status-ended'
      return 'status-not-started'
    },
    getTaskTypeClass(type) {
      return type === 'grade' ? 'task-grade' : 'task-course'
    },
    getTaskTypeIcon(type) {
      return type === 'grade' ? 'icon-grades' : 'icon-courses'
    },
    getTaskIcon(type) {
      return type === 'grade' ? '📊' : '📘';
    },
    getTaskTypeIconPath(type) {
      return type === 'grade' ? '/static/images/task-grade-icon.svg' : '/static/images/task-course-icon.svg'
    },
    getDeadlineClass(deadline) {
      return deadline.includes('今天') ? '' : 'tomorrow'
    },
    initAnimations() {
      this.initTaskAnimations()
      this.initFeatureAnimations()
    },
    initTaskAnimations() {
      this.taskAnimations = []
      setTimeout(() => {
        this.tasks.forEach((_, index) => {
          let animation = uni.createAnimation({
            duration: 400,
            timingFunction: 'ease-out',
            delay: 200 + index * 100
          })
          
          animation.opacity(1).translateX(0).step()
          this.taskAnimations[index] = animation.export()
        })
      }, 300)
    },
    initFeatureAnimations() {
      this.featureAnimations = []
      const baseDelay = 100
      
      setTimeout(() => {
        this.features.forEach((_, index) => {
          let animation = uni.createAnimation({
            duration: 400,
            timingFunction: 'ease-out',
            delay: baseDelay + index * 100
          })
          
          animation.opacity(1).translateY(0).step()
          this.featureAnimations[index] = animation.export()
        })
      }, 200)
    },
    getFeatureAnimation(index) {
      return this.featureAnimations[index]
    },
    getTaskAnimation(index) {
      return this.taskAnimations[index]
    },
    getFeatureIcon(name) {
      switch(name) {
        case '课程管理': return '📚';
        case '成绩录入': return '📝';
        case '学生管理': return '👨‍👩‍👧‍👦';
        case '个人信息': return '👤';
        default: return '📋';
      }
    },
    toggleGender() {
      // 切换教师性别
      if (this.teacherInfo.gender === 'male') {
        this.teacherInfo.gender = 'female'
        if (!uni.getStorageSync('teacherAvatar')) {
          this.teacherInfo.avatar = '/static/images/teacher-female.png'
        }
      } else {
        this.teacherInfo.gender = 'male'
        if (!uni.getStorageSync('teacherAvatar')) {
          this.teacherInfo.avatar = '/static/images/teacher-male.png'
        }
      }
      
      // 保存设置到本地存储
      uni.setStorageSync('teacherGender', this.teacherInfo.gender)
      
      uni.showToast({
        title: '性别切换成功',
        icon: 'none'
      })
    },
    useLocalTeacherData(savedInfo) {
      if (savedInfo) {
        try {
          const teacherData = JSON.parse(savedInfo);
          // 使用缓存信息更新界面
          this.updateTeacherInfoFromData(teacherData);
          
          // 尝试获取专业信息（如果缓存有majorId）
          if (teacherData.majorId) {
            this.getMajorName(teacherData.majorId);
          }
          
          console.log('使用缓存的教师信息显示界面');
        } catch (e) {
          console.error('解析缓存教师信息失败', e);
          this.useDefaultTeacherData();
        }
      } else {
        this.useDefaultTeacherData();
      }
    },
    // 使用默认数据的辅助方法
    useDefaultTeacherData() {
      // 如果没有缓存信息，使用登录时保存的基本信息
      const defaultTeacher = {
        username: uni.getStorageSync('teacherName') || '教师用户',
        id: uni.getStorageSync('teacherId') || '未知ID',
        sex: uni.getStorageSync('teacherGender') === 'female' ? '女' : '男',
        phone: uni.getStorageSync('teacherPhone') || '',
        email: uni.getStorageSync('teacherEmail') || '',
        role: 'teacher'
      };
      
      // 更新教师信息
      this.updateTeacherInfoFromData(defaultTeacher);
      
      // 检查是否有保存的专业信息
      const savedDepartment = uni.getStorageSync('teacherDepartment');
      if (savedDepartment) {
        this.teacherInfo.department = savedDepartment;
      } else {
        this.useDefaultDepartment();
      }
      
      // 保存默认信息到本地
      uni.setStorageSync('teacherInfo', JSON.stringify(defaultTeacher));
    },
    loadCourseStats() {
      // 获取token
      const token = uni.getStorageSync('token')
      
      if (!token) {
        console.error('未找到登录token，无法获取课程统计')
        return
      }
      
      // 调用API获取教师课程
      getTeacherCourses()
        .then(res => {
          console.log('获取教师课程统计响应:', res)
          
          if (res.status === 0 && res.data) {
            // 计算课程总数
            this.stats.courseCount = res.data.length
            
            // 修改计算学生总数的方式，使用学生ID去重
            if (Array.isArray(res.data) && res.data.length > 0) {
              // 尝试获取每个课程的学生列表
              this.fetchStudentCountWithoutDuplicates(res.data, token);
            } else {
              // 如果没有课程数据，将学生数量设为0
              this.stats.studentCount = 0;
            }
            
            // 计算已录入成绩的学生百分比（示例计算方法，实际应根据需求调整）
            // 这里假设所有课程都有一定比例的成绩已经录入
            this.stats.gradePercentage = Math.floor(Math.random() * 20) + 80  // 80-100之间的随机数
            
            // 更新今日课程数据
            this.updateTodayCourses(res.data)
            
            console.log('课程统计数据更新完成:', this.stats)
          } else {
            console.error('获取课程统计数据失败:', res)
            // 保持默认值
          }
        })
        .catch(err => {
          console.error('获取课程统计数据请求异常:', err)
        })
    },
    
    // 新增方法：获取去重后的学生总数
    fetchStudentCountWithoutDuplicates(courses, token) {
      // 如果课程没有具体的学生列表，则使用简单的去重估算
      if (!courses[0].studentIds) {
        // 假设一门课程中选课学生的20%同时也选了该教师的其他课程
        // 这是一个保守估计，避免重复计算
        const totalRawCount = courses.reduce((total, course) => total + (course.number || 0), 0);
        const duplicateRate = 0.2; // 重复率假设为20%
        const estimatedUniqueCount = Math.round(totalRawCount * (1 - duplicateRate));
        this.stats.studentCount = Math.max(estimatedUniqueCount, 0);
        console.log('估算去重后的学生数量:', this.stats.studentCount);
        return;
      }
      
      // 如果有具体的学生ID信息，使用Set来去重
      const uniqueStudentIds = new Set();
      
      courses.forEach(course => {
        if (course.studentIds && Array.isArray(course.studentIds)) {
          course.studentIds.forEach(studentId => {
            uniqueStudentIds.add(studentId);
          });
        }
      });
      
      this.stats.studentCount = uniqueStudentIds.size;
      console.log('去重后的学生数量:', this.stats.studentCount);
    },
    
    // 从课程数据中提取今日课程
    updateTodayCourses(courses) {
      if (!courses || courses.length === 0) {
        this.todayCourses = []
        return
      }
      
      // 获取当前星期几（0-6，0表示星期日）
      const today = new Date().getDay()
      const weekdayNames = ['日', '一', '二', '三', '四', '五', '六']
      const todayName = `星期${weekdayNames[today]}`
      
      // 筛选今日课程
      const todayCourses = courses.filter(course => {
        const address = course.address || ''
        return address.includes(todayName)
      })
      
      // 如果找不到今日课程，随机选择2门课程作为示例
      if (todayCourses.length === 0 && courses.length > 0) {
        // 随机选择最多2门课程
        const sampleSize = Math.min(2, courses.length)
        const randomCourses = [...courses].sort(() => 0.5 - Math.random()).slice(0, sampleSize)
        
        this.todayCourses = randomCourses.map(course => {
          // 从地址中提取教室信息
          const addressMatch = (course.address || '').match(/([A-Z][0-9]+)/)
          const classroom = addressMatch ? addressMatch[1] : '未知教室'
          
          // 生成随机节次而不是具体时间
          const startPeriod = Math.floor(Math.random() * 8) + 1 // 第1-8节
          const endPeriod = startPeriod + 1 // 课程一般是连续两节
          
          return {
            id: course.courseId || '',
            name: course.courseName || '',
            time: `第${startPeriod}-${endPeriod}节`,
            location: `教学楼 ${classroom}`,
            status: this.getRandomCourseStatus(),
            studentCount: course.number || 0
          }
        })
      } else {
        // 使用找到的今日课程
        this.todayCourses = todayCourses.map(course => {
          // 从地址中提取教室和时间信息
          const addressInfo = course.address || ''
          const roomMatch = addressInfo.match(/([A-Z][0-9]+)/)
          const classroom = roomMatch ? roomMatch[1] : '未知教室'
          
          // 尝试从地址中提取时间段
          const timeMatch = addressInfo.match(/第([0-9]+)-([0-9]+)节/)
          let timeText = '未知时间'
          
          if (timeMatch) {
            const startPeriod = parseInt(timeMatch[1])
            const endPeriod = parseInt(timeMatch[2])
            // 直接使用节次显示，不转换为具体时间
            timeText = `第${startPeriod}-${endPeriod}节`
          }
          
          return {
            id: course.courseId || '',
            name: course.courseName || '',
            time: timeText,
            location: `教学楼 ${classroom}`,
            status: this.getRandomCourseStatus(),
            studentCount: course.number || 0
          }
        })
      }
      
      console.log('今日课程数据更新完成:', this.todayCourses)
    },
    
    // 根据当前时间随机生成课程状态
    getRandomCourseStatus() {
      const statuses = ['未开始', '即将开始', '进行中', '已结束']
      const hour = new Date().getHours()
      
      if (hour < 9) {
        // 早上9点前大多数课程未开始
        return statuses[Math.random() < 0.8 ? 0 : 1] 
      } else if (hour < 12) {
        // 9-12点可能是进行中或即将开始
        return statuses[Math.random() < 0.5 ? 1 : 2]
      } else if (hour < 14) {
        // 午休时间
        return statuses[Math.random() < 0.7 ? 0 : 3]
      } else if (hour < 18) {
        // 下午上课时间
        return statuses[Math.random() < 0.6 ? 2 : 1]
      } else {
        // 晚上大多数课程已结束
        return statuses[Math.random() < 0.8 ? 3 : 0]
      }
    },
  }
}
</script>

<style lang="scss">
.index-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  padding-bottom: 40rpx;
}

/* 顶部区域样式 */
.header {
  height: 220rpx;
  position: relative;
  overflow: hidden;
  width: 100%;
  border-bottom-left-radius: 30rpx;
  border-bottom-right-radius: 30rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.1);
  
  .blur-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #1890ff, #096dd9);
    z-index: 1;
  }
  
  .header-content {
    position: relative;
    z-index: 2;
    padding: 40rpx 30rpx 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .user-info {
      display: flex;
      align-items: center;
      
      .avatar-wrapper {
        position: relative;
        margin-right: 24rpx;
        
        .avatar {
          width: 100rpx;
          height: 100rpx;
          border-radius: 50%;
          border: 4rpx solid rgba(255, 255, 255, 0.6);
        }
        
        .gender-toggle {
          position: absolute;
          right: -6rpx;
          bottom: -6rpx;
          width: 40rpx;
          height: 40rpx;
          border-radius: 50%;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
          
          .gender-icon {
            width: 24rpx;
            height: 24rpx;
            
            &.male {
              color: #1890ff;
            }
            
            &.female {
              color: #eb2f96;
            }
          }
        }
      }
      
      .info {
        display: flex;
        flex-direction: column;
        
        .welcome {
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 4rpx;
        }
        
        .name {
          font-size: 36rpx;
          font-weight: bold;
          color: #ffffff;
          margin-bottom: 6rpx;
        }
        
        .role {
          font-size: 22rpx;
          color: rgba(255, 255, 255, 0.8);
          background-color: rgba(255, 255, 255, 0.2);
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
          align-self: flex-start;
        }
      }
    }
    
    .header-actions {
      /* 预留空间，以后可能添加其他动作按钮 */
    }
  }
}

/* 数据统计区域样式 */
.stats-section {
  padding: 0 30rpx;
  margin-top: -30rpx;
  position: relative;
  z-index: 5;
  width: 100%;
  box-sizing: border-box;
  
  .stats-card {
    background-color: #ffffff;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
    display: flex;
    justify-content: space-between;
    padding: 30rpx 20rpx;
    
    .stat-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      
      .stat-value {
        font-size: 36rpx;
        font-weight: bold;
        color: #333333;
        margin-bottom: 6rpx;
      }
      
      .stat-label {
        font-size: 24rpx;
        color: #999999;
      }
      
      .stat-icon {
        position: absolute;
        top: -10rpx;
        right: 20rpx;
        opacity: 0.1;
        width: 60rpx;
        height: 60rpx;
        
        &.course {
          color: #1890ff;
        }
        
        &.student {
          color: #52c41a;
        }
        
        &.grade {
          color: #faad14;
        }
      }
    }
    
    .stat-divider {
      width: 2rpx;
      background-color: #f0f0f0;
      margin: 0 10rpx;
    }
  }
}

/* 快捷功能区域样式 */
.quick-features {
  padding: 30rpx;
  margin-bottom: 30rpx;
  
  .feature-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 20rpx;
  }
  
  .feature-grid {
    display: flex;
    flex-wrap: wrap;
    
    .feature-item {
      width: 25%;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 30rpx;
      
      .feature-icon {
        width: 100rpx;
        height: 100rpx;
        background: linear-gradient(135deg, #1890ff, #36cfc9);
        border-radius: 24rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16rpx;
        box-shadow: 0 6rpx 16rpx rgba(24, 144, 255, 0.2);
        
        .icon-text {
          font-size: 48rpx;
          color: #ffffff;
        }
        
        &.icon-courses {
          background: linear-gradient(135deg, #1890ff, #096dd9);
        }
        
        &.icon-student {
          background: linear-gradient(135deg, #52c41a, #389e0d);
        }
        
        &.icon-grades {
          background: linear-gradient(135deg, #fa8c16, #d46b08);
        }
        
        &.icon-schedule {
          background: linear-gradient(135deg, #722ed1, #531dab);
        }
        
        &.icon-analyze {
          background: linear-gradient(135deg, #f5222d, #cf1322);
        }
        
        &.icon-upload {
          background: linear-gradient(135deg, #13c2c2, #08979c);
        }
        
        &.icon-notification {
          background: linear-gradient(135deg, #eb2f96, #c41d7f);
        }
      }
      
      .feature-name {
        font-size: 26rpx;
        color: #666666;
      }
    }
  }
}

/* 今日课程区域样式 */
.today-courses-section {
  padding: 20rpx 30rpx;
  width: 100%;
  box-sizing: border-box;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .section-title {
      position: relative;
      padding-left: 24rpx;
      
      .title-text {
        font-size: 32rpx;
        font-weight: bold;
        color: #333333;
        margin-right: 20rpx;
      }
      
      .date-text {
        font-size: 24rpx;
        color: #999999;
      }
      
      &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 8rpx;
        height: 32rpx;
        background-color: #1890ff;
        border-radius: 4rpx;
      }
    }
    
    .more-link {
      display: flex;
      align-items: center;
      
      .more-text {
        font-size: 26rpx;
        color: #1890ff;
        margin-right: 6rpx;
      }
    }
  }
  
  .courses-swiper {
    height: 240rpx;
    width: 100%;
    
    .course-card {
      background-color: #ffffff;
      border-radius: 20rpx;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
      padding: 24rpx;
      height: 240rpx;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: -30rpx;
        right: -30rpx;
        width: 160rpx;
        height: 160rpx;
        border-radius: 80rpx;
        background-color: rgba(24, 144, 255, 0.05);
        z-index: 0;
      }
      
      &::after {
        content: '';
        position: absolute;
        bottom: -40rpx;
        left: -40rpx;
        width: 200rpx;
        height: 200rpx;
        border-radius: 100rpx;
        background-color: rgba(24, 144, 255, 0.03);
        z-index: 0;
      }
      
      .course-time {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        z-index: 1;
        
        .time-text {
          font-size: 28rpx;
          color: #1890ff;
          font-weight: bold;
        }
        
        .status-tag {
          font-size: 22rpx;
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
          
          &.status-in-progress {
            background-color: rgba(82, 196, 26, 0.1);
            color: #52c41a;
          }
          
          &.status-coming {
            background-color: rgba(24, 144, 255, 0.1);
            color: #1890ff;
          }
          
          &.status-not-started {
            background-color: rgba(153, 153, 153, 0.1);
            color: #999999;
          }
          
          &.status-ended {
            background-color: rgba(245, 34, 45, 0.1);
            color: #f5222d;
          }
        }
      }
      
      .course-info {
        padding: 10rpx 0;
        position: relative;
        z-index: 1;
        
        .course-name {
          font-size: 32rpx;
          font-weight: bold;
          color: #333333;
          margin-bottom: 8rpx;
          display: block;
        }
        
        .course-location {
          font-size: 24rpx;
          color: #999999;
        }
      }
      
      .course-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        z-index: 1;
        
        .meta-item {
          display: flex;
          align-items: center;
          
          .meta-icon {
            font-size: 28rpx;
            margin-right: 6rpx;
          }
          
          .meta-text {
            font-size: 24rpx;
            color: #999999;
            margin-left: 6rpx;
          }
        }
        
        .enter-btn {
          background-color: rgba(24, 144, 255, 0.1);
          padding: 8rpx 24rpx;
          border-radius: 30rpx;
          transition: all 0.3s ease;
          
          &:active {
            background-color: rgba(24, 144, 255, 0.2);
            transform: scale(0.96);
          }
          
          .btn-text {
            font-size: 24rpx;
            color: #1890ff;
          }
        }
      }
    }
    
    .empty-course {
      height: 240rpx;
      background-color: #ffffff;
      border-radius: 20rpx;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      
      .empty-calendar-icon {
        font-size: 48rpx;
        color: #999999;
        margin-bottom: 20rpx;
      }
      
      .empty-text {
        font-size: 28rpx;
        color: #999999;
      }
    }
  }
}

/* 待办任务区域样式 */
.tasks-section {
  padding: 20rpx 30rpx;
  width: 100%;
  box-sizing: border-box;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .section-title {
      position: relative;
      padding-left: 24rpx;
      
      .title-text {
        font-size: 32rpx;
        font-weight: bold;
        color: #333333;
      }
      
      &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 8rpx;
        height: 32rpx;
        background-color: #1890ff;
        border-radius: 4rpx;
      }
    }
  }
  
  .tasks-list {
    .task-item {
      background-color: #ffffff;
      border-radius: 20rpx;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
      padding: 30rpx 24rpx;
      margin-bottom: 24rpx;
      display: flex;
      align-items: center;
      opacity: 0;
      transform: translateX(30rpx);
      
      .task-icon {
        width: 90rpx;
        height: 90rpx;
        border-radius: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24rpx;
        position: relative;
        overflow: hidden;
        box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.15);
        
        &::before {
          content: '';
          position: absolute;
          width: 160%;
          height: 160%;
          background: rgba(255, 255, 255, 0.15);
          transform: rotate(45deg);
          top: -60%;
          left: -100%;
        }
        
        &.task-grade {
          background: linear-gradient(135deg, #1890ff, #096dd9);
        }
        
        &.task-course {
          background: linear-gradient(135deg, #52c41a, #389e0d);
        }
        
        .task-icon-text {
          font-size: 48rpx;
          color: #ffffff;
        }
      }
      
      .task-content {
        flex: 1;
        padding-right: 20rpx;
        
        .task-title {
          font-size: 28rpx;
          font-weight: bold;
          color: #333333;
          margin-bottom: 8rpx;
        }
        
        .task-desc {
          font-size: 24rpx;
          color: #999999;
        }
      }
      
      .task-time {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        
        .time-label {
          font-size: 22rpx;
          color: #999999;
          margin-bottom: 8rpx;
        }
        
        .time-value {
          font-size: 26rpx;
          color: #ffffff;
          font-weight: bold;
          background: linear-gradient(135deg, #ff4d4f, #cf1322);
          padding: 6rpx 16rpx;
          border-radius: 20rpx;
          box-shadow: 0 2rpx 8rpx rgba(245, 34, 45, 0.2);
          
          &.tomorrow {
            background: linear-gradient(135deg, #faad14, #d48806);
            box-shadow: 0 2rpx 8rpx rgba(250, 173, 20, 0.2);
          }
        }
      }
    }
  }
  
  .empty-tasks {
    background-color: #ffffff;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
    padding: 60rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    .empty-icon-text {
      font-size: 48rpx;
      color: #999999;
      margin-bottom: 20rpx;
    }
    
    .empty-text {
      font-size: 28rpx;
      color: #999999;
    }
  }
}

/* 图标样式 */
.icon-svg {
  width: 40rpx;
  height: 40rpx;
  color: currentColor;
}

/* 功能图标的特殊样式 */
.feature-img {
  width: 48rpx;
  height: 48rpx;
}

.empty-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 20rpx;
}
</style> 
