<template>
  <view class="login-container">
    <!-- 背景装饰元素 -->
    <view class="background-decoration">
      <view class="bg-gradient"></view>
      <view class="bg-wave"></view>
      <view class="bg-circle"></view>
      
      <!-- 添加气泡元素，减少气泡数量以提高性能 -->
      <view class="bubbles">
        <view class="bubble bubble-1"></view>
        <view class="bubble bubble-3"></view>
        <view class="bubble bubble-5"></view>
        <view class="bubble bubble-7"></view>
      </view>
    </view>

    <!-- 顶部品牌区域 -->
    <view class="header">
      <view class="logo-container">
        <image class="logo" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+CiAgPCEtLSDok53oibLlnIblvaLog4zmnKwgLS0+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI5NSIgZmlsbD0iIzEyOTZkYiIgLz4KICAKICA8IS0tIOeZveiJsuWchuejiiAtLT4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9Ijc1IiBmaWxsPSIjZmZmZmZmIiAvPgogIAogIDwhLS0g6JOd6Imy5YaF5ZyGIC0tPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNTUiIGZpbGw9IiMxMjk2ZGIiIC8+CiAgCiAgPCEtLSBYVVBU55m96Imy5a2X5qCHIC0tPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTA1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZmZmZmZmIj5YVVBUPC90ZXh0Pgo8L3N2Zz4=" mode="aspectFit"></image>
        <view class="app-badge">秒选通</view>
      </view>
    </view>
    
    <!-- 欢迎文字区域 -->
    <view class="welcome-section">
      <text class="welcome-title">欢迎登录</text>
      <text class="welcome-subtitle">西安邮电大学智能选课系统</text>
    </view>
    
    <!-- 登录表单卡片 -->
    <view class="login-card">
      <text class="login-title">账号登录</text>
      <text class="login-subtitle">登录后即可使用全部功能</text>
      
      <!-- 登录表单 -->
      <view class="login-form">
        <view class="input-group">
          <view class="input-item" :class="{'focus': formFocus === 'username', 'error': formErrors.username}">
            <view class="icon-container">
              <image class="input-icon" src="/static/images/user-icon.svg" mode="aspectFit"></image>
            </view>
            <input 
              type="text" 
              v-model="formData.username" 
              placeholder="请输入账号" 
              placeholder-class="input-placeholder"
              @focus="handleFocus('username')"
              @blur="handleBlur('username')"
            />
            <view class="input-border"></view>
          </view>
          <view class="input-item" :class="{'focus': formFocus === 'password', 'error': formErrors.password}">
            <view class="icon-container">
              <image class="input-icon" src="/static/images/lock-icon.svg" mode="aspectFit"></image>
            </view>
            <input v-if="showPassword"
              type="text"
              v-model="passwordDisplay" 
              placeholder="请输入密码" 
              placeholder-class="input-placeholder"
              @focus="handleFocus('password')"
              @blur="handleBlur('password')"
              @input="handlePasswordInput"
            />
            <input v-else
              type="text"
              v-model="passwordDisplay" 
              placeholder="请输入密码" 
              placeholder-class="input-placeholder"
              @focus="handleFocus('password')"
              @blur="handleBlur('password')"
              @input="handlePasswordInput"
            />
            <view class="password-toggle" @tap.stop="togglePasswordVisibility">
              <image class="toggle-icon" :src="showPassword ? '/static/images/eye-open.svg' : '/static/images/eye-close.svg'" mode="aspectFit"></image>
            </view>
            <view class="input-border"></view>
          </view>
        </view>
      </view>
      
      <!-- 角色选择 -->
      <view class="role-selector">
        <view class="role-option" 
          :class="{'active': isStudentActive}" 
          @tap="selectRole('student')">
          <image class="role-icon" src="/static/images/student-icon.svg" mode="aspectFit"></image>
          <text class="role-text">学生</text>
        </view>
        <view class="role-option" 
          :class="{'active': isTeacherActive}" 
          @tap="selectRole('teacher')">
          <image class="role-icon" src="/static/images/teacher-icon.svg" mode="aspectFit"></image>
          <text class="role-text">教师</text>
        </view>
      </view>
      
      <!-- 登录按钮 -->
      <button class="login-btn" :loading="loading" @tap="handleLogin">登录</button>
      
      <!-- 底部链接 -->
      <view class="bottom-links">
        <text class="link-item" @tap="handleForgotPassword">忘记密码?</text>
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
        username: '',
        password: '',
        role: 'student'
      },
      formFocus: '',
      formErrors: {
        username: false,
        password: false
      },
      loading: false,
      showPassword: false,
      passwordDisplay: ''
    }
  },
  computed: {
    usernameClasses() {
      return {
        'focus': this.formFocus === 'username',
        'error': this.formErrors.username
      }
    },
    passwordClasses() {
      return {
        'focus': this.formFocus === 'password',
        'error': this.formErrors.password
      }
    },
    isStudentActive() {
      return this.formData.role === 'student'
    },
    isTeacherActive() {
      return this.formData.role === 'teacher'
    }
  },
  mounted() {
    // 初始化密码显示
    this.updatePasswordDisplay()
    
    const preloadImages = [
      '/static/images/user-icon.svg',
      '/static/images/lock-icon.svg',
      '/static/images/student-icon.svg',
      '/static/images/teacher-icon.svg'
    ]
    
    preloadImages.forEach(src => {
      const img = new Image()
      img.src = src
    })
  },
  methods: {
    handleFocus(field) {
      this.formFocus = field
      if (this.formErrors[field]) {
        this.formErrors[field] = false
      }
    },
    handleBlur(field) {
      this.formFocus = ''
      this.validateField(field)
    },
    selectRole(role) {
      if (this.formData.role !== role) {
        this.formData.role = role
      }
    },
    validateField(field) {
      if (field === 'username' || field === 'all') {
        this.formErrors.username = !this.formData.username
      }
      if (field === 'password' || field === 'all') {
        this.formErrors.password = !this.formData.password
      }
      
      return field === 'all' ? !this.formErrors.username && !this.formErrors.password : !this.formErrors[field]
    },
    async handleLogin() {
      uni.removeStorageSync('token');
      uni.removeStorageSync('jsessionid');
      uni.removeStorageSync('sessionCookie');
      
      if (!this.validateField('all')) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
        return;
      }
      
      this.loading = true;
      
      // 硬编码测试账号验证
      if (this.isTestAccount()) {
        this.handleTestLogin();
        return;
      }
      
      try {
        const loginResponse = await new Promise((resolve, reject) => {
          uni.request({
            url: `${API_BASE_URL}/login`,
            method: 'POST',
            data: {
              username: this.formData.username,
              password: this.formData.password,
              role: this.formData.role
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            withCredentials: true,
            success: (res) => {
              console.log('登录API响应:', res);
              
              if (res.header && (res.header['Set-Cookie'] || res.header['set-cookie'])) {
                let setCookie = res.header['Set-Cookie'] || res.header['set-cookie'];
                console.log('服务器返回的Set-Cookie:', setCookie);
                
                uni.setStorageSync('sessionCookie', setCookie);
                
                if (typeof setCookie === 'string' && setCookie.includes('JSESSIONID=')) {
                  const match = setCookie.match(/JSESSIONID=([^;]+)/);
                  if (match) {
                    const jsessionid = match[1];
                    uni.setStorageSync('jsessionid', jsessionid);
                    console.log('提取并保存的JSESSIONID:', jsessionid);
                  }
                }
              }
              
              resolve(res);
            },
            fail: (err) => {
              console.error('登录API错误:', err);
              reject(err);
            }
          });
        });
        
        if (loginResponse.statusCode === 200 && loginResponse.data.status === 0) {
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          });
          
          uni.setStorageSync('token', this.formData.username);
          console.log('保存token:', this.formData.username);
          
          this.clearPreviousUserData();
          
          uni.setStorageSync('userInfo', {
            username: this.formData.username,
            role: this.formData.role
          });
          
          uni.setStorageSync('loginTime', new Date().getTime());
          
          try {
            const jsessionid = uni.getStorageSync('jsessionid');
            const sessionCookie = uni.getStorageSync('sessionCookie');
            
            const userInfoResponse = await new Promise((resolve, reject) => {
              uni.request({
                url: `${API_BASE_URL}/user/info`,
                method: 'GET',
                header: {
                  'Content-Type': 'application/json; charset=UTF-8',
                  'Cookie': sessionCookie || ('JSESSIONID=' + jsessionid)
                },
                withCredentials: true,
                success: (res) => {
                  console.log('用户信息API响应:', res);
                  resolve(res);
                },
                fail: (err) => {
                  console.error('用户信息API错误:', err);
                  reject(err);
                }
              });
            });
            
            const isValidResponse = userInfoResponse.statusCode === 200;
            
            if (isValidResponse) {
              if (userInfoResponse.data && userInfoResponse.data.status === 0 && userInfoResponse.data.data) {
                const userData = userInfoResponse.data.data;
                console.log('获取用户数据成功:', userData);
                
                this.saveUserData(userData);
              } else {
                console.log('API响应成功但无用户数据，使用默认数据');
                const defaultData = {
                  username: this.formData.username,
                  id: this.formData.username,
                  role: this.formData.role
                };
                
                this.saveUserData(defaultData);
              }
            } else {
              console.log('获取用户信息失败，使用默认数据');
              const defaultData = {
                username: this.formData.username,
                id: this.formData.username,
                role: this.formData.role
              };
              
              this.saveUserData(defaultData);
            }
          } catch (userError) {
            console.error('获取用户信息失败:', userError);
          }
          
          setTimeout(() => {
            if (this.formData.role === 'student') {
              uni.reLaunch({
                url: '/pages/index/index'
              });
            } else {
              uni.reLaunch({
                url: '/pages/teacher/index'
              });
            }
          }, 1500);
        } else {
          uni.showToast({
            title: loginResponse.data.msg || '登录失败，请检查账号密码',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.showToast({
          title: '登录失败，请检查网络连接',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    handleForgotPassword() {
      uni.navigateTo({
        url: '/pages/login/forgot-password'
      })
    },
    handleRegister() {
      uni.showToast({
        title: '即将跳转到新生注册页面',
        icon: 'none'
      })
    },
    confirmLogout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出当前账号吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            
            uni.reLaunch({
              url: '/pages/login/index'
            })
          }
        }
      })
    },
    // 测试账号验证
    isTestAccount() {
      const testAccounts = {
        student: {
          username: 'test_student',
          password: '123456'
        },
        teacher: {
          username: 'test_teacher', 
          password: '123456'
        }
      };
      
      const currentRole = this.formData.role;
      const currentAccount = testAccounts[currentRole];
      
      return currentAccount && 
             this.formData.username === currentAccount.username && 
             this.formData.password === currentAccount.password;
    },
    
    // 处理测试账号登录
    handleTestLogin() {
      console.log('使用测试账号登录:', this.formData.username, this.formData.role);
      
      // 模拟登录成功
      uni.showToast({
        title: '测试账号登录成功',
        icon: 'success'
      });
      
      // 保存测试账号信息
      uni.setStorageSync('token', this.formData.username);
      uni.setStorageSync('userInfo', {
        username: this.formData.username,
        role: this.formData.role
      });
      uni.setStorageSync('loginTime', new Date().getTime());
      
      // 清除之前的数据
      this.clearPreviousUserData();
      
      // 设置默认用户数据
      const defaultData = {
        username: this.formData.username,
        id: this.formData.username,
        role: this.formData.role
      };
      
      this.saveUserData(defaultData);
      
      // 延迟跳转
      setTimeout(() => {
        if (this.formData.role === 'student') {
          uni.reLaunch({
            url: '/pages/index/index'
          });
        } else {
          uni.reLaunch({
            url: '/pages/teacher/index'
          });
        }
      }, 1500);
      
      this.loading = false;
    },
    
    clearPreviousUserData() {
      uni.removeStorageSync('studentName');
      uni.removeStorageSync('studentGender');
      uni.removeStorageSync('studentAvatar');
      uni.removeStorageSync('studentPhone');
      uni.removeStorageSync('studentEmail');
      uni.removeStorageSync('studentMajor');
      uni.removeStorageSync('userDetail');
      uni.removeStorageSync('userRole');
    },
    saveUserData(userData) {
      if (this.formData.role === 'student') {
        uni.setStorageSync('studentName', userData.username || userData.name);
        uni.setStorageSync('userRole', userData.role || this.formData.role);
        
        if (userData.sex) {
          uni.setStorageSync('studentGender', userData.sex === '女' ? 'female' : 'male');
        }
        
        if (userData.phone) {
          uni.setStorageSync('studentPhone', userData.phone);
        }
        
        if (userData.email) {
          uni.setStorageSync('studentEmail', userData.email);
        }
        
        if (userData.majorName) {
          uni.setStorageSync('studentMajor', userData.majorName);
        }
      } else if (this.formData.role === 'teacher') {
        uni.setStorageSync('teacherInfo', JSON.stringify(userData));
        uni.setStorageSync('teacherName', userData.username);
        uni.setStorageSync('teacherId', userData.id);
        
        if (userData.sex) {
          uni.setStorageSync('teacherGender', userData.sex === '女' ? 'female' : 'male');
        }
        
        if (userData.phone) {
          uni.setStorageSync('teacherPhone', userData.phone);
        }
        
        if (userData.email) {
          uni.setStorageSync('teacherEmail', userData.email);
        }
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
      this.updatePasswordDisplay()
    },
    updatePasswordDisplay() {
      if (this.showPassword) {
        this.passwordDisplay = this.formData.password
      } else {
        this.passwordDisplay = this.formData.password ? '•'.repeat(this.formData.password.length) : ''
      }
    },
    handlePasswordInput(event) {
      const inputValue = event.detail ? event.detail.value : event.target.value
      
      if (this.showPassword) {
        this.formData.password = inputValue
        this.passwordDisplay = inputValue
      } else {
        if (inputValue.length > this.formData.password.length) {
          const addedChars = inputValue.substr(this.formData.password.length)
          const realAddedChars = addedChars.replace(/[•]/g, '')
          this.formData.password += realAddedChars
        } else if (inputValue.length < this.formData.password.length) {
          this.formData.password = this.formData.password.substring(0, inputValue.length)
        }
        
        this.passwordDisplay = this.formData.password ? '•'.repeat(this.formData.password.length) : ''
      }
    }
  }
}
</script>

