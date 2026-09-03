<template>
  <view class="forgot-password-container">
    <!-- 背景装饰元素 -->
    <view class="background-decoration">
      <view class="bg-gradient"></view>
      <view class="bg-wave"></view>
      <view class="bg-circle"></view>
      
      <!-- 气泡元素 -->
      <view class="bubbles">
        <view class="bubble bubble-1"></view>
        <view class="bubble bubble-3"></view>
        <view class="bubble bubble-5"></view>
      </view>
    </view>

    <!-- 顶部导航 -->
    <view class="header">
      <view class="back-btn" @tap="goBack">
        <CommonIcon type="back" size="medium" clickable />
      </view>
    </view>
    
    <!-- 标题区域 -->
    <view class="title-section">
      <text class="page-title">{{currentStep === 1 ? '找回密码' : (currentStep === 2 ? '验证身份' : '重置密码')}}</text>
      <text class="page-subtitle">{{getStepDesc()}}</text>
    </view>
    
    <!-- 步骤指示器 -->
    <view class="step-indicator">
      <view class="step-item" :class="{active: currentStep >= 1, completed: currentStep > 1}">
        <view class="step-circle">1</view>
        <text class="step-text">身份验证</text>
      </view>
      <view class="step-line" :class="{active: currentStep > 1}"></view>
      <view class="step-item" :class="{active: currentStep >= 2, completed: currentStep > 2}">
        <view class="step-circle">2</view>
        <text class="step-text">验证码确认</text>
      </view>
      <view class="step-line" :class="{active: currentStep > 2}"></view>
      <view class="step-item" :class="{active: currentStep >= 3}">
        <view class="step-circle">3</view>
        <text class="step-text">设置新密码</text>
      </view>
    </view>
    
    <!-- 表单卡片 -->
    <view class="form-card">
      <!-- 第一步：身份验证 -->
      <block v-if="currentStep === 1">
        <!-- 表单区域 -->
        <view class="form-item">
          <text class="form-label">学号/工号</text>
          <view class="input-container" :class="{'focus': focusField === 'userno', 'error': errors.userno}">
            <image class="input-icon" src="/static/images/user-icon.svg" mode="aspectFit"></image>
            <input 
              class="input-field" 
              type="text" 
              v-model="formData.userno" 
              placeholder="请输入您的学号或工号"
              @focus="handleFocus('userno')"
              @blur="handleBlur('userno')"
            />
          </view>
          <text class="error-tip" v-if="errors.userno">请输入学号或工号</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">注册邮箱</text>
          <view class="input-container" :class="{'focus': focusField === 'email', 'error': errors.email}">
            <image class="input-icon" src="/static/images/email-icon.svg" mode="aspectFit"></image>
            <input 
              class="input-field" 
              type="text" 
              v-model="formData.email" 
              placeholder="请输入注册时使用的邮箱"
              @focus="handleFocus('email')"
              @blur="handleBlur('email')"
            />
          </view>
          <text class="error-tip" v-if="errors.email">请输入有效的邮箱地址</text>
        </view>
        
        <!-- 角色选择 -->
        <view class="form-item">
          <text class="form-label">选择身份</text>
          <view class="role-selector">
            <view class="role-option" 
              :class="{'active': formData.role === 'student'}" 
              @tap="selectRole('student')">
              <image class="role-icon" src="/static/images/student-icon.svg" mode="aspectFit"></image>
              <text class="role-text">学生</text>
            </view>
            <view class="role-option" 
              :class="{'active': formData.role === 'teacher'}" 
              @tap="selectRole('teacher')">
              <image class="role-icon" src="/static/images/teacher-icon.svg" mode="aspectFit"></image>
              <text class="role-text">教师</text>
            </view>
          </view>
        </view>
        
        <button class="action-btn" :loading="loading" @tap="requestVerificationCode">获取验证码</button>
        
        <view class="tips-text">
          <text>提示：验证码将发送到您注册时使用的邮箱</text>
        </view>
      </block>
      
      <!-- 第二步：验证码确认 -->
      <block v-if="currentStep === 2">
        <view class="form-item">
          <text class="form-label">输入验证码</text>
          <view class="verification-input">
            <view class="input-container" :class="{'focus': focusField === 'verificationCode', 'error': errors.verificationCode}">
              <image class="input-icon" src="/static/images/lock-icon.svg" mode="aspectFit"></image>
              <input 
                class="input-field" 
                type="text" 
                maxlength="6"
                v-model="formData.verificationCode" 
                placeholder="请输入邮箱收到的6位验证码"
                @focus="handleFocus('verificationCode')"
                @blur="handleBlur('verificationCode')"
              />
              <button 
                v-if="codeSent" 
                class="resend-btn disabled"
                disabled
              >{{countdown}}秒后重新发送</button>
              <button 
                v-else 
                class="resend-btn"
                @tap="requestVerificationCode"
                :loading="loading"
              >重新发送</button>
            </view>
          </view>
          <text class="error-tip" v-if="errors.verificationCode">请输入6位验证码</text>
        </view>
        
        <button class="action-btn" :loading="loading" @tap="verifyCode">验证</button>
        
        <view class="tips-text">
          <text>验证码有效期为5分钟，请尽快完成验证</text>
        </view>
      </block>
      
      <!-- 第三步：设置新密码 -->
      <block v-if="currentStep === 3">
        <view class="form-item">
          <text class="form-label">新密码</text>
          <view class="input-container" :class="{'focus': focusField === 'newPassword', 'error': errors.newPassword}">
            <image class="input-icon" src="/static/images/lock-icon.svg" mode="aspectFit"></image>
            <input 
              class="input-field" 
              type="password" 
              v-model="formData.newPassword" 
              placeholder="请输入新密码"
              @focus="handleFocus('newPassword')"
              @blur="handleBlur('newPassword')"
            />
          </view>
          <text class="error-tip" v-if="errors.newPassword">密码长度必须为6-16位</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">确认密码</text>
          <view class="input-container" :class="{'focus': focusField === 'confirmPassword', 'error': errors.confirmPassword}">
            <image class="input-icon" src="/static/images/lock-icon.svg" mode="aspectFit"></image>
            <input 
              class="input-field" 
              type="password" 
              v-model="formData.confirmPassword" 
              placeholder="请再次输入新密码"
              @focus="handleFocus('confirmPassword')"
              @blur="handleBlur('confirmPassword')"
            />
          </view>
          <text class="error-tip" v-if="errors.confirmPassword">两次输入的密码不一致</text>
        </view>
        
        <view class="password-tips">
          <text class="tips-title">密码要求：</text>
          <text class="tips-item">• 长度为6-16位</text>
          <text class="tips-item">• 建议包含字母、数字和特殊字符</text>
          <text class="tips-item">• 不要使用与其他平台相同的密码</text>
        </view>
        
        <button class="action-btn" :loading="loading" @tap="resetPassword">重置密码</button>
      </block>
    </view>
  </view>
