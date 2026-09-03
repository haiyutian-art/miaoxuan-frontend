<template>
  <view class="password-container">
    <!-- 移除动态背景装饰元素 -->
    <view class="background-decoration">
      <view class="bg-gradient"></view>
      <!-- 移除动态波浪和圆圈元素 -->
      
      <!-- 移除气泡元素 -->
    </view>

    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-button" @tap="navigateBack">
        <text class="back-icon">
          <image src="/static/images/icon-back.svg" mode="aspectFit"></image>
        </text>
      </view>
      <text class="page-title">修改密码</text>
      <view class="placeholder"></view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-box">
      <view class="form-card">
        <view class="form-header">
          <text class="form-title">密码修改</text>
          <text class="form-subtitle">请输入原密码和新密码</text>
        </view>
        
        <view class="form-item">
          <text class="label">原密码</text>
          <input 
            class="input-field" 
            type="password" 
            placeholder="请输入原密码" 
            v-model="formData.oldPassword"
            :focus="focusOldPassword"
            @focus="handleFocus('oldPassword')"
            @blur="handleBlur('oldPassword')"
          />
          <view class="form-border" :class="{'active': focusOldPassword}"></view>
        </view>
        
        <view class="form-item">
          <text class="label">新密码</text>
          <input 
            class="input-field" 
            type="password" 
            placeholder="请输入6-16位新密码" 
            v-model="formData.newPassword"
            :focus="focusNewPassword"
            @focus="handleFocus('newPassword')"
            @blur="handleBlur('newPassword')"
          />
          <view class="form-border" :class="{'active': focusNewPassword}"></view>
        </view>
        
        <view class="form-item">
          <text class="label">确认新密码</text>
          <input 
            class="input-field" 
            type="password" 
            placeholder="请再次输入新密码" 
            v-model="formData.confirmPassword"
            :focus="focusConfirmPassword"
            @focus="handleFocus('confirmPassword')"
            @blur="handleBlur('confirmPassword')"
          />
          <view class="form-border" :class="{'active': focusConfirmPassword}"></view>
        </view>
        
        <view class="password-rules">
          <text class="rule-title">密码须符合以下规则：</text>
          <view class="rule-item">
            <text class="rule-bullet"></text>
            <text class="rule-text">长度为6-16个字符</text>
          </view>
          <view class="rule-item">
            <text class="rule-bullet"></text>
            <text class="rule-text">必须包含字母和数字</text>
          </view>
          <view class="rule-item">
            <text class="rule-bullet"></text>
            <text class="rule-text">不能与原密码相同</text>
          </view>
        </view>
        
        <view class="form-buttons">
          <view class="submit-button" @tap="submitForm">确认修改</view>
          <view class="cancel-button" @tap="navigateBack">取消</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { API_BASE_URL } from '@/config'

