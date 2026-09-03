<template>
  <view class="icon-wrapper" :class="[size, type]" @tap="handleTap">
    <image 
      :src="getIconPath" 
      mode="aspectFit"
      :class="{'icon-image': true, 'clickable': clickable}"
    ></image>
  </view>
</template>

<script>
export default {
  name: 'CommonIcon',
  props: {
    type: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: 'medium'
    },
    clickable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    getIconPath() {
      return `/static/images/icon-${this.type}.svg`
    }
  },
  methods: {
    handleTap() {
      if (this.clickable) {
        this.$emit('tap')
      }
    }
  }
}
</script>

<style lang="scss">
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &.small {
    width: 32rpx;
    height: 32rpx;
  }
  
  &.medium {
    width: 48rpx;
    height: 48rpx;
  }
  
  &.large {
    width: 64rpx;
    height: 64rpx;
  }
  
  .icon-image {
    width: 100%;
    height: 100%;
    
    &.clickable {
      cursor: pointer;
    }
  }
}
</style> 