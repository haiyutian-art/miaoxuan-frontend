<template>
  <view class="home-container blue-gradient-bg">
    <!-- 气泡背景 -->
    <bubbles></bubbles>
    
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-left">
        <text class="app-title">秒选通</text>
      </view>
      <view class="header-right">
        <view class="user-info" @tap="toggleUserMenu">
          <image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
          <text class="username">{{userInfo.name}}</text>
          <view class="dropdown-icon">
            <image class="icon-small" src="/static/images/icon-dropdown.svg" mode="aspectFit"></image>
          </view>
          
          <!-- 用户菜单 -->
          <view class="user-menu" v-if="showUserMenu">
            <view class="menu-item" @tap="navigateTo('/pages/profile/index')">
              <image class="menu-icon" src="/static/images/icon-profile.svg" mode="aspectFit"></image>
              <text class="menu-text">个人信息</text>
            </view>
            <view class="menu-item" @tap="navigateTo('/pages/password/index')">
              <image class="menu-icon" src="/static/images/icon-password.svg" mode="aspectFit"></image>
              <text class="menu-text">修改密码</text>
            </view>
            <view class="menu-item" @tap="handleLogout">
              <image class="menu-icon" src="/static/images/icon-logout.svg" mode="aspectFit"></image>
              <text class="menu-text">退出登录</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 欢迎信息区域 -->
    <view class="welcome-bar">
      <view class="welcome-text">
        <text class="greeting">你好，{{userInfo.name}}</text>
        <text class="subtitle">欢迎使用西安邮电大学选课系统</text>
      </view>
      <view class="term-info">
        <text class="term-name">{{currentTerm.name}}</text>
        <text class="term-status" :class="currentTerm.status === '选课中' ? 'active' : ''">{{currentTerm.status}}</text>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 功能卡片区域 -->
      <view class="feature-section">
        <view class="card-row">
          <view class="feature-card card" @tap="navigateToTab('/pages/course/term')">
            <view class="card-icon">
              <image class="icon" src="/static/images/icon-course.svg" mode="aspectFit"></image>
            </view>
            <text class="card-title">选课管理</text>
            <text class="card-subtitle">{{currentTerm.name}}</text>
            <text class="card-tag">{{currentTerm.status}}</text>
          </view>
          <view class="feature-card card" @tap="navigateTo('/pages/mycourse/term')">
            <view class="card-icon">
              <image class="icon" src="/static/images/icon-mycourse.svg" mode="aspectFit"></image>
            </view>
            <text class="card-title">我的课程</text>
            <text class="card-subtitle">查看已选课程</text>
          </view>
        </view>
        <view class="card-row">
          <view class="feature-card card" @tap="navigateToTab('/pages/schedule/index')">
            <view class="card-icon">
              <image class="icon" src="/static/images/icon-schedule.svg" mode="aspectFit"></image>
            </view>
            <text class="card-title">课程表</text>
            <text class="card-subtitle">查看每周课表</text>
          </view>
          <view class="feature-card card" @tap="navigateTo('/pages/grade/index')">
            <view class="card-icon">
              <image class="icon" src="/static/images/icon-grade.svg" mode="aspectFit"></image>
            </view>
            <text class="card-title">成绩查询</text>
            <text class="card-subtitle">查看课程成绩</text>
          </view>
        </view>
        <!-- START: 新增的 AI 助教卡片 -->
        <view class="card-row">
          <view class="feature-card card" @tap="goToAiChat">
            <view class="card-icon">
              <image class="icon" src="/static/images/ai-icon.svg" mode="aspectFit"></image>
            </view>
            <text class="card-title">AI 助教</text>
            <text class="card-subtitle">你的智能学习伙伴</text>
          </view>
          <view style="flex: 1;"></view>
        </view>
