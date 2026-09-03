<template>
  <view class="update-info-container blue-gradient-bg">
    <!-- 顶部导航栏 -->
    <nav-bar title="修改个人信息" :show-back="true"></nav-bar>
    
    <!-- 表单内容 -->
    <view class="form-content">
      <view class="form-card card">
        <!-- 头像上传 -->
        <view class="avatar-upload">
          <view class="avatar-wrapper" @tap="chooseAvatar">
            <image :src="formData.avatar" mode="aspectFill" class="avatar-image"></image>
            <view class="avatar-overlay">
              <image src="/static/images/icon-camera.svg" mode="aspectFit" class="camera-icon"></image>
              <text class="change-text">更换头像</text>
            </view>
          </view>
        </view>
        
        <!-- 基本信息表单 -->
        <view class="form-section">
          <view class="section-title">基本信息</view>
          
          <view class="form-item">
            <text class="form-label">姓名</text>
            <view class="input-container" :class="{'focus': currentFocus === 'name'}">
              <input 
                class="input-field" 
                type="text" 
                v-model="formData.name" 
                placeholder="请输入姓名"
                @focus="handleFocus('name')"
                @blur="handleBlur('name')"
              />
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">学号</text>
            <view class="input-container" :class="{'focus': currentFocus === 'id'}">
              <input 
                class="input-field" 
                type="text" 
                v-model="formData.id" 
                placeholder="请输入学号"
                @focus="handleFocus('id')"
                @blur="handleBlur('id')"
                disabled
              />
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">性别</text>
            <view class="gender-selector">
              <view 
                class="gender-option" 
                :class="{'active': formData.gender === 'male'}" 
                @tap="formData.gender = 'male'"
              >
                <image class="gender-icon" src="/static/images/icon-male.svg" mode="aspectFit"></image>
                <text class="gender-text">男</text>
              </view>
              <view 
                class="gender-option" 
                :class="{'active': formData.gender === 'female'}" 
                @tap="formData.gender = 'female'"
              >
                <image class="gender-icon" src="/static/images/icon-female.svg" mode="aspectFit"></image>
                <text class="gender-text">女</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 联系方式表单 -->
        <view class="form-section">
          <view class="section-title">联系方式</view>
          
          <view class="form-item">
            <text class="form-label">电话号码</text>
            <view class="input-container" :class="{'focus': currentFocus === 'phone', 'error': errors.phone}">
              <input 
                class="input-field" 
                type="number" 
                v-model="formData.phone" 
                placeholder="请输入电话号码"
                maxlength="11"
                @focus="handleFocus('phone')"
                @blur="handleBlur('phone')"
              />
            </view>
            <text class="error-tip" v-if="errors.phone">请输入正确的手机号码</text>
          </view>
          
          <view class="form-item">
            <text class="form-label">电子邮箱</text>
            <view class="input-container" :class="{'focus': currentFocus === 'email', 'error': errors.email}">
              <input 
                class="input-field" 
                type="text" 
                v-model="formData.email" 
                placeholder="请输入电子邮箱"
                @focus="handleFocus('email')"
                @blur="handleBlur('email')"
              />
            </view>
            <text class="error-tip" v-if="errors.email">请输入正确的电子邮箱</text>
          </view>
          
          <view class="form-item">
            <text class="form-label">所属专业</text>
            <view class="input-container" :class="{'focus': currentFocus === 'major'}">
              <picker 
                mode="selector" 
                :range="majorOptions" 
                @change="handleMajorChange" 
                range-key="name"
                :value="majorIndex"
              >
                <view class="picker-content">
                  <text>{{ formData.major || '请选择专业' }}</text>
                  <image class="arrow-icon" src="/static/images/icon-arrow.svg" mode="aspectFit"></image>
                </view>
              </picker>
            </view>
          </view>
        </view>
        
        <button class="submit-btn" :loading="loading" @tap="handleSubmit">保存修改</button>
      </view>
    </view>
  </view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'

import { API_BASE_URL } from '@/config'