export default {
  data() {
    return {
      formData: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      focusOldPassword: false,
      focusNewPassword: false,
      focusConfirmPassword: false,
      usingBackupMethod: false
    }
  },
  methods: {
    navigateBack() {
      uni.navigateBack()
    },
    handleFocus(field) {
      if (field === 'oldPassword') this.focusOldPassword = true
      if (field === 'newPassword') this.focusNewPassword = true
      if (field === 'confirmPassword') this.focusConfirmPassword = true
    },
    handleBlur(field) {
      if (field === 'oldPassword') this.focusOldPassword = false
      if (field === 'newPassword') this.focusNewPassword = false
      if (field === 'confirmPassword') this.focusConfirmPassword = false
    },
    validateForm() {
      if (!this.formData.oldPassword) {
        uni.showToast({ title: '请输入原密码', icon: 'none' })
        return false
      }
      
      if (!this.formData.newPassword) {
        uni.showToast({ title: '请输入新密码', icon: 'none' })
        return false
      }
      
      if (this.formData.newPassword.length < 6 || this.formData.newPassword.length > 16) {
        uni.showToast({ title: '密码长度应为6-16位', icon: 'none' })
        return false
      }
      
      const hasLetter = /[a-zA-Z]/.test(this.formData.newPassword)
      const hasNumber = /[0-9]/.test(this.formData.newPassword)
      
      if (!hasLetter || !hasNumber) {
        uni.showToast({ title: '密码必须包含字母和数字', icon: 'none' })
        return false
      }
      
      if (this.formData.newPassword === this.formData.oldPassword) {
        uni.showToast({ title: '新密码不能与原密码相同', icon: 'none' })
        return false
      }
      
      if (this.formData.newPassword !== this.formData.confirmPassword) {
        uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
        return false
      }
      
      return true
    },
    submitForm() {
      if (!this.validateForm()) return
      
      // 显示加载提示
      uni.showLoading({ title: '提交中...' })
      
      // 获取用户信息
      const username = uni.getStorageSync('studentNo')
      const password = this.formData.oldPassword
      
      if (!username) {
        uni.hideLoading()
        uni.showToast({ 
          title: '缺少学号信息，请重新登录', 
          icon: 'none' 
        })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/login/index' })
        }, 1500)
        return
      }
      
      // 最有效的方法：登录后修改密码
      this.loginThenModifyPassword(username, password)
    },
    
    // 最直接可靠的方法：先登录，然后修改密码
    loginThenModifyPassword(username, password) {
      console.log('尝试登录后修改密码...')
      
      // 第一步：登录获取会话
      uni.request({
        url: `${API_BASE_URL}/login`,
        method: 'POST',
        data: {
          username: username,
          password: password,
          role: 'student'
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: (loginRes) => {
          console.log('登录响应:', loginRes)
          
          if (loginRes.statusCode === 200 && loginRes.data && loginRes.data.status === 0) {
            console.log('登录成功，开始修改密码')
            
            // 获取所有cookies
            let cookieStr = '';
            if (loginRes.cookies && loginRes.cookies.length > 0) {
              cookieStr = loginRes.cookies.join('; ');
            }
            
            // 第二步：修改密码
            this.executePasswordChange(cookieStr, username)
          } else {
            uni.hideLoading()
            uni.showToast({
              title: '原密码验证失败',
              icon: 'none'
            })
          }
        },
        fail: (err) => {
          console.error('登录失败:', err)
          uni.hideLoading()
          uni.showToast({
            title: '网络错误，请稍后再试',
            icon: 'none'
          })
        }
      })
    },
    
    // 执行密码修改请求
    executePasswordChange(cookies, username) {
      uni.request({
        url: `${API_BASE_URL}/student/password`,
        method: 'POST',
        data: {
          oldpass: this.formData.oldPassword,
          newpass: this.formData.newPassword,
          newpass2: this.formData.confirmPassword,
          // 使用当前学生学号作为 token，确保后端定位到正确的学生
          token: uni.getStorageSync('studentNo')
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        withCredentials: true,
        success: (res) => {
          console.log('密码修改响应:', res.data)
          
          // 记录新密码，供稍后登录使用
          const newPassword = this.formData.newPassword
          
          if (res.data && res.data.status === 0) {
            // 密码修改成功，使用新密码重新登录来确认修改生效
            this.confirmNewPassword(username, newPassword)
          } else {
            uni.hideLoading()
            const msg = res.data?.msg || '密码修改失败'
            uni.showToast({
              title: msg,
              icon: 'none'
            })
          }
        },
        fail: (err) => {
          console.error('密码修改请求失败:', err)
          uni.hideLoading()
          uni.showToast({
            title: '网络错误，请稍后再试',
            icon: 'none'
          })
        }
      })
    },
    
    // 确认新密码生效
    confirmNewPassword(username, newPassword) {
      // 用新密码登录确认
      uni.request({
        url: `${API_BASE_URL}/login`,
        method: 'POST',
        data: {
          username: username,
          password: newPassword,
          role: 'student'
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: (res) => {
          console.log('新密码登录验证结果:', res.data)
          uni.hideLoading()
          
          if (res.statusCode === 200 && res.data && res.data.status === 0) {
            // 新密码登录成功，说明生效了
            // 更新本地存储的token
            if (res.data.data) {
              uni.setStorageSync('token', res.data.data)
            }
            
            uni.showToast({
              title: '密码修改成功',
              icon: 'success'
            })
            
            setTimeout(() => {
              // 返回上一页
              this.navigateBack()
            }, 1500)
          } else {
            // 新密码登录失败，提示用户
            uni.showToast({
              title: '密码已修改，请重新登录',
              icon: 'none'
            })
            
            setTimeout(() => {
              // 导航到登录页
              uni.navigateTo({
                url: '/pages/login/index'
              })
            }, 1500)
          }
        },
        fail: (err) => {
          console.error('新密码验证失败:', err)
          uni.hideLoading()
          
          uni.showToast({
            title: '密码已修改，请手动登录',
            icon: 'none'
          })
          
          setTimeout(() => {
            // 导航到登录页
            uni.navigateTo({
              url: '/pages/login/index'
            })
          }, 1500)
        }
      })
    }
  }
}
</script>

<style lang="scss">
.password-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #4361ee, #3a0ca3, #6930c3);
  background-size: 100% 100%; /* 固定背景大小，不再使用动态效果 */
  position: relative;
  display: flex;
  flex-direction: column;
  padding-bottom: 40rpx;
}