</template>

<script>
import CommonIcon from '@/components/CommonIcon.vue'

import { API_BASE_URL } from '@/config'

export default {
  components: {
    CommonIcon
  },
  data() {
    return {
      currentStep: 1, // 当前步骤：1=身份验证，2=验证码确认，3=设置新密码
      focusField: '', // 当前焦点字段
      loading: false, // 按钮加载状态
      
      // 表单数据
      formData: {
        userno: '', // 学号/工号
        email: '',  // 邮箱
        role: 'student', // 默认角色为学生
        verificationCode: '', // 验证码
        newPassword: '', // 新密码
        confirmPassword: '' // 确认密码
      },
      
      // 错误状态
      errors: {
        userno: false,
        email: false,
        verificationCode: false,
        newPassword: false,
        confirmPassword: false
      },
      
      // 验证码计时器
      codeSent: false,
      countdown: 0,
      countdownTimer: null
    }
  },
  methods: {
    // 返回前一页
    goBack() {
      if (this.currentStep > 1) {
        this.currentStep--;
      } else {
        uni.navigateBack();
      }
    },
    
    // 获取当前步骤描述
    getStepDesc() {
      switch(this.currentStep) {
        case 1:
          return '请填写您的账号信息';
        case 2:
          return '请输入邮箱接收到的验证码';
        case 3:
          return '请设置您的新密码';
        default:
          return '';
      }
    },
    
    // 处理输入框焦点
    handleFocus(field) {
      this.focusField = field;
      if (this.errors[field]) {
        this.errors[field] = false;
      }
    },
    
    // 处理输入框失焦
    handleBlur(field) {
      this.focusField = '';
      this.validateField(field);
    },
    
    // 选择角色
    selectRole(role) {
      this.formData.role = role;
    },
    
    // 字段验证
    validateField(field) {
      switch(field) {
        case 'userno':
          this.errors.userno = !this.formData.userno;
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          this.errors.email = !emailRegex.test(this.formData.email);
          break;
        case 'verificationCode':
          this.errors.verificationCode = !this.formData.verificationCode || this.formData.verificationCode.length !== 6;
          break;
        case 'newPassword':
          this.errors.newPassword = !this.formData.newPassword || 
                                   this.formData.newPassword.length < 6 || 
                                   this.formData.newPassword.length > 16;
          break;
        case 'confirmPassword':
          this.errors.confirmPassword = this.formData.newPassword !== this.formData.confirmPassword;
          break;
      }
      return !this.errors[field];
    },
    
    // 验证第一步表单
    validateStep1() {
      this.validateField('userno');
      this.validateField('email');
      return !this.errors.userno && !this.errors.email;
    },
    
    // 验证第二步表单
    validateStep2() {
      this.validateField('verificationCode');
      return !this.errors.verificationCode;
    },
    
    // 验证第三步表单
    validateStep3() {
      this.validateField('newPassword');
      this.validateField('confirmPassword');
      return !this.errors.newPassword && !this.errors.confirmPassword;
    },
    
    // 请求验证码
    async requestVerificationCode() {
      if (!this.validateStep1()) {
        uni.showToast({
          title: '请正确填写所有信息',
          icon: 'none'
        });
        return;
      }
      
      this.loading = true;
      
      try {
        const response = await new Promise((resolve, reject) => {
          uni.request({
            url: `${API_BASE_URL}/verification-code`,
            method: 'POST',
            data: {
              userno: this.formData.userno,
              email: this.formData.email,
              role: this.formData.role
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: (res) => {
              console.log('验证码请求响应:', res);
              resolve(res);
            },
            fail: (err) => {
              console.error('验证码请求失败:', err);
              reject(err);
            }
          });
        });
        
        if (response.statusCode === 200 && response.data && response.data.status === 0) {
          // 验证码发送成功
          uni.showToast({
            title: '验证码已发送',
            icon: 'success'
          });
          
          // 如果当前在第一步，进入第二步
          if (this.currentStep === 1) {
            this.currentStep = 2;
          }
          
          // 开始倒计时
          this.startCountdown();
        } else {
          // 验证码发送失败
          uni.showToast({
            title: response.data && response.data.msg ? response.data.msg : '验证码发送失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.showToast({
          title: '请求失败，请检查网络',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 验证验证码
    async verifyCode() {
      if (!this.validateStep2()) {
        uni.showToast({
          title: '请输入6位验证码',
          icon: 'none'
        });
        return;
      }
      
      // 由于后端没有独立的验证码验证接口，这里直接进入第三步
      // 真实验证将在最终的重置密码请求中完成
      this.currentStep = 3;
    },
    
    // 重置密码
    async resetPassword() {
      if (!this.validateStep3()) {
        uni.showToast({
          title: '请检查密码格式',
          icon: 'none'
        });
        return;
      }
      
      this.loading = true;
      
      try {
        const response = await new Promise((resolve, reject) => {
          uni.request({
            url: `${API_BASE_URL}/reset-password`,
            method: 'POST',
            data: {
              userno: this.formData.userno,
              email: this.formData.email,
              yzm: this.formData.verificationCode,
              role: this.formData.role,
              newpass: this.formData.newPassword,
              newpass2: this.formData.confirmPassword
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: (res) => {
              console.log('重置密码响应:', res);
              resolve(res);
            },
            fail: (err) => {
              console.error('重置密码请求失败:', err);
              reject(err);
            }
          });
        });
        
        if (response.statusCode === 200 && response.data && response.data.status === 0) {
          // 密码重置成功
          uni.showModal({
            title: '重置成功',
            content: '密码重置成功，请使用新密码登录',
            showCancel: false,
            success: () => {
              // 返回登录页面
              uni.navigateBack();
            }
          });
        } else {
          // 密码重置失败
          uni.showToast({
            title: response.data && response.data.msg ? response.data.msg : '密码重置失败',
            icon: 'none',
            duration: 2000
          });
        }
      } catch (error) {
        uni.showToast({
          title: '请求失败，请检查网络',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 开始倒计时
    startCountdown() {
      this.codeSent = true;
      this.countdown = 60;
      
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
      }
      
      this.countdownTimer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          clearInterval(this.countdownTimer);
          this.codeSent = false;
        }
      }, 1000);
    }
  },
  // 组件销毁时清除定时器
  beforeDestroy() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }
}
</script>

<style lang="scss">
/* 移除错误的字体引用 */
/* 使用图片代替字体图标 */

.back-icon {
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
  line-height: 1;
}

.forgot-password-container {
  height: 100vh;
  background: linear-gradient(135deg, #4361ee, #3a0ca3, #6930c3);
  background-size: 200% 200%;
  animation: gradient-shift 15s ease infinite;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 30rpx;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
  
  .bg-gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(67, 97, 238, 0.8), rgba(58, 12, 163, 0.8), rgba(105, 48, 195, 0.8));
    opacity: 0.8;
  }
  
  .bg-wave {
    position: absolute;
    bottom: -100rpx;
    left: -100rpx;
    right: -100rpx;
    height: 300rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 100% 100% 0 0;
  }
  
  .bg-circle {
    position: absolute;
    top: -250rpx;
    right: -250rpx;
    width: 500rpx;
    height: 500rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }
  
  .bubbles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    
    .bubble {
      position: absolute;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
      animation: bubble-float linear infinite;
      
      &.bubble-1 {
        width: 40rpx;
        height: 40rpx;
        left: 10%;
        top: 40%;
        animation-duration: 10s;
      }
      
      &.bubble-3 {
        width: 60rpx;
        height: 60rpx;
        left: 50%;
        top: 20%;
        animation-duration: 12s;
        animation-delay: -5s;
      }
      
      &.bubble-5 {
        width: 30rpx;
        height: 30rpx;
        left: 80%;
        top: 70%;
        animation-duration: 8s;
        animation-delay: -3s;
      }
    }
  }
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes bubble-float {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  20% {
    opacity: 0.8;
  }
  80% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-100vh) translateX(50rpx);
    opacity: 0;
  }
}

/* 头部导航 */
.header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  padding: 60rpx 0 30rpx;
  
  .back-btn {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transition: background-color 0.2s;
    
    &:active {
      background-color: rgba(255, 255, 255, 0.3);
    }
  }
}

/* 标题区域 */
.title-section {
  position: relative;
  z-index: 10;
  margin: 20rpx 0 60rpx;
  
  .page-title {
    font-size: 48rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 16rpx;
    display: block;
  }
  
  .page-subtitle {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
    display: block;
  }
}

/* 步骤指示器 */
.step-indicator {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40rpx;
  margin-bottom: 60rpx;
  
  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
    
    .step-circle {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.3);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      font-weight: bold;
      margin-bottom: 12rpx;
      transition: background-color 0.3s;
    }
    
    .step-text {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.6);
      transition: color 0.3s;
    }
    
    &.active {
      .step-circle {
        background-color: #fff;
        color: #4361ee;
      }
      
      .step-text {
        color: #fff;
        font-weight: 500;
      }
    }
    
    &.completed {
      .step-circle {
        background-color: #4CAF50;
        color: #fff;
      }
    }
  }
  
  .step-line {
    height: 2rpx;
    background-color: rgba(255, 255, 255, 0.3);
    flex: 1;
    margin: 0 10rpx;
    position: relative;
    top: -30rpx;
    z-index: 1;
    transition: background-color 0.3s;
    
    &.active {
      background-color: #4CAF50;
    }
  }
}

