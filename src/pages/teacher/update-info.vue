<template>
  <view class="update-info-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <svg class="icon-svg">
          <use xlink:href="/static/icons/teacher-icons.svg#icon-back"></use>
        </svg>
      </view>
      <view class="nav-title">修改个人信息</view>
    </view>
    
    <!-- 表单卡片 -->
    <view class="form-card">
      <!-- 头像上传 -->
      <view class="avatar-upload">
        <image :src="formData.avatar" mode="aspectFill" class="avatar"></image>
        <view class="upload-btn" @tap="chooseAvatar">
          <text>更换头像</text>
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
          <text class="form-label">工号</text>
          <view class="input-container" :class="{'focus': currentFocus === 'id'}">
            <input 
              class="input-field" 
              type="text" 
              v-model="formData.id" 
              placeholder="请输入工号"
              @focus="handleFocus('id')"
              @blur="handleBlur('id')"
            />
          </view>
        </view>
        
        <view class="form-item">
          <text class="form-label">所属院系</text>
          <view class="input-container" :class="{'focus': currentFocus === 'department'}">
            <input 
              class="input-field" 
              type="text" 
              v-model="formData.department" 
              placeholder="请输入所属院系"
              @focus="handleFocus('department')"
              @blur="handleBlur('department')"
            />
          </view>
        </view>
        
        <view class="form-item">
          <text class="form-label">职称</text>
          <view class="input-container" :class="{'focus': currentFocus === 'title'}">
            <input 
              class="input-field" 
              type="text" 
              v-model="formData.title" 
              placeholder="请输入职称"
              @focus="handleFocus('title')"
              @blur="handleBlur('title')"
            />
          </view>
        </view>
      </view>
      
      <!-- 联系方式表单 -->
      <view class="form-section">
        <view class="section-title">联系方式</view>
        
        <view class="form-item">
          <text class="form-label">办公室</text>
          <view class="input-container" :class="{'focus': currentFocus === 'office', 'error': errors.office}">
            <input 
              class="input-field" 
              type="text" 
              v-model="formData.office" 
              placeholder="请输入办公室地点"
              @focus="handleFocus('office')"
              @blur="handleBlur('office')"
            />
          </view>
          <text class="error-tip" v-if="errors.office">请输入办公室地点</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">手机号码</text>
          <view class="input-container" :class="{'focus': currentFocus === 'phone', 'error': errors.phone}">
            <input 
              class="input-field" 
              type="number" 
              v-model="formData.phone" 
              placeholder="请输入手机号码"
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
      </view>
      
      <button class="submit-btn" :loading="loading" @tap="handleSubmit">保存修改</button>
    </view>
  </view>
</template>

<script>
import { API_BASE_URL } from '@/config'