<!-- END: 新增的 AI 助教卡片 -->
      </view>

      <!-- 通知区域 -->
      <view class="notice-section card">
        <view class="section-header">
          <text class="section-title">通知公告</text>
          <text class="view-more" @tap="navigateTo('/pages/notice/list')">查看更多</text>
        </view>
        <view class="notice-list">
          <view class="notice-item" v-for="(item, index) in noticeList" :key="index" @tap="viewNotice(item)">
            <view class="notice-badge" :class="{'important': item.important}"></view>
            <view class="notice-content">
              <text class="notice-title">{{item.title}}</text>
              <text class="notice-time">{{item.time}}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 使用TabBar组件替代底部导航栏 -->
    <tab-bar :currentTab="currentTab"></tab-bar>
  </view>
</template>

<script>
import TabBar from '@/components/TabBar.vue'
import Bubbles from '@/components/Bubbles.vue'
import CommonIcon from '@/components/CommonIcon.vue'
import { reactive, ref, onMounted } from 'vue';
import { getUserInfo } from '@/api/user';
import { API_BASE_URL } from '@/config'

export default {
  components: {
    'tab-bar': TabBar,
    Bubbles,
    CommonIcon
  },
  data() {
    return {
      userInfo: {
        id: '',
        name: '加载中...',
        avatar: '/static/images/avatar-default.png',
        role: 'student'
      },
      currentTerm: {
        name: '加载中...',
        status: '加载中...',
        code: '',
        startTime: '',
        endTime: ''
      },
      noticeList: [],
      showUserMenu: false,
      isLoading: true,
      currentTab: 'home',
      tabList: [
        { text: '首页', icon: 'home' },
        { text: '选课', icon: 'course' },
        { text: '课表', icon: 'schedule' },
        { text: '我的', icon: 'profile' }
      ]
    }
  },
  onLoad() {
    // 加载用户头像
    this.loadUserAvatar()
    
    // 获取真实用户信息
    this.fetchUserInfo()
    
    // 获取当前学期信息
    this.fetchCurrentTerm()
    
    // 获取通知公告
    this.fetchNotices()
    
    // 监听页面显示事件
    uni.$on('updateAvatar', this.loadUserAvatar)
    
    // 监听个人信息更新事件
    uni.$on('updateStudentInfo', this.loadUserAvatar)
  },
  onUnload() {
    // 移除事件监听
    uni.$off('updateAvatar', this.loadUserAvatar)
    uni.$off('updateStudentInfo', this.loadUserAvatar)
  },
  onShow() {
    // 每次页面显示时加载最新信息
    this.loadUserAvatar()
    this.fetchUserInfo()
    this.fetchCurrentTerm()
  },
  methods: {
    // START: 新增跳转到 AI 页面的方法
    goToAiChat() {
      uni.navigateTo({
        url: '/pages/ai-chat/ai-chat'
      });
      this.hideUserMenu(); 
    },
    // END: 新增跳转到 AI 页面的方法
    // ... 其他已有方法 ...
    
    // 获取当前学期信息
    fetchCurrentTerm() {
      // 获取所有课程，从中提取学期信息
      const token = uni.getStorageSync('token')
      if (!token) {
        console.log('未找到token，无法获取学期信息')
        this.setDefaultTerm()
        return
      }
      
      // 首先尝试从本地存储获取之前保存的学期信息
      const savedTerm = uni.getStorageSync('currentTerm')
      if (savedTerm) {
        this.currentTerm = JSON.parse(savedTerm)
      }
      
      // 由于后端Redis存在类型转换错误，这里改为手动设置默认学期信息
      // 从API获取课程信息在后端修复Redis连接后可以恢复使用
      this.setDefaultTerm()
      
      // 尝试手动获取特定学期的课程，而不使用Redis缓存
      uni.request({
        url: '/api/student/my-courses',
        method: 'GET',
        data: {
          term: '3-1', // 默认请求大三上学期作为示例
          token: token // 通过参数传递token
        },
        header: {
          'Authorization': token
        },
        success: (res) => {
          console.log('获取我的课程信息:', res.data)
          if (res.statusCode === 200 && res.data.status === 0 && res.data.data && res.data.data.length > 0) {
            // 显示成功获取课程信息的提示
            uni.showToast({
              title: '课程信息获取成功',
              icon: 'success',
              duration: 2000
            })
          }
          this.isLoading = false
        },
        fail: (err) => {
          console.error('获取我的课程信息失败:', err)
          this.isLoading = false
        }
      })
    },
    
    // 获取通知公告列表
    fetchNotices() {
      // 由于后端没有专门的通知API，这里使用写死的数据
      // 实际项目中这里应该调用通知API
      this.noticeList = [
        {
          id: 1,
          title: '关于2022-2023学年第二学期选课的通知',
          content: '本学期选课将于2023年2月20日开始，请同学们及时登录系统进行选课。',
          time: '2023-02-15',
          important: true
        },
        {
          id: 2,
          title: '关于教师教育课程学分认定的通知',
          content: '各位同学请于3月10日前提交教师教育课程学分认定申请。',
          time: '2023-02-28',
          important: false
        },
        {
          id: 3,
          title: '关于公共选修课取消的通知',
          content: '因教师原因，《电影鉴赏》课程本学期取消，已选该课程的同学请重新选课。',
          time: '2023-03-01',
          important: true
        }
      ]
    },
    
    // 学期代码转换为名称
    getTermName(termCode) {
      const [year, semester] = termCode.split('-').map(Number)
      const semesterName = semester === 1 ? '上学期' : '下学期'
      return `大${this.numberToChinese(year)}${semesterName}`
    },
    
    // 数字转中文
    numberToChinese(num) {
      const chineseNumbers = ['零', '一', '二', '三', '四', '五']
      return chineseNumbers[num] || num
    },
    
    // 获取当前日期字符串
    getCurrentDate() {
      const date = new Date()
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },
    
    // 获取未来日期字符串
    getFutureDate(days) {
      const date = new Date()
      date.setDate(date.getDate() + days)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },
    
    // 设置默认学期信息
    setDefaultTerm() {
      this.currentTerm = {
        name: '2022-2023学年第二学期',
        status: '选课中',
        code: '3-2',
        startTime: '2023-02-20',
        endTime: '2023-03-05'
      }
      uni.setStorageSync('currentTerm', JSON.stringify(this.currentTerm))
    },
    
    // 获取真实用户信息
    fetchUserInfo() {
      // 获取存储的token
      const token = uni.getStorageSync('token')
      const userInfo = uni.getStorageSync('userInfo')
      
      if (!token || !userInfo) {
        console.error('未找到登录信息，请先登录')
        return
      }
      
      // 根据用户角色决定使用哪个API端点
      let apiUrl = `${API_BASE_URL}/user/info`
      if (userInfo.role === 'student') {
        apiUrl = `${API_BASE_URL}/student/info`
      } else if (userInfo.role === 'teacher') {
        apiUrl = `${API_BASE_URL}/teacher/info`
      }
      
      // 先清除之前的用户信息，以防展示错误数据
      this.clearPreviousUserData()
      
      // 请求用户信息前设置默认信息
      this.setDefaultUserInfo()
      
      // 构建请求中携带token的方式
      uni.request({
        url: apiUrl,
        method: 'GET',
        data: { token: token },
        header: {
          'Content-Type': 'application/json; charset=UTF-8'
        },
        success: (res) => {
          console.log('用户信息获取成功:', res)
          
          // 如果响应中包含了用户信息，更新本地存储和界面
          if (res.data && res.data.status === 0 && res.data.data) {
            const userData = res.data.data
            console.log('解析用户数据:', userData)
            
            // 更新本地存储
            uni.setStorageSync('userDetail', userData)
            
            // 取名字顺序：studentName > name > username > 登录用户名 > 未命名用户
            if (userData.studentName) {
              uni.setStorageSync('studentName', userData.studentName)
            } else if (userData.name) {
              uni.setStorageSync('studentName', userData.name)
            } else if (userData.username) {
              uni.setStorageSync('studentName', userData.username)
            } else {
              uni.setStorageSync('studentName', userInfo.username || '未命名用户')
            }
            
            // 如果API返回了性别信息，更新本地存储
            if (userData.studentSex) {
              uni.setStorageSync('studentGender', userData.studentSex === '女' ? 'female' : 'male')
            } else if (userData.sex) {
              uni.setStorageSync('studentGender', userData.sex === '女' ? 'female' : 'male')
            }
            
            // 如果API返回了联系方式，更新本地存储
            if (userData.studentPhone || userData.studentMobile) {
              uni.setStorageSync('studentPhone', userData.studentPhone || userData.studentMobile)
            } else if (userData.phone) {
              uni.setStorageSync('studentPhone', userData.phone)
            }
            
            if (userData.studentEmail) {
              uni.setStorageSync('studentEmail', userData.studentEmail)
            } else if (userData.email) {
              uni.setStorageSync('studentEmail', userData.email)
            }
            
            if (userData.majorName) {
              uni.setStorageSync('studentMajor', userData.majorName)
            }
            
            // 保存专业ID
            if (userData.majorId) {
              uni.setStorageSync('majorId', userData.majorId.toString())
            } else if (userData.major) {
              uni.setStorageSync('majorId', userData.major.toString())
            }
            
            // 立即更新界面
            this.loadUserAvatar()
            
            console.log('已更新用户详细信息:', userData)
          } else {
            // 请求成功但没有用户数据，使用登录信息作为备选
            this.setUserInfoFromLogin()
          }
        },
        fail: (err) => {
          console.error('获取用户信息失败:', err)
          // 请求失败，使用登录信息作为备选
          this.setUserInfoFromLogin()
        }
      })
    },
    
    // 设置默认用户信息，确保页面不显示"加载中..."
    setDefaultUserInfo() {
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo && userInfo.username) {
        // 使用登录时保存的用户名
        this.userInfo.name = userInfo.username
      }
    },
    
    // 如果API获取失败，使用登录信息
    setUserInfoFromLogin() {
      const userInfo = uni.getStorageSync('userInfo')
      const userDetail = uni.getStorageSync('userDetail')
      
      if (userInfo) {
        // 尝试从后端返回的详细信息中获取真实姓名
        if (userDetail) {
          if (userDetail.studentName) {
            uni.setStorageSync('studentName', userDetail.studentName)
            this.userInfo.name = userDetail.studentName
          } else if (userDetail.name) {
            uni.setStorageSync('studentName', userDetail.name)
            this.userInfo.name = userDetail.name
          } else if (userInfo.username) {
            // 没有真实姓名则使用登录时的用户名
            uni.setStorageSync('studentName', userInfo.username)
            this.userInfo.name = userInfo.username
          }
        } else if (userInfo.username) {
          uni.setStorageSync('studentName', userInfo.username)
          this.userInfo.name = userInfo.username
        }
        
        this.userInfo.role = userInfo.role || 'student'
        
        // 设置默认头像
        this.userInfo.avatar = '/static/images/avatar.jpg'
        console.log('使用登录信息作为备选:', this.userInfo)
      }
    },
    
    // 清除之前用户的数据
    clearPreviousUserData() {
      // 清除之前用户的个人信息，但保留登录状态
      uni.removeStorageSync('studentName')
      uni.removeStorageSync('studentGender')
      uni.removeStorageSync('studentAvatar')
      uni.removeStorageSync('studentPhone')
      uni.removeStorageSync('studentEmail')
      uni.removeStorageSync('studentMajor')
      uni.removeStorageSync('userDetail')
      
      // 重置界面数据但保留登录信息作为备选
      const userInfo = uni.getStorageSync('userInfo')
      this.userInfo = {
        id: '',
        name: userInfo && userInfo.username ? userInfo.username : '加载中...',
        avatar: '/static/images/avatar-default.png',
        role: userInfo ? userInfo.role : 'student'
      }
    },
    
    // 加载用户头像
    loadUserAvatar() {
      try {
        // 获取存储的用户信息
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo) {
          this.userInfo.role = userInfo.role || uni.getStorageSync('userRole') || 'student'
        }
        
        const savedAvatar = uni.getStorageSync('studentAvatar')
        const savedGender = uni.getStorageSync('studentGender')
        const savedName = uni.getStorageSync('studentName')
        
        // 加载头像
        if (savedAvatar) {
          this.userInfo.avatar = savedAvatar
        } else if (savedGender === 'female') {
          this.userInfo.avatar = '/static/images/female-avatar.jpg'
        } else {
          this.userInfo.avatar = '/static/images/avatar.jpg'
        }
        
        // 更新名字
        if (savedName) {
          this.userInfo.name = savedName
        } else {
          // 如果没有保存的名字，尝试从userDetail获取
          const userDetail = uni.getStorageSync('userDetail')
          if (userDetail) {
            // 按优先级获取名字
            if (userDetail.studentName) {
              this.userInfo.name = userDetail.studentName
              uni.setStorageSync('studentName', userDetail.studentName)
            } else if (userDetail.name) {
              this.userInfo.name = userDetail.name
              uni.setStorageSync('studentName', userDetail.name)
            } else if (userDetail.username) {
              this.userInfo.name = userDetail.username
              uni.setStorageSync('studentName', userDetail.username)
            }
          }
        }
        
        console.log('首页已更新用户信息:', this.userInfo.name, this.userInfo.avatar)
      } catch (e) {
        console.error('获取用户头像失败', e)
      }
    },
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
    },
    hideUserMenu() {
      this.showUserMenu = false
    },
    navigateTo(url) {
      this.hideUserMenu()
      // 判断是否是Tab页面，如果是则使用switchTab
      if (url === '/pages/index/index' || 
          url === '/pages/course/term' || 
          url === '/pages/schedule/index' || 
          url === '/pages/profile/index') {
        uni.switchTab({
          url: url
        })
      } else {
        uni.navigateTo({
          url: url
        })
      }
    },
    navigateToTab(url) {
      this.hideUserMenu()
      uni.switchTab({
        url: url
      })
    },
    viewNotice(notice) {
      uni.navigateTo({
        url: `/pages/notice/detail?id=${notice.id}`
      })
    },
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '退出成功',
              icon: 'success'
            })
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/login/index'
              })
            }, 1500)
          }
        }
      })
    },
    // 点击页面其他区域关闭用户菜单
    onPageClick() {
      if (this.showUserMenu) {
        this.showUserMenu = false
      }
    }
  }
}
</script>

