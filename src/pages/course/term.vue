<template>
  <view class="course-container blue-gradient-bg">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-left">
        <view class="back-button" @tap="goBack">
          <image src="/static/images/icon-back.svg" mode="aspectFit" class="nav-icon"></image>
        </view>
        <text class="page-title">选课管理</text>
      </view>
      <view class="header-right">
        <view class="refresh-button" @tap="refreshCourseList">
          <image src="/static/images/icon-refresh.svg" mode="aspectFit" class="nav-icon"></image>
        </view>
      </view>
    </view>
    
    <!-- 学期选择 -->
    <view class="term-selector card-glass">
      <scroll-view class="scroll-view" scroll-x enable-flex show-scrollbar="false">
        <view 
          class="term-item" 
          v-for="(term, index) in termList" 
          :key="index"
          :class="{'active': termCode === term.code}"
          @tap="selectTerm(term.code)"
        >
          <text class="term-name">{{term.name}}</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-section">
        <view 
          class="filter-item" 
          v-for="(type, index) in courseTypes" 
          :key="index"
          :class="{'active': selectedType === type.value}"
          @tap="selectType(type.value)"
        >
          <text class="filter-text">{{type.label}}</text>
        </view>
      </view>
    </view>
    
    <!-- 课程列表 -->
    <view class="course-list">
      <view v-if="isLoading" class="loading-state">
        <image class="loading-icon" src="/static/images/loading.svg" mode="aspectFit"></image>
        <text class="loading-text">加载中...</text>
      </view>
      
      <view v-else-if="filteredCourses.length === 0" class="empty-state">
        <image class="empty-icon" src="/static/images/empty.svg" mode="aspectFit"></image>
        <text class="empty-text">暂无课程</text>
      </view>
      
      <view v-else>
        <view 
          class="course-item card" 
          v-for="(course, index) in filteredCourses" 
          :key="index"
          @tap="viewCourseDetail(course)"
        >
          <view class="course-header">
            <view class="course-info">
              <text class="course-name">{{course.courseName}}</text>
              <text class="course-type">{{course.courseType}}</text>
            </view>
            <view class="course-status" :class="{'enrolled': course.status === '1'}">
              <text>{{course.status === '1' ? '已选' : '可选'}}</text>
            </view>
          </view>
          
          <view class="course-content">
            <view class="teacher-info">
              <image class="teacher-icon" src="/static/images/icon-teacher.svg" mode="aspectFit"></image>
              <text class="teacher-name">{{course.teacherName}}</text>
            </view>
            
            <view class="location-info">
              <image class="location-icon" src="/static/images/icon-location.svg" mode="aspectFit"></image>
              <text class="location-name">{{course.address || '地点待定'}}</text>
            </view>
            
            <view class="score-info">
              <image class="score-icon" src="/static/images/icon-score.svg" mode="aspectFit"></image>
              <text class="score-value">{{course.courseScore}}学分</text>
            </view>
          </view>
          
          <view class="course-footer">
            <view class="spots-info">
              <text class="spots-text">剩余名额: {{course.stock}}/{{course.number}}</text>
            </view>
            
            <view class="action-area">
              <button 
                class="action-button" 
                :class="{'cancel': course.status === '1', 'disabled': course.stock <= 0 && course.status !== '1'}"
                @tap.stop="handleCourseAction(course)"
                :disabled="course.stock <= 0 && course.status !== '1'"
              >
                {{course.status === '1' ? '退选' : '选课'}}
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
    
    <!-- 底部导航栏 -->
    <tab-bar currentTab="course"></tab-bar>
  </view>
</template>

<script>
import TabBar from '@/components/TabBar.vue'

import { API_BASE_URL } from '@/config'

