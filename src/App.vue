<template>
  <view>
    <view v-if="showError" class="error-message">
      <text>{{errorMessage}}</text>
      <button class="error-btn" @tap="dismissError">知道了</button>
    </view>
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    <router-view></router-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isLoading: false,
      showError: false,
      errorMessage: ''
    }
  },
  onLaunch: function () {
    console.log('App Launch')
    this.switchTabBarByRole()
    this.initUserInfo()
    // 全局错误处理
    uni.onError((err) => {
      console.error('全局错误:', err);
      this.showErrorMessage('应用发生错误: ' + err);
    });
    
    // 配置请求拦截器
    this.setupRequestInterceptor();
  },
  onShow: function () {
    console.log('App Show')
    this.switchTabBarByRole()
  },
  onHide: function () {
    console.log('App Hide')
  },
  methods: {
    // 初始化用户信息
    initUserInfo() {
      // 检查默认头像是否存在，如果不存在，初始化设置
      const hasUserInfo = uni.getStorageSync('userInfo')
      const hasAvatar = uni.getStorageSync('studentAvatar')
      const hasGender = uni.getStorageSync('studentGender')
      
      if (!hasUserInfo && !hasGender) {
        // 设置默认性别为男性
        uni.setStorageSync('studentGender', 'male')
      }
      
      console.log('用户信息初始化完成')
    },
    
    // 根据角色切换TabBar
    switchTabBarByRole() {
      const userInfo = uni.getStorageSync('userInfo') || {}
      const role = userInfo.role || 'student'
      
      // 隐藏系统TabBar，使用自定义TabBar组件
      uni.hideTabBar()
      
      // 根据角色切换TabBar
      if (role === 'teacher') {
        // 教师角色使用教师TabBar
        this.setTeacherTabBar()
      }
      // 学生角色使用自定义TabBar组件，不需要特别处理
    },
    
    // 设置教师端TabBar
    setTeacherTabBar() {
      const tabBarStyle = {
        color: "#7A7E83",
        selectedColor: "#1890ff",
        backgroundColor: "#ffffff",
        borderStyle: "black",
        list: [
          {
            pagePath: "pages/teacher/index",
            iconPath: "/static/images/icon-home.svg",
            selectedIconPath: "/static/images/icon-home.svg",
            text: "工作台"
          },
          {
            pagePath: "pages/teacher/course",
            iconPath: "/static/images/icon-course.svg",
            selectedIconPath: "/static/images/icon-course.svg",
            text: "课程"
          },
          {
            pagePath: "pages/teacher/grade",
            iconPath: "/static/images/icon-schedule.svg",
            selectedIconPath: "/static/images/icon-schedule.svg",
            text: "成绩"
          },
          {
            pagePath: "pages/teacher/profile",
            iconPath: "/static/images/icon-profile.svg",
            selectedIconPath: "/static/images/icon-profile.svg",
            text: "我的"
          }
        ]
      }
      
      uni.setTabBarStyle({
        color: tabBarStyle.color,
        selectedColor: tabBarStyle.selectedColor,
        backgroundColor: tabBarStyle.backgroundColor,
        borderStyle: tabBarStyle.borderStyle
      })
      
      // 设置TabBar项
      tabBarStyle.list.forEach((item, index) => {
        uni.setTabBarItem({
          index,
          text: item.text,
          iconPath: item.iconPath,
          selectedIconPath: item.selectedIconPath
        })
      })
      
      uni.showTabBar()
    },
    setupRequestInterceptor() {
      // 添加全局请求拦截器
      uni.addInterceptor('request', {
        invoke(args) {
          // 请求拦截
          console.log('请求拦截:', args.url);
          return args;
        },
        success(args) {
          // 响应拦截
          console.log('响应拦截:', args.statusCode);
          
          // 处理Redis类型转换错误
          if (args.data && args.data.msg && args.data.msg.includes('Integer cannot be cast to java.lang.String')) {
            console.error('后端Redis错误:', args.data.msg);
            uni.showToast({
              title: '系统正在维护中，请稍后再试',
              icon: 'none',
              duration: 3000
            });
          }
          
          return args;
        },
        fail(err) {
          console.error('请求失败:', err);
          return err;
        },
        complete(res) {
          // 完成处理
          return res;
        }
      });
    },
    
    showErrorMessage(message) {
      this.errorMessage = message;
      this.showError = true;
      setTimeout(() => {
        this.dismissError();
      }, 5000);
    },
    
    dismissError() {
      this.showError = false;
      this.errorMessage = '';
    },
    
    showLoading() {
      this.isLoading = true;
    },
    
    hideLoading() {
      this.isLoading = false;
    }
  },
  globalStyle: {
    navigationBarTextStyle: 'white',
    usingComponents: {}
  }
}
</script>