<style lang="scss">
/* 删除不再需要的iconfont相关样式 */
/* @font-face {
  font-family: "iconfont";
  src: url('/static/fonts/iconfont.ttf') format('truetype');
}

.iconfont {
  font-family: "iconfont" !important;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
} */

/* 添加SVG图标相关样式 */
.icon {
  width: 48rpx;
  height: 48rpx;
  display: block;
}

.icon-small {
  width: 32rpx;
  height: 32rpx;
  display: block;
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
  display: block;
  margin: 0 auto 8rpx;
}

.menu-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 16rpx;
}

/* 根据图标所在位置设置颜色 */
.card-icon .icon {
  /* 根据不同主题设置颜色 */
  filter: brightness(0) invert(1); /* 将SVG图标变为白色 */
}

.tab-bar .tab-icon {
  filter: brightness(0) saturate(100%) invert(60%) sepia(11%) saturate(361%) hue-rotate(202deg) brightness(94%) contrast(87%); /* 非活跃颜色 */
}

.tab-bar .active .tab-icon {
  filter: brightness(0) saturate(100%) invert(34%) sepia(47%) saturate(3867%) hue-rotate(213deg) brightness(91%) contrast(94%); /* 活跃颜色蓝色 */
}

.menu-icon {
  filter: brightness(0) saturate(100%) invert(27%) sepia(68%) saturate(860%) hue-rotate(190deg) brightness(98%) contrast(88%); /* 菜单图标颜色 */
}