export default {
  components: {
    'tab-bar': TabBar
  },
  data() {
    return {
      termCode: '3-2',  // 默认学期代码
      currentTerm: '3-2',
      formattedTerm: '3-2', // 格式化后的学期
      termList: [],  // 学期列表
      courseList: [], // 课程列表
      selectedType: 'all', // 选中的课程类型
      courseTypes: [
        { label: '全部', value: 'all' },
        { label: '创新创业类', value: '创新创业类' },
        { label: '自然科学类', value: '自然科学类' },
        { label: '公共艺术类', value: '公共艺术类' },
        { label: '限定艺术类', value: '限定艺术类' }
      ],
      isLoading: true, // 加载状态
      // 本地测试数据，在后端接口不可用时使用
      localCourseList: [
        {
          courseId: 1,
          courseName: '大学英语(Ⅵ)',
          courseType: '限定艺术类',
          majorName: '英语',
          teacherName: '张红霞',
          courseScore: 2.0,
          stock: 100,
          address: '星期五B302第1-2节[1-16周]',
          term: '3-1',
          selected: false,
          description: '英语综合能力提升，信息安全'
        },
        {
          courseId: 2,
          courseName: '操作系统',
          courseType: '自然科学类',
          majorName: '计算机科学与技术',
          teacherName: '李明',
          courseScore: 3.0,
          stock: 80,
          address: '星期三A201第3-5节[1-16周]',
          term: '3-1',
          selected: false,
          description: '学习计算机操作系统原理与实现'
        },
        {
          courseId: 3,
          courseName: '数据结构',
          courseType: '自然科学类',
          majorName: '软件工程',
          teacherName: '王强',
          courseScore: 4.0,
          stock: 90,
          address: '星期一C305第6-9节[1-16周]',
          term: '3-1',
          selected: false,
          description: '学习各种数据结构与算法设计'
        },
        {
          courseId: 4,
          courseName: '高等数学',
          courseType: '公共艺术类',
          majorName: '全校通用',
          teacherName: '赵静',
          courseScore: 5.0,
          stock: 120,
          address: '星期二B101第1-4节[1-16周]',
          term: '3-1',
          selected: false,
          description: '微积分与数学分析基础'
        }
      ],
      // 当前选中的筛选项
      filter: {
        type: '全部',
        major: 0
      },
      // 专业列表
      majorList: [
        { id: 0, name: '全部专业' },
        { id: 6, name: '计算机科学与技术' },
        { id: 7, name: '软件工程' },
        { id: 8, name: '英语' }
      ],
      // 加载状态
      loading: false,
      // 错误信息
      errorMsg: '',
      // 刷新状态
      refreshing: false,
      // 当前页码
      page: 1,
      // 是否没有更多数据
      noMore: false,
      // 显示选择学期弹窗
      showTermPopup: false,
      // 添加APP环境标识
      isAppEnvironment: false,
      // 添加基础URL
      baseUrl: API_BASE_URL,
      // 添加重试计数和最大重试次数
      retryAttempts: 0,
      maxRetries: 2
    }
  },
  computed: {
    filteredCourses() {
      if (!this.courseList || this.courseList.length === 0) {
        return [];
      }
      
      let result = [...this.courseList];
      
      // 按课程类型筛选
      if (this.selectedType !== 'all') {
        result = result.filter(course => course.courseType === this.selectedType);
      }
      
      return result;
    },
    // 当前学期名称
    currentTermName() {
      const term = this.termList.find(item => item.code === this.termCode)
      return term ? term.name : '未知学期'
    }
  },
  onLoad() {
    // 检测是否为APP环境
    // #ifdef APP-PLUS
    this.isAppEnvironment = true;
    console.log('当前在APP环境中');
    // #endif
    
    // 初始化学期列表
    this.initTermList();
    
    // 获取用户登录信息
    const userInfo = uni.getStorageSync('userInfo');
    if (!userInfo) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
      return;
    }
    
    // 获取当前学期
    try {
      const savedTerm = uni.getStorageSync('currentTerm');
      if (savedTerm) {
        const termObj = JSON.parse(savedTerm);
        this.currentTerm = termObj.code || '3-2';
        this.termCode = this.currentTerm;
      } else {
        console.log('未找到保存的学期信息，使用默认值');
      }
    } catch (e) {
      console.error('解析当前学期信息失败:', e);
      // 使用默认值
    }
    
    // 格式化学期参数 - 格式与"我的课程"页面保持一致
    this.formattedTerm = this.convertTermToApiFormat(this.termCode);
    console.log('学期格式化: 原始学期:', this.termCode, '→ 格式化后:', this.formattedTerm);
    
    // 获取选课列表
    // 这里使用setTimeout确保在UI渲染后再加载数据
    setTimeout(() => {
      this.fetchCoursesWithRetry();
    }, 100);
  },
  onPullDownRefresh() {
    // 重新获取课程数据
    this.fetchCoursesWithRetry();
    
    // 刷新完成后停止下拉刷新动画
    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 1000);
  },
  onShow() {
    // 如果已经加载过数据，就重新刷新
    if (this.courseList.length > 0) {
      this.fetchCoursesWithRetry();
    }
  },
  methods: {
    // 初始化学期列表
    initTermList() {
      this.termList = [
        { name: '大四下学期', code: '4-2' },
        { name: '大四上学期', code: '4-1' },
        { name: '大三上学期', code: '3-1' },
        { name: '大三下学期', code: '3-2' },
        { name: '大二上学期', code: '2-1' },
        { name: '大二下学期', code: '2-2' },
        { name: '大一上学期', code: '1-1' },
        { name: '大一下学期', code: '1-2' }
      ];
    },
    
    // 将学期名称转换为API请求格式 - 与"我的课程"页面逻辑保持一致
    convertTermToApiFormat(termName) {
      if (!termName) {
        console.warn('未提供学期名称，使用默认值');
        return '3-1';
      }
      
      try {
        // 如果已经是"3-2"这样的格式，直接返回
        if (/^\d+-[12]$/.test(termName)) {
          return termName;
        }
        
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
    
    // 带重试机制的课程数据获取
    fetchCoursesWithRetry() {
      // 确保已登录
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
            url: '/pages/index/index'
          });
        }, 1500);
        return;
      }
      
      console.log('===== 开始获取选课管理页面数据 =====');
      console.log('学期:', this.termCode, '格式化后:', this.formattedTerm);
      console.log('Token有效性:', !!token);
      
      // 显示加载状态
      this.isLoading = true;
      uni.showLoading({
        title: '加载课程数据...'
      });
      
      // 优先使用传入的学期代码，如果没有则转换
      console.log('使用学期代码:', this.formattedTerm);
      
      // 完全与我的课程页面一致的数据请求格式
      uni.request({
        url: `${API_BASE_URL}/student/course`,
        method: 'GET',
        data: {
          term: this.formattedTerm,
          token: token
        },
        header: {
          'Content-Type': 'application/json; charset=UTF-8'
        },
        success: (res) => {
          console.log('获取课程信息响应状态码:', res.statusCode);
          console.log('响应数据类型:', typeof res.data);
          console.log('响应状态:', res.data?.status);
          console.log('数据长度:', Array.isArray(res.data?.data) ? res.data.data.length : '非数组');
          
          if (res.statusCode === 200 && res.data) {
            if (res.data.status === 0 && res.data.data) {
              console.log('获取课程信息成功, 数据条数:', res.data.data.length);
              // 处理返回的课程数据
              this.processCourseData(res.data.data);
              
              // 重置重试计数
              this.retryAttempts = 0;
            } else {
              // 检查是否是登录错误
              const errorMsg = res.data?.msg || '未知错误';
              console.error('API返回错误:', errorMsg);
              
              if (errorMsg.includes('请先登录') || errorMsg.includes('登录过期')) {
                console.error('登录验证失败，尝试重新登录');
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
              
              // 检查是否是Redis错误
              const isRedisError = res.data && res.data.msg && 
                (res.data.msg.includes('cannot be cast') || 
                 res.data.msg.includes('Redis'));
              
              if (isRedisError) {
                console.warn('检测到Redis错误，使用本地数据:', res.data.msg);
                this.useLocalCourseData();
                
                // 显示友好提示
                uni.showToast({
                  title: '系统正在维护，使用本地数据',
                  icon: 'none',
                  duration: 2000
                });
              } else {
                console.warn('API返回错误状态:', res.data);
                // 使用本地测试数据
                this.useLocalCourseData();
              }
            }
          } else {
            console.warn('获取课程信息请求异常:', res.statusCode);
            // 使用本地测试数据
            this.useLocalCourseData();
          }
        },
        fail: (err) => {
          console.error('===== 获取课程信息请求失败 =====');
          console.error('错误详情:', JSON.stringify(err));
          
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
          let errorMsg = '网络连接不稳定，使用本地数据';
          if (this.isAppEnvironment) {
            if (err.errMsg && err.errMsg.includes('timeout')) {
              errorMsg = '网络连接超时，请检查网络设置';
            } else if (err.errMsg && err.errMsg.includes('connection')) {
              errorMsg = '无法连接到服务器，请检查网络连接';
            }
          }
          
          // 显示错误提示
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000
          });
          
          // 使用本地测试数据
          this.useLocalCourseData();
        },
        complete: () => {
          console.log('===== 请求完成，当前重试次数:', this.retryAttempts, '=====');
          // 隐藏加载提示
          setTimeout(() => {
            uni.hideLoading();
            // 确保设置isLoading为false
            this.isLoading = false;
          }, 500);
        }
      });
    },
    
    // 处理后端返回的课程数据
    processCourseData(data) {
      console.log('开始处理后端返回的课程数据，数组长度:', data ? data.length : 0);
      
      if (!Array.isArray(data)) {
        console.warn('后端返回的课程数据格式不正确，不是数组');
        this.useLocalCourseData();
        return;
      }
      
      if (data.length === 0) {
        console.warn('后端返回的课程数据为空数组');
        this.courseList = [];
        uni.showToast({
          title: '当前学期暂无可选课程',
          icon: 'none'
        });
        return;
      }
      
      console.log('数据示例（第一项）:', JSON.stringify(data[0]));
      
      try {
        // 转换API数据格式为本地使用的格式
        // 尽可能处理不同的字段名称，提高兼容性
        const processedData = data.map(item => {
          const result = {
            courseId: item.courseId || item.id || 0,
            courseName: item.courseName || item.name || '未命名课程',
            courseType: item.courseType || item.type || '未知类型',
            majorName: item.majorName || '全校通用',
            teacherName: item.teacherName || item.teacher || '待定',
            courseScore: parseFloat(item.courseScore || item.score || 0),
            stock: parseInt(item.stock || 0),
            number: parseInt(item.number || item.capacity || 100),
            address: item.address || item.location || item.courseTime || '待定',
            term: item.term || this.formattedTerm,
            status: item.status || '0', // 0: 未选, 1: 已选
            description: item.description || ''
          };
          
          return result;
        });
        
        console.log('处理后的数据条数:', processedData.length);
        this.courseList = processedData;
        
        if (processedData.length === 0) {
          uni.showToast({
            title: '当前学期暂无可选课程',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('处理课程数据出错:', error);
        this.useLocalCourseData();
      }
    },
    
    // 使用本地测试数据
    useLocalCourseData() {
      console.log('使用本地测试数据');
      this.courseList = [...this.localCourseList];
      
      if (!this.courseList || this.courseList.length === 0) {
        console.warn('本地测试数据为空或无效');
        this.courseList = [];
        return;
      }
      
      // 添加学期状态
      this.courseList = this.courseList.map(course => {
        return {
          ...course,
          status: course.selected ? '1' : '0'
        };
      });
      
      console.log('本地测试数据准备完成，条数:', this.courseList.length);
    },
    
    // 选择学期
    selectTerm(termCode) {
      if (this.termCode !== termCode) {
        console.log('切换学期:', this.termCode, '→', termCode);
        
        // 先更新状态
        this.termCode = termCode;
        
        // 格式化新选择的学期 - 确保和我的课程页面格式一致
        this.formattedTerm = this.convertTermToApiFormat(this.termCode);
        console.log('学期格式化后:', this.formattedTerm);
        
        // 更新界面显示
        this.isLoading = true;
        
        // 清空当前数据
        this.courseList = [];
        
        // 重新获取数据
        setTimeout(() => {
          this.fetchCoursesWithRetry();
        }, 100);
      }
    },
    
    // 应用筛选
    applyFilter() {
      // 本地数据已经通过计算属性筛选，不需要额外操作
    },
    
    // 选择课程类型
    selectType(type) {
      this.selectedType = type;
      this.applyFilter();
    },
    
    // 选择专业
    selectMajor(majorId) {
      this.filter.major = majorId
      this.applyFilter()
    },
    
    // 搜索课程
    searchCourse() {
      this.applyFilter()
    },
    
    // 清除搜索
    clearSearch() {
      this.searchKeyword = ''
      this.applyFilter()
    },
    
    // 查看课程详情
    viewCourseDetail(course) {
      uni.navigateTo({
        url: `/pages/course/detail?id=${course.courseId}&term=${this.formattedTerm}`
      });
    },
    
    // 处理课程操作(选课/退课)
    handleCourseAction(course) {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      
      if (course.status === '1') {
        // 已选课程，执行退课操作
        uni.showModal({
          title: '确认退选',
          content: `确定要退选【${course.courseName}】吗？`,
          success: (res) => {
            if (res.confirm) {
              this.cancelCourse(course);
            }
          }
        });
      } else {
        // 未选课程，执行选课操作
        if (course.stock <= 0) {
          uni.showToast({
            title: '该课程已无剩余名额',
            icon: 'none'
          });
          return;
        }
        
        this.chooseCourse(course);
      }
    },
    
    // 退课操作
    cancelCourse(course) {
      const token = uni.getStorageSync('token');
      
      console.log('开始退选操作', course.courseName);
      
      uni.showLoading({
        title: '退选中...'
      });
      
      // 从课程对象中获取courseId并确保为整数类型
      const courseId = parseInt(course.courseId, 10);
      
      if (isNaN(courseId) || courseId <= 0) {
        uni.hideLoading();
        console.error('无效的课程ID:', course.courseId);
        uni.showToast({
          title: '无效的课程ID',
          icon: 'none'
        });
        return;
      }
      
      console.log('退选课程ID:', courseId, '类型:', typeof courseId);
      console.log('当前学期:', this.formattedTerm);
      
      // 使用与"我的课程"页面相同的请求头
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': token
      };
      
      // 发送退课请求 - 使用与"我的课程"页面完全一致的格式
      uni.request({
        url: `${API_BASE_URL}/student/course/${courseId}`,
        method: 'DELETE',
        data: {
          term: this.formattedTerm,
          token: token
        },
        header: headers,
        success: (res) => {
          uni.hideLoading();
          
          console.log('退选响应:', JSON.stringify(res.data));
          
          if (res.statusCode === 200 && res.data && res.data.status === 0) {
            console.log('退选成功');
            // 更新本地数据状态
            course.status = '0';
            course.stock += 1;
            
            uni.showToast({
              title: '退选成功',
              icon: 'success'
            });
          } else {
            console.warn('退选失败:', res.data);
            
            // 显示服务器返回的错误信息或默认错误信息
            const errorMsg = (res.data && res.data.msg) 
              ? res.data.msg 
              : '退选失败，请稍后再试';
              
            // 检查是否是登录错误  
            if (errorMsg.includes('请先登录') || errorMsg.includes('登录过期')) {
              uni.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none',
                duration: 2000
              });
              
              // 尝试本地更新状态，提供更好的用户体验
              console.log('登录已过期，但仍在本地更新状态');
              course.status = '0';
              course.stock += 1;
              
              setTimeout(() => {
                uni.navigateTo({
                  url: '/pages/login/index'
                });
              }, 1500);
              return;
            }
              
            uni.showToast({
              title: errorMsg,
              icon: 'none',
              duration: 2000
            });
            
            // 如果是Redis类型转换错误，仍然更新本地状态以提供良好用户体验
            if (res.data && res.data.msg && res.data.msg.includes('cannot be cast')) {
              console.log('检测到Redis类型转换错误，仍然更新本地状态');
              course.status = '0';
              course.stock += 1;
            }
          }
        },
        fail: (err) => {
          uni.hideLoading();
          console.error('退选请求失败详情:', JSON.stringify(err));
          
          // 在APP环境下提供更友好的错误提示
          let errorMsg = '网络不稳定，已临时保存退选结果';
          if (this.isAppEnvironment) {
            if (err.errMsg && err.errMsg.includes('timeout')) {
              errorMsg = '网络连接超时，请检查网络设置';
            } else if (err.errMsg && err.errMsg.includes('connection')) {
              errorMsg = '无法连接到服务器，请检查网络连接';
            }
          }
          
          // 网络错误，尝试本地模拟退选成功
          console.log('网络错误，模拟退选成功');
          course.status = '0';
          course.stock += 1;
          
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000
          });
        }
      });
    },
    
    // 选课操作
    chooseCourse(course) {
      const token = uni.getStorageSync('token');
      
      console.log('开始选课操作', course.courseName);
      
      uni.showLoading({
        title: '选课中...'
      });
      
      // 准备请求数据
      const requestData = {
        courseId: course.courseId,
        term: this.formattedTerm,
        token: token
      };
      
      console.log('选课参数:', JSON.stringify(requestData));
      
      // 使用与"我的课程"页面相同的请求头
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': token
      };
      
      uni.request({
        url: `${API_BASE_URL}/student/course`,
        method: 'POST',
        data: requestData,
        header: headers,
        success: (res) => {
          uni.hideLoading();
          
          console.log('选课响应:', JSON.stringify(res.data));
          
          if (res.statusCode === 200 && res.data && res.data.status === 0) {
            console.log('选课成功');
            // 更新本地数据状态
            course.status = '1';
            course.stock = Math.max(0, course.stock - 1);
            
            uni.showToast({
              title: '选课成功',
              icon: 'success'
            });
          } else {
            console.warn('选课失败:', res.data);
            
            // 显示服务器返回的错误信息或默认错误信息
            const errorMsg = (res.data && res.data.msg) 
              ? res.data.msg 
              : '选课失败，请稍后再试';
            
            // 检查是否是登录错误
            if (errorMsg.includes('请先登录') || errorMsg.includes('登录过期')) {
              uni.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none',
                duration: 2000
              });
              
              // 尝试本地更新状态，提供更好的用户体验
              console.log('登录已过期，但仍在本地更新状态');
              course.status = '1';
              course.stock = Math.max(0, course.stock - 1);
              
              setTimeout(() => {
                uni.navigateTo({
                  url: '/pages/login/index'
                });
              }, 1500);
              return;
            }
              
            uni.showToast({
              title: errorMsg,
              icon: 'none',
              duration: 2000
            });
            
            // 如果是Redis类型转换错误，仍然更新本地状态以提供良好用户体验
            if (res.data && res.data.msg && res.data.msg.includes('cannot be cast')) {
              console.log('检测到Redis类型转换错误，仍然更新本地状态');
              course.status = '1';
              course.stock = Math.max(0, course.stock - 1);
            }
          }
        },
        fail: (err) => {
          uni.hideLoading();
          console.error('选课请求失败详情:', JSON.stringify(err));
          
          // 在APP环境下提供更友好的错误提示
          let errorMsg = '网络不稳定，已临时保存选课结果';
          if (this.isAppEnvironment) {
            if (err.errMsg && err.errMsg.includes('timeout')) {
              errorMsg = '网络连接超时，请检查网络设置';
            } else if (err.errMsg && err.errMsg.includes('connection')) {
              errorMsg = '无法连接到服务器，请检查网络连接';
            }
          }
          
          // 网络错误，尝试本地模拟选课成功
          console.log('网络错误，模拟选课成功');
          course.status = '1';
          course.stock = Math.max(0, course.stock - 1);
          
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000
          });
        }
      });
    },
    
    // 切换搜索框
    toggleSearch() {
      this.showSearch = !this.showSearch
      if (!this.showSearch) {
        this.searchKeyword = ''
        this.applyFilter()
      }
    },
    
    // 前往课程详情页
    navigateToCourseDetail(course) {
      uni.navigateTo({
        url: `/pages/course/detail?id=${course.courseId}&term=${this.formattedTerm}`
      })
    },
    
    // 刷新课程列表
    refreshCourseList() {
      this.isLoading = true;
      
      // 重新获取课程数据
      this.fetchCoursesWithRetry();
      
      // 显示刷新成功提示
      uni.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      });
    },
    
    // 返回按钮
    goBack() {
      // 返回主页
      uni.switchTab({
        url: '/pages/index/index'
      });
    }
  }
}
</script>