<style lang="scss">
/* 登录界面样式 */
.login-container {
  height: 100vh;
  background: linear-gradient(135deg, #4361ee, #3a0ca3, #6930c3);
  background-size: 200% 200%;
  animation: gradient-shift 15s ease infinite;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 30rpx;
  will-change: background-position;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

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
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
  }
  
  .bg-wave {
    position: absolute;
    top: -200rpx;
    left: -10%;
    width: 120%;
    height: 500rpx;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 0 0 50% 50%;
  }
  
  .bg-circle {
    position: absolute;
    top: 10%;
    right: 10%;
    width: 240rpx;
    height: 240rpx;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(247, 37, 133, 0.3) 0%, rgba(247, 37, 133, 0.1) 70%);
    animation: float 8s ease-in-out infinite;
    will-change: transform;
  }
  
  .bubbles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    pointer-events: none;
    
    .bubble {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1));
      box-shadow: 0 0 10rpx rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(1px);
      animation: bubble-float linear infinite;
      will-change: transform, opacity;
      
      &.bubble-1 {
        width: 40rpx;
        height: 40rpx;
        bottom: -10%;
        left: 10%;
        animation-duration: 12s;
      }
      &.bubble-3 {
        width: 25rpx;
        height: 25rpx;
        bottom: -20%;
        left: 50%;
        animation-duration: 15s;
        animation-delay: 5s;
      }
      &.bubble-5 {
        width: 30rpx;
        height: 30rpx;
        bottom: -12%;
        left: 85%;
        animation-duration: 16s;
        animation-delay: 3s;
      }
      &.bubble-7 {
        width: 45rpx;
        height: 45rpx;
        bottom: -8%;
        left: 60%;
        animation-duration: 19s;
        animation-delay: 4s;
      }
    }
  }
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