.dropdown-icon .icon-small {
  filter: brightness(0) invert(1); /* 白色 */
}

.card-arrow .icon-small {
  filter: brightness(0) invert(1); /* 白色 */
  opacity: 0.7;
}

/* 保留原有的卡片样式 */
.home-container {
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
    .app-title {
      font-size: 40rpx;
      font-weight: bold;
      color: #fff;
      text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    }
  }
  
  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      position: relative;
      padding: 10rpx;
      border-radius: 40rpx;
      background-color: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10rpx);
      
      .avatar {
        width: 60rpx;
        height: 60rpx;
        border-radius: 30rpx;
        margin-right: 10rpx;
        border: 2rpx solid rgba(255, 255, 255, 0.5);
      }
      
      .username {
        color: #fff;
        font-size: 28rpx;
        margin-right: 10rpx;
        text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
      }
      
      .dropdown-icon {
        .icon-small {
          width: 24rpx;
          height: 24rpx;
          filter: brightness(0) invert(1);
        }
      }
      
      .user-menu {
        position: absolute;
        top: 100%;
        right: 0;
        width: 240rpx;
        background-color: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10rpx);
        border-radius: 20rpx;
        box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
        overflow: hidden;
        z-index: 100;
        margin-top: 20rpx;
        
        .menu-item {
          display: flex;
          align-items: center;
          padding: 20rpx;
          transition: all 0.3s ease;
          
          &:active {
            background-color: rgba(0, 0, 0, 0.05);
          }
          
          .menu-icon {
            width: 40rpx;
            height: 40rpx;
            margin-right: 20rpx;
          }
          
          .menu-text {
            color: #333;
            font-size: 28rpx;
          }
        }
      }
    }
  }
}

