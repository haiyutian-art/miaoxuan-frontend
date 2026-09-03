<template>
  <view class="login-container">
    <view class="login-logo">
      <image src="/static/images/logo.svg" mode="widthFix"></image>
    </view>
    <view class="login-form">
      <view class="input-group">
        <image class="input-icon" src="/static/images/user-icon.svg" mode="aspectFit"></image>
        <input 
          class="input-field"
          type="text" 
          v-model="loginForm.username" 
          placeholder="请输入学号/工号" 
          style="color: #333333;"
          placeholder-style="color: #999999;"
        />
      </view>
      <view class="input-group">
        <image class="input-icon" src="/static/images/password-icon.svg" mode="aspectFit"></image>
        <input 
          class="input-field"
          type="password" 
          v-model="loginForm.password" 
          password 
          placeholder="请输入密码" 
          style="color: #333333;"
          placeholder-style="color: #999999;"
        />
      </view>
      <view class="role-select">
        <radio-group @change="radioChange">
          <label class="radio" :class="{ 'active': loginForm.role === 'student' }">
            <image class="role-icon" src="/static/images/student-icon.svg" mode="aspectFit"></image>
            <radio value="student" :checked="loginForm.role === 'student'" color="#0055ff" style="transform: scale(0.8);" />
            <text style="color: #333333;">学生</text>
          </label>
          <label class="radio" :class="{ 'active': loginForm.role === 'teacher' }">
            <image class="role-icon" src="/static/images/teacher-icon.svg" mode="aspectFit"></image>
            <radio value="teacher" :checked="loginForm.role === 'teacher'" color="#0055ff" style="transform: scale(0.8);" />
            <text style="color: #333333;">教师</text>
          </label>
        </radio-group>
      </view>
      <button type="primary" class="login-btn" @click="handleLogin" :loading="loading">登录</button>
      <view class="forget-password" @click="goToResetPassword">忘记密码?</view>
    </view>
    <view class="copyright">
      <text>Copyright ©2024 西安邮电大学 All Rights Reserved</text>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue';
import { login } from '@/api/user';

export default {
  setup() {
    const loginForm = ref({
      username: '',
      password: '',
      role: 'student'
    });
    
    const loading = ref(false);

    const radioChange = (e) => {
      loginForm.value.role = e.detail.value;
    };

    const handleLogin = async () => {
      // 表单验证
      if (!loginForm.value.username.trim()) {
        uni.showToast({
          title: '请输入学号/工号',
          icon: 'none'
        });
        return;
      }
      if (!loginForm.value.password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        });
        return;
      }

      try {
        loading.value = true;
        // 调用登录API
        const res = await login(loginForm.value);
        
        if (res.status === 1) {
          // 登录成功
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          });
          
          // 保存用户信息到本地存储
          uni.setStorageSync('token', res.token || 'temp-token');
          uni.setStorageSync('userInfo', {
            username: loginForm.value.username,
            role: loginForm.value.role
          });
          
          // 跳转到首页
          uni.reLaunch({
            url: '/pages/index/index'
          });
        } else {
          // 登录失败
          uni.showToast({
            title: res.msg || '登录失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('登录错误:', error);
        uni.showToast({
          title: '登录失败，请稍后重试',
          icon: 'none'
        });
      } finally {
        loading.value = false;
      }
    };

    const goToResetPassword = () => {
      uni.navigateTo({
        url: '/pages/resetPassword/resetPassword'
      });
    };

    return {
      loginForm,
      loading,
      radioChange,
      handleLogin,
      goToResetPassword
    };
  }
};
</script>

<style lang="scss">
/* 重置默认样式 */
page {
  background: linear-gradient(135deg, #f8f8f8, #ffffff);
}

.login-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0 40rpx;
}

.login-logo {
  padding: 80rpx 0;
  display: flex;
  justify-content: center;
  
  image {
    width: 60%;
    height: auto;
  }
}

.login-form {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.input-group {
  display: flex;
  align-items: center;
  border: 2rpx solid #eeeef0;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #ffffff;
  
  &:focus-within {
    border-color: #0055ff;
    box-shadow: 0 4rpx 16rpx rgba(0, 85, 255, 0.1);
    
    .input-icon {
      transform: scale(1.1);
    }
  }
  
  .input-icon {
    width: 44rpx;
    height: 44rpx;
    margin-right: 24rpx;
    transition: transform 0.3s ease;
  }
}

.input-field {
  flex: 1;
  height: 60rpx;
  font-size: 30rpx;
  color: #333333;
}

/* 修复密码显示/隐藏图标颜色 */
:deep(.uni-icons) {
  color: #666666 !important;
}

:deep(.uni-eye-active) {
  color: #0055ff !important;
}

.role-select {
  margin: 40rpx 0;
  
  radio-group {
    display: flex;
    justify-content: space-around;
    gap: 20rpx;
  }
  
  .radio {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24rpx 30rpx;
    background-color: rgba(248, 249, 250, 0.8);
    border-radius: 16rpx;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &.active {
      background-color: #ffffff;
      box-shadow: 0 4rpx 16rpx rgba(0, 85, 255, 0.1);
      
      .role-icon {
        transform: scale(1.1) rotate(5deg);
      }
      
      text {
        color: #0055ff !important;
        font-weight: 500;
      }
    }
    
    &:active {
      transform: scale(0.98);
    }
    
    .role-icon {
      width: 40rpx;
      height: 40rpx;
      margin-right: 12rpx;
      transition: all 0.3s ease;
    }
    
    text {
      margin-left: 12rpx;
      font-size: 28rpx;
      color: #666666;
      transition: all 0.3s ease;
    }
  }
}

.login-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  margin-top: 50rpx;
  background: linear-gradient(135deg, #0055ff, #00a3ff);
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff !important;
  letter-spacing: 2rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 85, 255, 0.2);
  
  &:active {
    transform: translateY(4rpx);
    box-shadow: 0 2rpx 10rpx rgba(0, 85, 255, 0.2);
  }
}

.forget-password {
  text-align: center;
  margin-top: 36rpx;
  color: #0055ff;
  font-size: 28rpx;
  font-weight: 500;
  opacity: 0.9;
  
  &:active {
    opacity: 0.7;
    transform: scale(0.98);
  }
}

.copyright {
  margin-top: auto;
  padding: 40rpx 0;
  text-align: center;
  color: #999999;
  font-size: 24rpx;
}
</style> 