export default {
  data() {
    return {
      formData: {
        avatar: '/static/images/avatar.png',
        name: '张老师',
        id: 'T20230001',
        department: '计算机科学与技术学院',
        title: '副教授',
        office: '教学楼B-305',
        phone: '13812345678',
        email: 'zhang@university.edu'
      },
      currentFocus: '',
      errors: {
        office: false,
        phone: false,
        email: false
      },
      loading: false
    }
  },
  onLoad() {
    // 页面加载时获取教师信息
    this.getTeacherInfo()
  },
  methods: {
    // 获取教师信息
    getTeacherInfo() {
      try {
        const avatar = uni.getStorageSync('teacherAvatar')
        const name = uni.getStorageSync('teacherName')
        const office = uni.getStorageSync('teacherOffice')
        const phone = uni.getStorageSync('teacherPhone')
        const email = uni.getStorageSync('teacherEmail')
        const department = uni.getStorageSync('teacherDepartment')
        const title = uni.getStorageSync('teacherTitle')
        
        // 如果有数据则更新
        if (avatar) this.formData.avatar = avatar
        if (name) this.formData.name = name
        if (office) this.formData.office = office
        if (phone) this.formData.phone = phone
        if (email) this.formData.email = email
        if (department) this.formData.department = department
        if (title) this.formData.title = title
      } catch (e) {
        console.error('获取教师信息失败', e)
      }
    },
    goBack() {
      try {
        uni.navigateBack({
          delta: 1,
          fail: (error) => {
            console.error('返回失败:', error);
            // 如果返回失败，重新加载个人中心页面
            uni.redirectTo({
              url: '/pages/teacher/profile'
            });
          }
        });
      } catch (error) {
        console.error('返回异常:', error);
        uni.redirectTo({
          url: '/pages/teacher/profile'
        });
      }
    },
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.formData.avatar = res.tempFilePaths[0]
          
          // 预览更改
          uni.showToast({
            title: '头像已更新',
            icon: 'success'
          })
        }
      })
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
      if (field === 'office') {
        this.errors.office = !this.formData.office
      } else if (field === 'phone') {
        const phoneRegex = /^1[3-9]\d{9}$/
        this.errors.phone = !phoneRegex.test(this.formData.phone)
      } else if (field === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        this.errors.email = !emailRegex.test(this.formData.email)
      }
    },
    validateAll() {
      this.validateField('office')
      this.validateField('phone')
      this.validateField('email')
      
      return !this.errors.office && !this.errors.phone && !this.errors.email
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
          department: this.formData.department || '',
          title: this.formData.title || '',
          office: this.formData.office || '',
          phone: this.formData.phone,
          email: this.formData.email
        };
        
        console.log('准备更新教师信息:', updateData);
        
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
          url: `${API_BASE_URL}/teacher/update-info`,
          method: 'POST',
          data: updateData,
          header: {
            'Content-Type': 'application/json; charset=UTF-8'
          },
          success: (res) => {
            console.log('教师信息更新响应:', res);
            
            // 如果请求成功且状态码正确
            if (res.statusCode === 200 && res.data && res.data.status === 0) {
              console.log('后端更新成功');
              
              // 触发全局事件，通知其他页面更新信息
              uni.$emit('updateTeacherInfo');
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
            console.error('教师信息更新请求失败，但本地存储已保存:', err);
          },
          complete: () => {
            console.log('教师信息更新请求完成');
            this.loading = false;
          }
        });
        
      } catch (error) {
        console.error('保存教师信息出错，但本地存储已保存:', error);
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
      console.log('保存教师信息到本地存储');
      
      try {
        // 保存头像和姓名
        uni.setStorageSync('teacherAvatar', this.formData.avatar);
        
        if (this.formData.name) {
          uni.setStorageSync('teacherName', this.formData.name);
        }
        
        // 保存其他信息
        if (this.formData.office) {
          uni.setStorageSync('teacherOffice', this.formData.office);
        } else {
          uni.removeStorageSync('teacherOffice');
        }
        
        if (this.formData.department) {
          uni.setStorageSync('teacherDepartment', this.formData.department);
        } else {
          uni.removeStorageSync('teacherDepartment');
        }
        
        if (this.formData.title) {
          uni.setStorageSync('teacherTitle', this.formData.title);
        } else {
          uni.removeStorageSync('teacherTitle');
        }
        
        if (this.formData.phone) {
          uni.setStorageSync('teacherPhone', this.formData.phone);
        } else {
          uni.removeStorageSync('teacherPhone');
        }
        
        if (this.formData.email) {
          uni.setStorageSync('teacherEmail', this.formData.email);
        } else {
          uni.removeStorageSync('teacherEmail');
        }
        
        // 触发全局事件，通知其他页面更新信息
        uni.$emit('updateTeacherInfo');
        
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
  background-color: #f5f5f5;
  padding-bottom: 30rpx;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  height: 88rpx;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  
  .nav-back {
    position: absolute;
    left: 30rpx;
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.03);
    border-radius: 50%;
    transition: background-color 0.2s;
    
    &:active {
      background-color: rgba(0, 0, 0, 0.1);
    }
    
    .icon-svg {
      width: 40rpx;
      height: 40rpx;
      color: #333333;
    }
  }
  
  .nav-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333333;
    margin: 0 auto;
  }
}

.icon-svg {
  width: 40rpx;
  height: 40rpx;
  fill: currentColor;
  color: currentColor;
}

.form-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  margin: 30rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  width: calc(100% - 60rpx);
  box-sizing: border-box;
  
  .avatar-upload {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 40rpx;
    
    .avatar {
      width: 160rpx;
      height: 160rpx;
      border-radius: 80rpx;
      margin-bottom: 20rpx;
    }
    
    .upload-btn {
      background-color: #f0f7ff;
      color: #1890ff;
      font-size: 26rpx;
      padding: 10rpx 30rpx;
      border-radius: 30rpx;
      border: 1px solid #1890ff;
    }
  }
  
  .form-section {
    margin-bottom: 40rpx;
    
    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 20rpx;
      position: relative;
      padding-left: 20rpx;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 6rpx;
        height: 28rpx;
        width: 6rpx;
        background-color: #1890ff;
        border-radius: 3rpx;
      }
    }
  }
  
  .form-item {
    margin-bottom: 30rpx;
    
    .form-label {
      font-size: 28rpx;
      color: #333333;
      margin-bottom: 16rpx;
      display: block;
    }
    
    .input-container {
      display: flex;
      align-items: center;
      background-color: #f5f5f5;
      border-radius: 8rpx;
      padding: 0 20rpx;
      height: 80rpx;
      border: 1rpx solid transparent;
      transition: all 0.3s;
      
      &.focus {
        background-color: #ffffff;
        border-color: #1890ff;
        box-shadow: 0 0 0 1rpx #1890ff;
      }
      
      &.error {
        border-color: #ff4d4f;
        background-color: #fff2f0;
      }
      
      .input-field {
        flex: 1;
        height: 80rpx;
        font-size: 28rpx;
        color: #333333;
      }
    }
    
    .error-tip {
      font-size: 24rpx;
      color: #ff4d4f;
      margin-top: 8rpx;
    }
  }
  
  .submit-btn {
    width: 100%;
    height: 80rpx;
    background-color: #1890ff;
    color: #ffffff;
    font-size: 30rpx;
    font-weight: bold;
    border-radius: 8rpx;
    margin-top: 20rpx;
  }
}
</style> 