.header {
  padding: 50rpx 20rpx 30rpx;
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .logo-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .logo {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      margin-bottom: 16rpx;
      box-shadow: 0 4rpx 20rpx rgba(18, 150, 219, 0.3);
      animation: pulse 3s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); box-shadow: 0 4rpx 25rpx rgba(18, 150, 219, 0.5); }
      100% { transform: scale(1); }
    }
    
    .app-badge {
      padding: 6rpx 20rpx;
      background: rgba(255, 255, 255, 0.3);
      color: #fff;
      font-size: 26rpx;
      font-weight: bold;
      border-radius: 20rpx;
      letter-spacing: 2rpx;
      box-shadow: 0 2rpx 10rpx rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
    }
    
    .app-badge::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
      transform: rotate(30deg);
      animation: shimmer 3s linear infinite;
    }
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%) rotate(30deg); }
  100% { transform: translateX(100%) rotate(30deg); }
}

.welcome-section {
  padding: 20rpx;
  margin-bottom: 50rpx;
  color: #fff;
  z-index: 10;
  position: relative;
  text-align: center;
  
  .welcome-title {
    font-size: 52rpx;
    font-weight: bold;
    margin-bottom: 16rpx;
    display: block;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
  }
  
  .welcome-subtitle {
    font-size: 30rpx;
    opacity: 0.9;
    display: block;
    letter-spacing: 1rpx;
  }
}

