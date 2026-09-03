<template>
  <view class="profile-container blue-gradient-bg">
    <!-- 顶部导航栏 -->
    <nav-bar title="个人信息" :show-back="true"></nav-bar>
    
    <!-- 用户信息卡片 -->
    <view class="profile-content">
      <view class="user-card card">
        <view class="user-info">
          <view class="avatar-container" @tap="chooseAvatar">
            <image class="avatar-image" :src="studentInfo.avatar" mode="aspectFill"></image>
            <view class="gender-toggle" @tap.stop="toggleGender">
              <image class="gender-icon" :class="studentInfo.gender" 
                :src="studentInfo.gender === 'male' ? '/static/images/icon-male.svg' : '/static/images/icon-female.svg'" 
                mode="aspectFit"></image>
            </view>
          </view>
          <view class="user-details">
            <text class="username">{{studentInfo.name}}</text>
            <text class="user-id">学号: {{studentInfo.id}}</text>
            <text class="user-major" v-if="studentInfo.major">专业: {{studentInfo.major}}</text>
          </view>
        </view>
        
        <!-- 增加联系方式等信息的显示 -->
        <view class="additional-info" v-if="hasAdditionalInfo">
          <view class="info-divider"></view>
          
          <view class="info-row" v-if="studentInfo.major">
            <text class="info-label">专业:</text>
            <text class="info-value">{{studentInfo.major}}</text>
          </view>
          
          <view class="info-row" v-if="studentInfo.phone">
            <text class="info-label">电话:</text>
            <text class="info-value">{{studentInfo.phone}}</text>
          </view>
          
          <view class="info-row" v-if="studentInfo.email">
            <text class="info-label">邮箱:</text>
            <text class="info-value">{{studentInfo.email}}</text>
          </view>
        </view>
      </view>
      
      <!-- 功能列表 -->
      <view class="menu-list">
        <view class="menu-group card">
          <view class="menu-item" @tap="navigateTo('/pages/profile/update-info')">
            <view class="menu-icon">
              <image src="/static/images/icon-edit.svg" mode="aspectFit"></image>
            </view>
            <text class="menu-text">修改个人信息</text>
            <view class="menu-arrow">
              <image src="/static/images/icon-arrow.svg" mode="aspectFit"></image>
            </view>
          </view>
          
          <view class="menu-item" @tap="navigateTo('/pages/password/index')">
            <view class="menu-icon">
              <image src="/static/images/icon-password.svg" mode="aspectFit"></image>
            </view>
            <text class="menu-text">修改密码</text>
            <view class="menu-arrow">
              <image src="/static/images/icon-arrow.svg" mode="aspectFit"></image>
            </view>
          </view>
          
          <view class="menu-item" @tap="showLogoutConfirm">
            <view class="menu-icon">
              <image src="/static/images/icon-logout.svg" mode="aspectFit"></image>
            </view>
            <text class="menu-text">退出登录</text>
            <view class="menu-arrow">
              <image src="/static/images/icon-arrow.svg" mode="aspectFit"></image>
            </view>
          </view>
        </view>
        
        <view class="menu-group card">
          <view class="menu-item" @tap="showAbout">
            <view class="menu-icon">
              <image src="/static/images/icon-about.svg" mode="aspectFit"></image>
            </view>
            <text class="menu-text">关于我们</text>
            <view class="menu-arrow">
              <image src="/static/images/icon-arrow.svg" mode="aspectFit"></image>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 底部版本信息 -->
      <view class="footer card">
        <text class="version">版本: 1.0.0</text>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <tab-bar currentTab="profile"></tab-bar>
  </view>
</template>

<script>
import TabBar from '@/components/TabBar.vue'
import NavBar from '@/components/NavBar.vue'