<style lang="scss">
/* 引入通用样式 */
@import './common/styles/reset.scss';
@import './style/theme.scss';
@import './common/styles/global.scss';

/* 全局样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
  background-color: #f8f8f8;
  color: #333333;
}

/* 确保输入框文本颜色 */
uni-input,
input {
  color: #333333 !important;
}

.uni-input-input {
  color: #333333 !important;
}

.uni-input-placeholder {
  color: #999999 !important;
}

/* 重置样式 */
view, text, input, button {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

input {
  background-color: transparent;
  outline: none;
}

/* 避免iOS中输入框圆角和阴影 */
input, button {
  -webkit-appearance: none;
  border-radius: 0;
}

/* 处理H5下底部安全区域 */
@media screen and (min-width: 768px) {
  .login-container {
    max-width: 375px;
    margin: 0 auto;
  }
}

/* 底部Tab栏图标样式 */
.uni-tabbar {
  .uni-tabbar__icon {
    width: 48rpx !important;
    height: 48rpx !important;
    margin-bottom: 4rpx;
  }
  
  .uni-tabbar__label {
    font-size: 24rpx !important;
    line-height: 1.2 !important;
    margin-top: 2rpx;
  }
  
  /* 活跃状态 */
  .uni-tabbar-item--active .uni-tabbar__icon {
    filter: brightness(0) saturate(100%) invert(34%) sepia(47%) saturate(3867%) hue-rotate(213deg) brightness(91%) contrast(94%) !important;
  }
  
  /* 非活跃状态 */
  .uni-tabbar-item:not(.uni-tabbar-item--active) .uni-tabbar__icon {
    filter: brightness(0) saturate(100%) invert(60%) sepia(11%) saturate(361%) hue-rotate(202deg) brightness(94%) contrast(87%) !important;
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
  0% { transform: translateY(0); opacity: 0; }
  10% { opacity: 0.8; }
  100% { transform: translateY(-1000rpx); opacity: 0; }
}

@keyframes card-appear {
  0% { opacity: 0; transform: translateY(30rpx); }
  100% { opacity: 1; transform: translateY(0); }
}

/* 页面过渡动画 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter,
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50rpx);
}

.slide-left-leave-to,
.slide-right-enter {
  opacity: 0;
  transform: translateX(-50rpx);
}

/* 美化底部TabBar */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  backdrop-filter: blur(10rpx);
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  z-index: 100;
  
  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10rpx 0;
    
    .tab-icon {
      width: 48rpx;
      height: 48rpx;
      margin-bottom: 4rpx;
      filter: brightness(0) saturate(100%) invert(60%) sepia(11%) saturate(361%) hue-rotate(202deg) brightness(94%) contrast(87%);
    }
    
    .tab-text {
      font-size: 24rpx;
      color: #7A7E83;
      line-height: 1;
    }
    
    &.active {
      .tab-icon {
        filter: brightness(0) saturate(100%) invert(34%) sepia(47%) saturate(3867%) hue-rotate(213deg) brightness(91%) contrast(94%);
      }
      
      .tab-text {
        color: #4361ee;
      }
    }
  }
}

.error-message {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 87, 87, 0.9);
  color: white;
  padding: 20rpx;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-btn {
  margin-top: 10rpx;
  font-size: 24rpx;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
}

.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #f3f3f3;
  border-top: 6rpx solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: white;
  margin-top: 20rpx;
  font-size: 28rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 添加全局按钮样式 */
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.04);
  margin-bottom: 20rpx;
}

/* 全局背景色 */
.blue-gradient-bg {
  background: linear-gradient(135deg, #4361ee, #3a0ca3, #6930c3);
  background-size: 200% 200%;
  animation: gradient-shift 15s ease infinite;
}
</style>