export default {
  components: {
    NavBar
  },
  data() {
    return {
      currentFocus: '',
      loading: false,
      formData: {
        avatar: '',
        name: '张三',
        id: '2023001001',
        gender: 'male',
        phone: '',
        email: '',
        major: ''
      },
      errors: {
        phone: false,
        email: false
      },
      majorOptions: [
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
      ],
      majorIndex: 0
    }
  },
  onLoad() {
    // 获取个人信息
    this.getStudentInfo()
  },
  onShow() {
    // 每次页面显示时获取最新头像
    this.getStudentInfo()
  },
  methods: {
    getStudentInfo() {
      // 从本地存储或页面传参获取学生信息
      try {
        const savedGender = uni.getStorageSync('studentGender');
        const savedAvatar = uni.getStorageSync('studentAvatar');
        const savedPhone = uni.getStorageSync('studentPhone');
        const savedEmail = uni.getStorageSync('studentEmail');
        const savedMajor = uni.getStorageSync('studentMajor');
        const savedMajorId = uni.getStorageSync('majorId');
        const savedName = uni.getStorageSync('studentName');
        const savedStudentNo = uni.getStorageSync('studentNo');
        
        // 设置学号
        if (savedStudentNo) {
          this.formData.id = savedStudentNo;
        }
        
        // 先读取手机号、邮箱和专业信息
        if (savedPhone) {
          this.formData.phone = savedPhone;
        }
        
        if (savedEmail) {
          this.formData.email = savedEmail;
        }
        
        // 优先使用majorId来设置专业
        if (savedMajorId) {
          const majorIndex = this.majorOptions.findIndex(item => item.id === parseInt(savedMajorId));
          if (majorIndex !== -1) {
            this.majorIndex = majorIndex;
            this.formData.major = this.majorOptions[majorIndex].name;
          }
        }
        // 如果没有majorId但有专业名称，也可以设置
        else if (savedMajor) {
          this.formData.major = savedMajor;
          // 寻找对应的下标
          const index = this.majorOptions.findIndex(item => item.name === savedMajor);
          if (index !== -1) {
            this.majorIndex = index;
          }
        }
        
        // 处理姓名、头像和性别
        if (savedName) {
          this.formData.name = savedName;
        }
        
        if (savedGender) {
          this.formData.gender = savedGender;
          // 设置默认姓名，只有在用户没有自定义姓名时才使用
          if (!savedName) {
            this.formData.name = savedGender === 'female' ? '李四' : '张三';
          }
          
          // 如果有自定义头像，则优先使用自定义头像
          if (savedAvatar) {
            this.formData.avatar = savedAvatar;
          } else {
            this.formData.avatar = savedGender === 'female' ? 
              '/static/images/female-avatar.jpg' : '/static/images/avatar.jpg';
          }
        } else if (savedAvatar) {
          // 即使没有设置性别，如果有自定义头像，也应该显示
          this.formData.avatar = savedAvatar;
        }
        
        // 确保头像路径有效，否则使用默认头像
        if (!this.formData.avatar || typeof this.formData.avatar !== 'string') {
          this.formData.avatar = '/static/images/avatar.jpg';
        }
        
        console.log('当前头像路径:', this.formData.avatar);
        console.log('当前用户姓名:', this.formData.name);
      } catch (e) {
        console.error('获取学生信息失败', e);
        // 出错时使用默认头像
        this.formData.avatar = '/static/images/avatar.jpg';
      }
    },
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const avatarPath = res.tempFilePaths[0];
          this.formData.avatar = avatarPath;
          
          // 保存头像到本地存储
          uni.setStorageSync('studentAvatar', avatarPath);
        }
      });
    },
    handleFocus(field) {
      this.currentFocus = field
      // 清除错误
      if (this.errors[field]) {
        this.errors[field] = false
      }
    },
    handleBlur(field) {
      this.currentFocus = ''
      this.validateField(field)
    },
    validateField(field) {
      if (field === 'phone') {
        const phoneRegex = /^1[3-9]\d{9}$/
        this.errors.phone = this.formData.phone && !phoneRegex.test(this.formData.phone)
      } else if (field === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        this.errors.email = this.formData.email && !emailRegex.test(this.formData.email)
      }
    },
    validateAll() {
      this.validateField('phone')
      this.validateField('email')
      
      return !this.errors.phone && !this.errors.email
    },
    handleMajorChange(e) {
      this.majorIndex = e.detail.value
      this.formData.major = this.majorOptions[this.majorIndex].name
    },
    async handleSubmit() {
      if (!this.validateAll()) {
        uni.showToast({
          title: '请检查输入格式',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      this.loading = true;
      
      // 无论网络状态如何，先保存到本地
      this.saveToLocalStorage();
      
      try {
        // 获取token
        const token = uni.getStorageSync('token');
        if (!token) {
          uni.showToast({
            title: '修改已保存到本地',
            icon: 'success',
            duration: 2000
          });
          
          console.log('未找到token，已保存到本地存储');
          
          setTimeout(() => {
            uni.navigateBack({
              delta: 1,
              animationType: 'none'
            });
          }, 1500);
          return;
        }
        
        // 准备请求数据
        const updateData = {
          token: token,
          name: this.formData.name,
          gender: this.formData.gender === 'male' ? '男' : '女',
          phone: this.formData.phone,
          email: this.formData.email,
          majorId: this.formData.major ? this.majorOptions[this.majorIndex].id : null
        };
        
        console.log('准备更新用户信息:', updateData);
        
        // 先显示成功提示
        uni.showToast({
          title: '修改已保存',
          icon: 'success',
          duration: 2000
        });
        
        // 设置返回定时器
        const backTimer = setTimeout(() => {
          uni.navigateBack({
            delta: 1,
            animationType: 'none'
          });
        }, 1500);
        
        // 在后台异步发送请求给后端API
        uni.request({
          url: `${API_BASE_URL}/student/update-info`,
          method: 'POST',
          data: updateData,
          header: {
            'Content-Type': 'application/json; charset=UTF-8'
          },
          success: (res) => {
            console.log('个人信息更新响应:', res);
            
            // 如果请求成功且状态码正确
            if (res.statusCode === 200 && res.data && res.data.status === 0) {
              console.log('后端更新成功');
              
              // 触发全局事件，通知其他页面更新信息
              uni.$emit('updateStudentInfo');
            } else {
              // 后端更新失败处理
              console.error('后端更新失败，但本地存储已保存:', res.data);
              
              // 检查是否是登录相关错误，静默处理
              const errorMsg = res.data?.msg || '未知错误';
              if (errorMsg.includes('登录') || errorMsg.includes('token') || errorMsg.includes('认证')) {
                console.warn('登录状态失效，但本地修改已保存');
              }
            }
          },
          fail: (err) => {
            console.error('个人信息更新请求失败，但本地存储已保存:', err);
          },
          complete: () => {
            console.log('个人信息更新请求完成');
            this.loading = false;
          }
        });
        
      } catch (error) {
        console.error('保存个人信息出错，但本地存储已保存:', error);
        // 即使出错也显示成功，因为已经保存到本地
        uni.showToast({
          title: '修改已保存到本地',
          icon: 'success',
          duration: 2000
        });
        
        setTimeout(() => {
          uni.navigateBack({
            delta: 1,
            animationType: 'none'
          });
        }, 1500);
      } finally {
        // 确保loading状态被重置
        setTimeout(() => {
          this.loading = false;
        }, 500);
      }
    },
    
    // 保存到本地存储的方法
    saveToLocalStorage() {
      console.log('保存个人信息到本地存储');
      
      try {
        // 保存信息到本地存储
        uni.setStorageSync('studentGender', this.formData.gender);
        uni.setStorageSync('studentAvatar', this.formData.avatar);
        
        // 保存用户自定义的姓名
        if (this.formData.name) {
          uni.setStorageSync('studentName', this.formData.name);
        }
        
        // 其他信息也可以保存
        if (this.formData.phone) {
          uni.setStorageSync('studentPhone', this.formData.phone);
        } else {
          // 如果用户清空了手机号，也要更新本地存储
          uni.removeStorageSync('studentPhone');
        }
        
        if (this.formData.email) {
          uni.setStorageSync('studentEmail', this.formData.email);
        } else {
          // 如果用户清空了邮箱，也要更新本地存储
          uni.removeStorageSync('studentEmail');
        }
        
        if (this.formData.major) {
          uni.setStorageSync('studentMajor', this.formData.major);
          // 保存专业ID
          if (this.majorIndex >= 0 && this.majorIndex < this.majorOptions.length) {
            uni.setStorageSync('majorId', this.majorOptions[this.majorIndex].id.toString());
          }
        } else {
          // 如果用户清空了专业，也要更新本地存储
          uni.removeStorageSync('studentMajor');
          uni.removeStorageSync('majorId');
        }
        
        // 触发全局事件，通知其他页面更新信息
        uni.$emit('updateStudentInfo');
        
        console.log('本地存储保存成功');
        return true;
      } catch (e) {
        console.error('保存到本地存储失败:', e);
        return false;
      }
    }
  }
}
</script>

<style lang="scss">
.update-info-container {
  min-height: 100vh;
  position: relative;
  padding-bottom: 50rpx;
  padding-top: var(--status-bar-height);
}

.form-content {
  position: relative;
  z-index: 2;
  padding: 160rpx 30rpx 30rpx;
}

.form-card {
  padding: 40rpx 30rpx;
  
  .avatar-upload {
    display: flex;
    justify-content: center;
    margin-bottom: 40rpx;
    
    .avatar-wrapper {
      position: relative;
      width: 160rpx;
      height: 160rpx;
      border-radius: 80rpx;
      overflow: hidden;
      box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.1);
      background-color: #f0f0f0;
      
      .avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .avatar-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        opacity: 0.7;
        
        .camera-icon {
          width: 40rpx;
          height: 40rpx;
          margin-bottom: 10rpx;
          filter: brightness(0) invert(1);
        }
        
        .change-text {
          font-size: 24rpx;
          color: #ffffff;
        }
      }
      
      &:active .avatar-overlay {
        opacity: 0.7;
      }
    }
  }
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  position: relative;
  padding-left: 20rpx;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8rpx;
    height: 30rpx;
    width: 6rpx;
    background: linear-gradient(to bottom, #4facfe, #00f2fe);
    border-radius: 3rpx;
  }
}