export default {
  components: {
    'tab-bar': TabBar,
    NavBar
  },
  data() {
    return {
      currentTab: 'profile',
      studentInfo: {
        id: '2023001001',
        name: '张三',
        gender: 'male',
        avatar: '/static/images/avatar.jpg'
      },
      hasAdditionalInfo: false
    }
  },
  onLoad() {
    this.loadStudentInfo()
    
    // 监听信息更新事件
    uni.$on('updateStudentInfo', this.loadStudentInfo)
  },
  onUnload() {
    // 移除事件监听，防止内存泄漏
    uni.$off('updateStudentInfo', this.loadStudentInfo)
  },
  onShow() {
    // 每次页面显示时重新加载用户信息，确保数据是最新的
    this.loadStudentInfo()
  },
  methods: {
    navigateTo(url) {
      uni.navigateTo({
        url,
        animationType: 'none'
      })
    },
    switchTab(url) {
      uni.switchTab({
        url,
        animationType: 'none'
      })
    },
    showLogoutConfirm() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 只清除登录相关的存储，保留学生个人信息
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            
            uni.showToast({
              title: '退出成功',
              icon: 'success'
            })
            
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/login/index',
                animationType: 'none'
              })
            }, 1500)
          }
        }
      })
    },
    showAbout() {
      uni.showModal({
        title: '关于我们',
        content: '秒选通 - 高校选课系统\n版本: 1.0.0\n开发者: 出道即巅峰团队',
        showCancel: false
      })
    },
    // 加载学生信息，包括基本信息和联系方式
    loadStudentInfo() {
      // 从本地存储中获取所有学生信息
      try {
        // 获取基本信息
        const savedGender = uni.getStorageSync('studentGender');
        const savedAvatar = uni.getStorageSync('studentAvatar');
        const savedPhone = uni.getStorageSync('studentPhone');
        const savedEmail = uni.getStorageSync('studentEmail');
        const savedMajor = uni.getStorageSync('studentMajor');
        const savedMajorId = uni.getStorageSync('majorId');
        const savedName = uni.getStorageSync('studentName');
        const savedStudentNo = uni.getStorageSync('studentNo');
        const userDetail = uni.getStorageSync('userDetail'); // 获取更多用户详情
        
        // 设置学号
        if (savedStudentNo) {
          this.studentInfo.id = savedStudentNo;
        }
        
        // 设置专业信息
        if (savedMajor) {
          this.studentInfo.major = savedMajor;
        } else if (savedMajorId) {
          // 根据majorId查找对应的专业名称
          const majorOptions = [
            { id: 1, name: '计算机科学与技术' },
            { id: 2, name: '软件工程' },
            { id: 3, name: '网络工程' },
            { id: 4, name: '信息安全' },
            { id: 5, name: '人工智能' },
            { id: 6, name: '数据科学与大数据技术' },
            { id: 7, name: '信息对抗' },
            { id: 8, name: '通信工程' },
            { id: 9, name: '物联网' },
            { id: 10, name: '电子信息工程' },
            { id: 11, name: '计算机科学与技术' },
          ];
          const majorId = parseInt(savedMajorId);
          const major = majorOptions.find(item => item.id === majorId);
          if (major) {
            this.studentInfo.major = major.name;
          }
        } else if (userDetail && userDetail.majorId) {
          // 如果有后端返回的用户详情，从中获取专业ID
          const majorOptions = [
            { id: 1, name: '计算机科学与技术' },
            { id: 2, name: '软件工程' },
            { id: 3, name: '网络工程' },
            { id: 4, name: '信息安全' },
            { id: 5, name: '人工智能' },
            { id: 6, name: '数据科学与大数据技术' },
            { id: 7, name: '信息对抗' },
            { id: 8, name: '通信工程' },
            { id: 9, name: '物联网' },
            { id: 10, name: '电子信息工程' },
            { id: 11, name: '计算机科学与技术' },
          ];
          const majorId = parseInt(userDetail.majorId);
          const major = majorOptions.find(item => item.id === majorId);
          if (major) {
            this.studentInfo.major = major.name;
            // 保存专业信息到本地存储
            uni.setStorageSync('studentMajor', major.name);
            uni.setStorageSync('majorId', majorId.toString());
          }
        } else {
          // 基于SQL数据中的majorId设置默认专业（ID为6对应数据科学与大数据技术）
          this.studentInfo.major = '数据科学与大数据技术';
          uni.setStorageSync('studentMajor', '数据科学与大数据技术');
          uni.setStorageSync('majorId', '6');
        }
        
        // 设置性别和头像
        if (savedGender) {
          this.studentInfo.gender = savedGender;
          // 如果用户自定义了姓名，则使用自定义姓名
          if (savedName) {
            this.studentInfo.name = savedName;
          } else {
            // 否则使用默认姓名
            this.studentInfo.name = savedGender === 'female' ? '李四' : '张三';
          }
          
          // 设置头像
          if (savedAvatar) {
            this.studentInfo.avatar = savedAvatar;
          } else {
            this.studentInfo.avatar = savedGender === 'female' ? 
              '/static/images/female-avatar.jpg' : '/static/images/avatar.jpg';
          }
        } else if (savedAvatar) {
          // 即使没有设置性别，如果有自定义头像，也应该显示
          this.studentInfo.avatar = savedAvatar;
        }
        
        // 如果有自定义姓名，不管有没有性别设置，都应该显示
        if (savedName) {
          this.studentInfo.name = savedName;
        }
        
        // 如果有额外信息，也添加到studentInfo中
        if (savedPhone) {
          this.studentInfo.phone = savedPhone;
        }
        
        if (savedEmail) {
          this.studentInfo.email = savedEmail;
        }
        
        console.log('已加载最新的学生信息:', this.studentInfo);
        
        // 设置hasAdditionalInfo
        this.hasAdditionalInfo = !!(savedPhone || savedEmail || savedMajor);
      } catch (e) {
        console.error('获取学生信息设置失败', e);
      }
    },
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const avatarPath = res.tempFilePaths[0];
          this.studentInfo.avatar = avatarPath;
          
          // 保存头像到本地存储
          uni.setStorageSync('studentAvatar', avatarPath);
          
          uni.showToast({
            title: '头像设置成功',
            icon: 'success'
          });
        }
      });
    },
    toggleGender() {
      const savedAvatar = uni.getStorageSync('studentAvatar');
      const savedName = uni.getStorageSync('studentName');
      
      // 切换性别
      if (this.studentInfo.gender === 'male') {
        this.studentInfo.gender = 'female';
        
        // 只有在没有自定义姓名时才设置默认姓名
        if (!savedName) {
          this.studentInfo.name = '李四';
        }
        
        // 如果没有自定义头像，则使用默认头像
        if (!savedAvatar) {
          this.studentInfo.avatar = '/static/images/female-avatar.jpg';
        }
        
        // 保存到本地存储
        uni.setStorageSync('studentGender', 'female');
      } else {
        this.studentInfo.gender = 'male';
        
        // 只有在没有自定义姓名时才设置默认姓名
        if (!savedName) {
          this.studentInfo.name = '张三';
        }
        
        // 如果没有自定义头像，则使用默认头像
        if (!savedAvatar) {
          this.studentInfo.avatar = '/static/images/avatar.jpg';
        }
        
        // 保存到本地存储
        uni.setStorageSync('studentGender', 'male');
      }
      
      // 显示切换成功提示
      uni.showToast({
        title: `已切换为${this.studentInfo.gender === 'male' ? '男' : '女'}学生`,
        icon: 'none',
        duration: 1500
      });
    }
  }
}
</script>