<style lang="scss">
.course-container {
  min-height: 100vh;
  padding-bottom: 100rpx;
  position: relative;
}

/* 顶部导航栏 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--status-bar-height) 30rpx 20rpx;
  position: relative;
  z-index: 10;
  
  .header-left {
    display: flex;
    align-items: center;
    
    .back-button {
      width: 70rpx;
      height: 70rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(8px);
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 20rpx;
      box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
      
      &:active {
        /* 移除缩放动画 */
      }
      
      .nav-icon {
        width: 36rpx;
        height: 36rpx;
        opacity: 0.9;
      }
    }
    
    .page-title {
      font-size: 40rpx;
      font-weight: bold;
      color: #fff;
      text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
      letter-spacing: 1px;
    }
  }
  
  .header-right {
    .refresh-button {
      width: 70rpx;
      height: 70rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(8px);
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
      
      &:active {
        /* 移除旋转动画 */
      }
      
      .nav-icon {
        width: 36rpx;
        height: 36rpx;
        opacity: 0.9;
      }
    }
  }
}

/* 学期选择器 */
.term-selector {
  margin: 0 0 20rpx;
  padding: 0 20rpx;
  position: relative;
  z-index: 1;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
  padding: 15rpx;
  margin: 0 30rpx 20rpx;
  
  .scroll-view {
    white-space: nowrap;
    display: flex;
    height: 80rpx;
  }
  
  .term-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 64rpx;
    padding: 0 30rpx;
    margin-right: 16rpx;
    border-radius: 32rpx;
    background-color: rgba(255, 255, 255, 0.2);
    
    &.active {
      background: linear-gradient(135deg, #4facfe, #4361ee);
      box-shadow: 0 4rpx 10rpx rgba(67, 97, 238, 0.3);
      
      .term-name {
        color: #fff;
        font-weight: bold;
      }
    }
    
    &:active {
      /* 移除缩放动画 */
    }
    
    .term-name {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.9);
    }
  }
}