/* 简化背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  
  .bg-gradient {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  }
  
  /* 移除波浪和圆圈动画 */
  
  /* 移除气泡元素动画 */
}

/* 顶部导航栏 */
.header {
  width: 100%;
  height: 100rpx;
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 10;
  margin-top: 20rpx;
  
  .back-button {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    
    .back-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.2);
      
      image {
        width: 30rpx;
        height: 30rpx;
        filter: brightness(0) invert(1); /* 白色 */
      }
    }
  }
  
  .page-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
  }
  
  .placeholder {
    width: 60rpx;
  }
}

/* 内容区域 */
.content-box {
  flex: 1;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
}

/* 表单卡片 */
.form-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.15);
  /* 移除卡片出现动画 */
  margin-top: 20rpx;
  
  .form-header {
    margin-bottom: 40rpx;
    
    .form-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      display: block;
      margin-bottom: 10rpx;
    }
    
    .form-subtitle {
      font-size: 28rpx;
      color: #666;
      display: block;
    }
  }
  
  .form-item {
    margin-bottom: 30rpx;
    position: relative;
    
    .label {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 10rpx;
      display: block;
      font-weight: 500;
    }
    
    .input-field {
      width: 100%;
      height: 80rpx;
      font-size: 28rpx;
      color: #333;
      background-color: rgba(240, 240, 240, 0.6);
      border-radius: 12rpx;
      padding: 0 20rpx;
      /* 移除输入框过渡动画 */
      
      &:focus {
        background-color: rgba(240, 240, 240, 0.9);
      }
    }
    
    .form-border {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 2rpx;
      background: linear-gradient(90deg, #4361ee, #3a0ca3);
      transition: width 0.3s ease; /* 保留这一过渡效果以提高用户体验 */
      
      &.active {
        width: 100%;
      }
    }
  }
  
  /* 密码规则提示 */
  .password-rules {
    margin: 20rpx 0 40rpx;
    padding: 20rpx;
    background: rgba(240, 240, 240, 0.6);
    border-radius: 12rpx;
    
    .rule-title {
      font-size: 26rpx;
      color: #666;
      margin-bottom: 10rpx;
      display: block;
    }
    
    .rule-item {
      display: flex;
      align-items: center;
      margin: 8rpx 0;
      
      .rule-bullet {
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
        background-color: #4361ee;
        margin-right: 12rpx;
      }
      
      .rule-text {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
  
  /* 按钮区域 */
  .form-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 20rpx;
    
    .submit-button, .cancel-button {
      width: 48%;
      height: 80rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 40rpx;
      font-size: 30rpx;
      font-weight: 500;
      /* 移除按钮过渡动画 */
    }
    
    .submit-button {
      background: linear-gradient(90deg, #4361ee, #3a0ca3);
      color: #fff;
      box-shadow: 0 10rpx 20rpx rgba(74, 97, 238, 0.3);
      
      &:active {
        /* 移除按钮缩放效果 */
        box-shadow: 0 6rpx 10rpx rgba(74, 97, 238, 0.2);
      }
    }
    
    .cancel-button {
      background: rgba(240, 240, 240, 0.8);
      color: #666;
      
      &:active {
        background: rgba(220, 220, 220, 0.8);
        /* 移除按钮缩放效果 */
      }
    }
  }
}

/* 移除所有动画关键帧定义 */
</style> 
