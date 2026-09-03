<template>
  <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="nav-bar-content">
      <view class="left-area" @tap="goBack" v-if="showBack">
        <view class="back-btn">
          <image class="back-icon" src="/static/images/icon-back.svg" mode="aspectFit"></image>
        </view>
      </view>
      <view class="title-area">
        <text class="nav-title">{{ title }}</text>
      </view>
      <view class="right-area">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'NavBar',
  props: {
    title: {
      type: String,
      default: '秒选通'
    },
    showBack: {
      type: Boolean,
      default: true
    },
    bgColor: {
      type: String,
      default: 'transparent'
    }
  },
  data() {
    return {
      statusBarHeight: 20
    }
  },
  created() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 20;
  },
  methods: {
    goBack() {
      // 判断是否有上一级页面
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack({
          delta: 1
        });
      } else {
        // 没有上一级页面，返回首页
        uni.switchTab({
          url: '/pages/index/index'
        });
      }
    }
  }
}
</script>

<style lang="scss">
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  
  .nav-bar-content {
    position: relative;
    height: 88rpx;
    display: flex;
    align-items: center;
    
    .left-area {
      position: absolute;
      left: 30rpx;
      height: 100%;
      display: flex;
      align-items: center;
      
      .back-btn {
        width: 60rpx;
        height: 60rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        
        .back-icon {
          width: 40rpx;
          height: 40rpx;
          filter: brightness(0) invert(1);
        }
      }
    }
    
    .title-area {
      flex: 1;
      text-align: center;
      
      .nav-title {
        font-size: 36rpx;
        font-weight: bold;
        color: #ffffff;
        text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
      }
    }
    
    .right-area {
      position: absolute;
      right: 30rpx;
      height: 100%;
      display: flex;
      align-items: center;
    }
  }
}
</style> 