.form-section {
  margin-bottom: 40rpx;
}

.form-item {
  margin-bottom: 30rpx;
  
  .form-label {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 12rpx;
    display: block;
  }
  
  .input-container {
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 12rpx;
    height: 88rpx;
    padding: 0 30rpx;
    display: flex;
    align-items: center;
    border: 2rpx solid rgba(0, 0, 0, 0.05);
    
    &.focus {
      border-color: #4facfe;
      background-color: rgba(255, 255, 255, 0.95);
    }
    
    &.error {
      border-color: #ff4d4f;
      background-color: rgba(255, 242, 240, 0.8);
    }
    
    .input-field {
      flex: 1;
      height: 88rpx;
      font-size: 28rpx;
      
      &[disabled] {
        color: #999;
      }
    }
    
    .picker-content {
      width: 100%;
      height: 88rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 28rpx;
      
      .arrow-icon {
        width: 32rpx;
        height: 32rpx;
        opacity: 0.3;
      }
    }
  }
  
  .error-tip {
    font-size: 24rpx;
    color: #ff4d4f;
    margin-top: 8rpx;
    padding-left: 10rpx;
  }
  
  .gender-selector {
    display: flex;
    justify-content: space-between;
    margin-top: 10rpx;
    
    .gender-option {
      flex: 1;
      height: 88rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 12rpx;
      margin: 0 10rpx;
      
      &:first-child {
        margin-left: 0;
      }
      
      &:last-child {
        margin-right: 0;
      }
      
      .gender-icon {
        width: 32rpx;
        height: 32rpx;
        margin-right: 10rpx;
      }
      
      .gender-text {
        font-size: 28rpx;
        color: #666;
      }
      
      &.active {
        background: linear-gradient(135deg, #4facfe, #00f2fe);
        box-shadow: 0 4rpx 8rpx rgba(79, 172, 254, 0.3);
        
        .gender-text {
          color: #ffffff;
          font-weight: 500;
        }
        
        .gender-icon {
          filter: brightness(0) invert(1);
        }
      }
      
      &:active:not(.active) {
        background-color: transparent;
      }
    }
  }
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  border-radius: 44rpx;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
  margin-top: 50rpx;
  box-shadow: 0 8rpx 16rpx rgba(79, 172, 254, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    opacity: 1;
  }
  
  &::after {
    border: none;
  }
}

/* 添加禁用所有动画和过渡效果的规则 */
.update-info-container * {
  transition: none !important;
  animation: none !important;
  transform: none !important;
}

/* 移除表单元素的动画效果 */
.input-container {
  &.focus {
    /* 保持焦点样式，但移除过渡效果 */
    border-color: #4facfe;
    background-color: rgba(255, 255, 255, 0.95);
  }
}

.gender-option {
  &.active {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
    
    /* 保持激活状态，但移除过渡效果 */
    box-shadow: 0 4rpx 8rpx rgba(79, 172, 254, 0.3);
  }
  
  &:active:not(.active) {
    background-color: transparent;
  }
}

.submit-btn {
  &:active {
    opacity: 1;
  }
}
</style> 