/* 欢迎信息区域 */
.welcome-bar {
  padding: 20rpx 30rpx 40rpx;
  position: relative;
  z-index: 1;
  
  .welcome-text {
    margin-bottom: 20rpx;
    
    .greeting {
      display: block;
      font-size: 48rpx;
      font-weight: bold;
      color: #fff;
      margin-bottom: 10rpx;
      text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    }
    
    .subtitle {
      display: block;
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.8);
      text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    }
  }
  
  .term-info {
    display: flex;
    align-items: center;
    
    .term-name {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-right: 20rpx;
      text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    }
    
    .term-status {
      font-size: 24rpx;
      padding: 4rpx 20rpx;
      border-radius: 20rpx;
      background-color: rgba(255, 255, 255, 0.2);
      color: #fff;
      
      &.active {
        background-color: rgba(34, 197, 94, 0.2);
        color: #22c55e;
      }
    }
  }
}

/* 内容区域 */
.content-area {
  position: relative;
  z-index: 2;
  padding: 0 30rpx;
}

/* 功能卡片区域 */
.feature-section {
  margin-bottom: 40rpx;
  
  .card-row {
    display: flex;
    gap: 20rpx;
    margin-bottom: 20rpx;
    
    .feature-card {
      flex: 1;
      padding: 30rpx;
      position: relative;
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.98);
      }
      
      .card-icon {
        margin-bottom: 20rpx;
        
        .icon {
          width: 60rpx;
          height: 60rpx;
          filter: brightness(0) saturate(100%) invert(34%) sepia(47%) saturate(3867%) hue-rotate(213deg) brightness(91%) contrast(94%);
        }
      }
      
      .card-title {
        display: block;
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 10rpx;
      }
      
      .card-subtitle {
        display: block;
        font-size: 24rpx;
        color: #666;
      }
      
      .card-tag {
        position: absolute;
        top: 20rpx;
        right: 20rpx;
        font-size: 24rpx;
        padding: 4rpx 16rpx;
        border-radius: 16rpx;
        background-color: #4361ee;
        color: #fff;
      }
    }
  }
}

/* 通知区域 */
.notice-section {
  margin-bottom: 40rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .view-more {
      font-size: 26rpx;
      color: #4361ee;
    }
  }
  
  .notice-list {
    .notice-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
      
      &:last-child {
        border-bottom: none;
      }
      
      .notice-badge {
        width: 12rpx;
        height: 12rpx;
        border-radius: 6rpx;
        background-color: #4361ee;
        margin-right: 20rpx;
        
        &.important {
          background-color: #ef4444;
        }
      }
      
      .notice-content {
        flex: 1;
        
        .notice-title {
          display: block;
          font-size: 28rpx;
          color: #333;
          margin-bottom: 10rpx;
        }
        
        .notice-time {
          display: block;
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
}

/* 动画 */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20rpx); }
}

@keyframes bubble-float {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100vh) scale(1.2);
    opacity: 0;
  }
}
</style>