<style lang="scss">
.profile-container {
  min-height: 100vh;
  position: relative;
  padding-bottom: 120rpx; /* 为底部Tab栏留出空间 */
  padding-top: var(--status-bar-height);
}

.profile-content {
  position: relative;
  z-index: 2;
  padding: 160rpx 30rpx 30rpx; /* 为顶部导航预留空间 */
}

.card {
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.user-card {
  padding: 30rpx;
  margin-bottom: 30rpx;
  
  .user-info {
    display: flex;
    align-items: center;
    
    .avatar-container {
      position: relative;
      width: 130rpx;
      height: 130rpx;
      border-radius: 50%;
      overflow: hidden;
      background-color: #fff;
      border: 4rpx solid rgba(255,255,255,0.5);
      box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.1);
      
      &:active {
        box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.1);
        opacity: 1;
      }
      
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.1);
        opacity: 0;
      }
      
      &:active::after {
        opacity: 0;
      }
      
      .avatar-image {
        width: 100%;
        height: 100%;
      }
      
      .gender-toggle {
        position: absolute;
        right: 6rpx;
        top: 6rpx;
        width: 36rpx;
        height: 36rpx;
        border-radius: 50%;
        background-color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
      }
    }
    
    .user-details {
      margin-left: 20rpx;
      flex: 1;
      
      .username {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 10rpx;
        display: block;
      }
      
      .user-id {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 10rpx;
      }
      
      .user-major {
        font-size: 28rpx;
        color: #666;
        display: block;
      }
    }
  }
  
  .additional-info {
    margin-top: 30rpx;
    
    .info-divider {
      height: 1px;
      background-color: rgba(0, 0, 0, 0.05);
      margin: 15rpx 0;
    }
    
    .info-row {
      display: flex;
      align-items: center;
      margin: 10rpx 0;
      
      .info-label {
        font-size: 26rpx;
        color: #666;
        width: 80rpx;
        flex-shrink: 0;
      }
      
      .info-value {
        font-size: 26rpx;
        color: #333;
        flex: 1;
        margin-left: 20rpx;
        word-break: break-all;
      }
    }
  }
}

.menu-list {
  margin-bottom: 30rpx;
  
  .menu-group {
    margin-bottom: 30rpx;
    overflow: hidden;
  }
  
  .menu-item {
    height: 100rpx;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    position: relative;
    
    &:active {
      background-color: transparent;
    }
    
    &:not(:last-child):after {
      content: '';
      position: absolute;
      left: 30rpx;
      right: 30rpx;
      bottom: 0;
      height: 1px;
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    .menu-icon {
      width: 48rpx;
      height: 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;
      
      image {
        width: 36rpx;
        height: 36rpx;
        filter: brightness(0) saturate(100%) invert(34%) sepia(47%) saturate(3867%) hue-rotate(213deg) brightness(91%) contrast(94%);
      }
    }
    
    .menu-text {
      flex: 1;
      font-size: 30rpx;
      color: #333;
    }
    
    .menu-arrow {
      width: 32rpx;
      height: 32rpx;
      
      image {
        width: 100%;
        height: 100%;
        opacity: 0.3;
      }
    }
  }
}

.footer {
  text-align: center;
  padding: 30rpx 0;
  
  .version {
    font-size: 24rpx;
    color: #666;
  }
}

.blue-gradient-bg {
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  min-height: 100vh;
}

/* 添加禁用所有动画和过渡效果的规则 */
.profile-container * {
  transition: none !important;
  animation: none !important;
  transform: none !important;
}
</style> 