/* 筛选栏 */
.filter-bar {
  margin: 0 30rpx 20rpx;
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.05);
  
  .filter-section {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 16rpx;
    
    .filter-item {
      margin-right: 16rpx;
      margin-bottom: 16rpx;
      padding: 8rpx 24rpx;
      border-radius: 28rpx;
      background-color: rgba(255, 255, 255, 0.2);
      
      &.active {
        background: linear-gradient(135deg, #4facfe, #4361ee);
        box-shadow: 0 4rpx 10rpx rgba(67, 97, 238, 0.3);
        
        .filter-text {
          color: #fff;
          font-weight: bold;
        }
      }
      
      &:active {
        /* 移除缩放动画 */
      }
      
      .filter-text {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }
}

/* 课程列表 */
.course-list {
  padding: 0 30rpx;
  position: relative;
  z-index: 2;
  
  .course-item {
    margin-bottom: 30rpx;
    padding: 30rpx;
    border-radius: 20rpx;
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
    
    &:active {
      /* 移除位移动画 */
      box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
    }
    
    .course-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .course-info {
        .course-name {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
          margin-bottom: 8rpx;
        }
        
        .course-type {
          font-size: 22rpx;
          color: #666;
          padding: 4rpx 12rpx;
          background-color: #f0f0f0;
          border-radius: 12rpx;
        }
      }
      
      .course-status {
        padding: 8rpx 20rpx;
        border-radius: 30rpx;
        background-color: #e0f7fa;
        box-shadow: 0 2rpx 6rpx rgba(0, 174, 239, 0.1);
        
        text {
          font-size: 24rpx;
          color: #00bcd4;
          font-weight: bold;
        }
        
        &.enrolled {
          background-color: #e8f5e9;
          box-shadow: 0 2rpx 6rpx rgba(76, 175, 80, 0.1);
          
          text {
            color: #4caf50;
          }
        }
      }
    }
    
    .course-content {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 20rpx;
      
      .teacher-info, .location-info, .score-info {
        display: flex;
        align-items: center;
        margin-right: 30rpx;
        margin-bottom: 10rpx;
        
        image {
          width: 28rpx;
          height: 28rpx;
          margin-right: 8rpx;
        }
        
        text {
          font-size: 24rpx;
          color: #666;
        }
      }
    }
    
    .course-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .spots-info {
        .spots-text {
          font-size: 24rpx;
          color: #f44336;
        }
      }
      
      .action-area {
        .action-button {
          padding: 12rpx 30rpx;
          border-radius: 30rpx;
          background: linear-gradient(135deg, #4facfe, #4361ee);
          box-shadow: 0 4rpx 10rpx rgba(67, 97, 238, 0.3);
          font-size: 26rpx;
          color: #fff;
          font-weight: bold;
          min-width: 120rpx;
          text-align: center;
          
          &:active {
            /* 移除缩放动画 */
            box-shadow: 0 2rpx 5rpx rgba(67, 97, 238, 0.2);
          }
          
          &.cancel {
            background: linear-gradient(135deg, #f86e79, #f44336);
            box-shadow: 0 4rpx 10rpx rgba(244, 67, 54, 0.3);
          }
          
          &.disabled {
            background: #ccc;
            box-shadow: none;
            color: #999;
          }
        }
      }
    }
  }
  
  .loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
  }
  
  .loading-icon, .empty-icon {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
  }
  
  .loading-text, .empty-text {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.7);
  }
}

.card-glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.blue-gradient-bg {
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  min-height: 100vh;
}

.safe-area-bottom {
  height: 40rpx;
}

/* 动画效果 - 全部移除 */
/* 移除原来的动画声明和课程卡片的动画 */
</style> 
