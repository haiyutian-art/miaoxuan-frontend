<template>
  <view class="tab-bar">
    <view 
      class="tab-item" 
      :class="{'active': currentTab === 'home'}" 
      @tap="switchTab('/pages/index/index')"
    >
      <image class="tab-icon" src="/static/images/icon-home.svg" mode="aspectFit"></image>
      <text class="tab-text">首页</text>
    </view>
    
    <view 
      class="tab-item" 
      :class="{'active': currentTab === 'course'}" 
      @tap="switchTab('/pages/course/term')"
      v-if="userRole !== 'admin'"
    >
      <image class="tab-icon" src="/static/images/icon-course.svg" mode="aspectFit"></image>
      <text class="tab-text">{{ userRole === 'student' ? '选课' : '课程' }}</text>
    </view>
    
    <view 
      class="tab-item" 
      :class="{'active': currentTab === 'schedule'}" 
      @tap="switchTab('/pages/schedule/index')"
      v-if="userRole !== 'admin'"
    >
      <image class="tab-icon" src="/static/images/icon-schedule.svg" mode="aspectFit"></image>
      <text class="tab-text">课表</text>
    </view>
    
    <view 
      class="tab-item" 
      :class="{'active': currentTab === 'manage'}" 
      @tap="switchTab('/pages/admin/index')"
      v-if="userRole === 'admin'"
    >
      <image class="tab-icon" src="/static/images/icon-admin.svg" mode="aspectFit"></image>
      <text class="tab-text">管理</text>
    </view>
    
    <view 
      class="tab-item" 
      :class="{'active': currentTab === 'profile'}" 
      @tap="switchTab('/pages/profile/index')"
    >
      <image class="tab-icon" src="/static/images/icon-profile.svg" mode="aspectFit"></image>
      <text class="tab-text">我的</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TabBar',
  props: {
    currentTab: {
      type: String,
      default: 'home'
    }
  },
  data() {
    return {
      userRole: 'student' // 默认为学生角色
    }
  },
  created() {
    // 从本地存储获取用户角色
    this.getUserRole()
  },
  methods: {
    switchTab(url) {
      uni.switchTab({
        url: url
      })
    },
    getUserRole() {
      try {
        // 先从缓存的userRole中获取
        const role = uni.getStorageSync('userRole')
        if (role) {
          this.userRole = role
          return
        }
        
        // 如果没有专门存储的角色，从userInfo中获取
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo && userInfo.role) {
          this.userRole = userInfo.role
          // 保存到专门的存储
          uni.setStorageSync('userRole', userInfo.role)
        }
      } catch (e) {
        console.error('获取用户角色失败', e)
      }
    }
  }
}
</script>

<style lang="scss">
/* 底部Tab栏 */
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
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
  
  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10rpx 0;
    position: relative;
    transition: all 0.3s ease;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%) scale(0);
      width: 20rpx;
      height: 6rpx;
      border-radius: 3rpx;
      background-color: #4361ee;
      transition: all 0.3s ease;
    }
    
    .tab-icon {
      width: 48rpx;
      height: 48rpx;
      margin-bottom: 4rpx;
      filter: brightness(0) saturate(100%) invert(60%) sepia(11%) saturate(361%) hue-rotate(202deg) brightness(94%) contrast(87%);
      transition: all 0.3s ease;
    }
    
    .tab-text {
      font-size: 24rpx;
      color: #7A7E83;
      line-height: 1;
      transition: all 0.3s ease;
    }
    
    &.active {
      &::after {
        transform: translateX(-50%) scale(1);
      }
      
      .tab-icon {
        filter: brightness(0) saturate(100%) invert(34%) sepia(47%) saturate(3867%) hue-rotate(213deg) brightness(91%) contrast(94%);
        transform: translateY(-5rpx);
      }
      
      .tab-text {
        color: #4361ee;
        font-weight: bold;
      }
    }
    
    &:active {
      opacity: 0.7;
    }
  }
}
</style> 