.login-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 32rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.15), 0 4rpx 8rpx rgba(255, 255, 255, 0.2) inset;
  position: relative;
  z-index: 10;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  
  .login-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 10rpx;
    display: block;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .login-subtitle {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 60rpx;
    display: block;
  }
}

.login-form {
  .input-group {
    margin-bottom: 20rpx;
    
    .input-item {
      position: relative;
      display: flex;
      align-items: center;
      padding: 24rpx 30rpx;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 16rpx;
      margin-bottom: 30rpx;
      transition: all 0.3s ease;
      overflow: hidden;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      
      &.focus {
        background: rgba(255, 255, 255, 0.25);
        box-shadow: 0 6rpx 16rpx rgba(67, 97, 238, 0.15);
        transform: translateY(-2rpx);
        border-color: rgba(67, 97, 238, 0.3);
        
        .input-border {
          transform: scaleX(1);
          opacity: 1;
        }
        
        .icon-container {
          color: #4361ee;
          transform: scale(1.1);
          
          .icon-text {
            color: #4361ee;
          }
        }
      }
      
      &.error {
        border-color: rgba(255, 99, 71, 0.5);
        background: rgba(255, 99, 71, 0.08);
        
        .icon-container {
          color: tomato;
          
          .icon-text {
            color: tomato;
          }
        }
        
        .input-border {
          background-color: tomato;
          transform: scaleX(1);
          opacity: 1;
        }
      }
      
      .icon-container {
        width: 60rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }
      
      input {
        flex: 1;
        margin-left: 20rpx;
        color: #ffffff;
        font-size: 32rpx;
        height: 60rpx;
        line-height: 60rpx;
        background: transparent;
        border: none;
        z-index: 1;
      }
      
      .input-placeholder {
        color: rgba(255, 255, 255, 0.6);
        font-size: 30rpx;
      }
      
      .password-toggle {
        padding: 10rpx 15rpx;
        color: rgba(255, 255, 255, 0.7);
        z-index: 2;
        transition: all 0.3s ease;
        
        &:active {
          transform: scale(0.9);
          opacity: 0.8;
        }
        
        .toggle-icon {
          width: 40rpx;
          height: 40rpx;
        }
      }
      
      .input-border {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 4rpx;
        background: linear-gradient(90deg, #4361ee, #6930c3);
        transform: scaleX(0);
        transform-origin: left center;
        transition: all 0.3s ease;
        opacity: 0;
      }
    }
  }
}

.role-selector {
  display: flex;
  margin-bottom: 60rpx;
  
  .role-option {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80rpx;
    background-color: rgba(247, 249, 252, 0.8);
    margin: 0 10rpx;
    border-radius: 16rpx;
    transition: all 0.3s;
    border: 1rpx solid rgba(0, 0, 0, 0.05);
    overflow: hidden;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #4361ee, #3a0ca3);
      opacity: 0;
      transition: opacity 0.3s;
      z-index: -1;
    }
    
    &:active {
      transform: scale(0.98);
    }
    
    &.active {
      border-color: transparent;
      box-shadow: 0 5rpx 15rpx rgba(67, 97, 238, 0.2);
      
      &::before {
        opacity: 1;
      }
      
      .role-icon, .role-text {
        color: #fff;
      }
    }
    
    .role-icon {
      width: 32rpx;
      height: 32rpx;
      margin-right: 10rpx;
      transition: all 0.3s;
    }
    
    .role-text {
      font-size: 28rpx;
      color: #555;
      font-weight: 500;
      transition: all 0.3s;
    }
  }
}

.login-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 10rpx 20rpx rgba(67, 97, 238, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: all 0.5s;
  }
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 5rpx 10rpx rgba(67, 97, 238, 0.2);
  }
  
  &:hover::before {
    left: 100%;
  }
}

.bottom-links {
  display: flex;
  justify-content: center;
  margin-top: 10rpx;
  
  .link-item {
    color: #666;
    font-size: 26rpx;
    padding: 10rpx;
    position: relative;
    transition: all 0.3s;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 6rpx;
      left: 10rpx;
      width: 0;
      height: 2rpx;
      background-color: #4361ee;
      transition: all 0.3s;
    }
    
    &:active {
      color: #4361ee;
      
      &::after {
        width: calc(100% - 20rpx);
      }
    }
  }
}
</style> 