/* 表单卡片 */
.form-card {
  position: relative;
  z-index: 10;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.2);
  margin-bottom: 30rpx;
  
  .form-item {
    margin-bottom: 30rpx;
    
    .form-label {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 12rpx;
      display: block;
    }
    
    .input-container {
      display: flex;
      align-items: center;
      background-color: #f5f7fa;
      border-radius: 16rpx;
      padding: 0 24rpx;
      height: 90rpx;
      border: 2rpx solid transparent;
      transition: all 0.3s;
      
      .input-icon {
        width: 40rpx;
        height: 40rpx;
        margin-right: 16rpx;
      }
      
      .input-field {
        flex: 1;
        height: 90rpx;
        font-size: 28rpx;
        color: #333;
      }
      
      &.focus {
        background-color: #fff;
        border-color: #4361ee;
        box-shadow: 0 0 0 2rpx rgba(67, 97, 238, 0.2);
      }
      
      &.error {
        border-color: #ff4d4f;
        background-color: #fff2f0;
      }
    }
    
    .error-tip {
      font-size: 24rpx;
      color: #ff4d4f;
      margin-top: 8rpx;
    }
    
    /* 验证码输入样式 */
    .verification-input {
      position: relative;
      
      .input-container {
        padding-right: 200rpx; /* 为重发按钮留出空间 */
      }
      
      .resend-btn {
        position: absolute;
        right: 10rpx;
        top: 50%;
        transform: translateY(-50%);
        height: 60rpx;
        line-height: 60rpx;
        font-size: 24rpx;
        background-color: #4361ee;
        color: #fff;
        border-radius: 30rpx;
        padding: 0 16rpx;
        min-width: 160rpx;
        z-index: 5;
        
        &.disabled {
          background-color: #ccc;
          color: #fff;
        }
      }
    }
  }
  
  /* 角色选择器 */
  .role-selector {
    display: flex;
    margin-bottom: 20rpx;
    
    .role-option {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 90rpx;
      background-color: #f5f7fa;
      margin: 0 10rpx;
      border-radius: 16rpx;
      transition: all 0.3s;
      
      &:first-child {
        margin-left: 0;
      }
      
      &:last-child {
        margin-right: 0;
      }
      
      .role-icon {
        width: 36rpx;
        height: 36rpx;
        margin-right: 12rpx;
      }
      
      .role-text {
        font-size: 28rpx;
        color: #666;
      }
      
      &.active {
        background-color: #4361ee;
        box-shadow: 0 4rpx 12rpx rgba(67, 97, 238, 0.2);
        
        .role-icon, .role-text {
          color: #fff;
        }
      }
    }
  }
  
  /* 密码提示样式 */
  .password-tips {
    background-color: #f0f7ff;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 30rpx;
    
    .tips-title {
      font-size: 26rpx;
      color: #4361ee;
      margin-bottom: 10rpx;
      display: block;
      font-weight: 500;
    }
    
    .tips-item {
      font-size: 24rpx;
      color: #666;
      line-height: 36rpx;
      display: block;
    }
  }
  
  /* 操作按钮 */
  .action-btn {
    width: 100%;
    height: 90rpx;
    background: linear-gradient(135deg, #4361ee, #3a0ca3);
    color: #fff;
    font-size: 32rpx;
    font-weight: 500;
    border-radius: 16rpx;
    margin-top: 20rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 8rpx 16rpx rgba(67, 97, 238, 0.2);
  }
  
  /* 提示文本 */
  .tips-text {
    font-size: 24rpx;
    color: #999;
    text-align: center;
    line-height: 1.5;
  }
}
</style> 
