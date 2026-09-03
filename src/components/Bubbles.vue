<template>
  <view class="bubble-container">
    <!-- 使用静态气泡替代动态气泡 -->
    <view class="bubble" v-for="i in 5" :key="i" :style="getStaticBubbleStyle(i)"></view>
  </view>
</template>

<script>
export default {
  name: 'Bubbles',
  data() {
    return {
      // 移除定时器
    }
  },
  mounted() {
    // 移除动态创建气泡的逻辑
  },
  beforeDestroy() {
    // 移除定时器清理
  },
  methods: {
    // 替换为静态样式生成方法
    getStaticBubbleStyle(index) {
      // 预定义位置，避免运行时计算
      const positions = [
        { size: '40rpx', left: '10%', bottom: '20%' },
        { size: '60rpx', left: '30%', bottom: '40%' },
        { size: '45rpx', left: '50%', bottom: '15%' },
        { size: '70rpx', left: '70%', bottom: '35%' },
        { size: '55rpx', left: '85%', bottom: '25%' }
      ];
      
      const pos = positions[index - 1] || positions[0];
      return {
        width: pos.size,
        height: pos.size,
        left: pos.left,
        bottom: pos.bottom
      };
    }
  }
}
</script>

<style lang="scss">
.bubble-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1));
  box-shadow: 0 0 10rpx rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(1px);
  /* 移除动画 */
}

/* 移除动画关键帧定义 */
</style> 