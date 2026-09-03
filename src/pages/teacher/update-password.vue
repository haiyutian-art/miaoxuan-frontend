<template>
  <view class="update-password-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <svg class="icon-svg">
          <use xlink:href="/static/icons/teacher-icons.svg#icon-back"></use>
        </svg>
      </view>
      <view class="nav-title">修改密码</view>
    </view>
    
    <!-- 表单卡片 -->
    <view class="form-card">
      <view class="form-item">
        <text class="form-label">当前密码</text>
        <view class="input-container" :class="{'focus': currentFocus === 'oldPassword', 'error': errors.oldPassword}">
          <input 
            class="input-field" 
            type="password" 
            v-model="formData.oldPassword" 
            placeholder="请输入当前密码"
            @focus="handleFocus('oldPassword')"
            @blur="handleBlur('oldPassword')"
          />
        </view>
        <text class="error-tip" v-if="errors.oldPassword">请输入当前密码</text>
      </view>
      
      <view class="form-item">
        <text class="form-label">新密码</text>
        <view class="input-container" :class="{'focus': currentFocus === 'newPassword', 'error': errors.newPassword}">
          <input 
            class="input-field" 
            type="password" 
            v-model="formData.newPassword" 
            placeholder="请输入新密码"
            @focus="handleFocus('newPassword')"
            @blur="handleBlur('newPassword')"
          />
        </view>
        <text class="error-tip" v-if="errors.newPassword">新密码需至少包含6个字符</text>
      </view>
      
      <view class="form-item">
        <text class="form-label">确认新密码</text>
        <view class="input-container" :class="{'focus': currentFocus === 'confirmPassword', 'error': errors.confirmPassword}">
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
        <text class="tips-title">密码须知：</text>
        <text class="tips-item">• 长度至少6位</text>
        <text class="tips-item">• 建议包含字母、数字和特殊字符</text>
        <text class="tips-item">• 不要使用与其他网站相同的密码</text>
      </view>
      
      <button class="submit-btn" :loading="loading" @tap="handleSubmit">确认修改</button>
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
      currentFocus: '',
      errors: {
        oldPassword: false,
        newPassword: false,
        confirmPassword: false
      },
      loading: false
    }
  },
  methods: {
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
    handleFocus(field) {
      this.currentFocus = field
      // 清除错误
      this.errors[field] = false
    },
    handleBlur(field) {
      this.currentFocus = ''
      this.validateField(field)
    },
    validateField(field) {
      if (field === 'oldPassword') {
        this.errors.oldPassword = !this.formData.oldPassword
      } else if (field === 'newPassword') {
        this.errors.newPassword = !this.formData.newPassword || this.formData.newPassword.length < 6
      } else if (field === 'confirmPassword') {
        this.errors.confirmPassword = this.formData.newPassword !== this.formData.confirmPassword
      }
    },
    validateAll() {
      this.validateField('oldPassword')
      this.validateField('newPassword')
      this.validateField('confirmPassword')
      
      return !this.errors.oldPassword && !this.errors.newPassword && !this.errors.confirmPassword
    },
    async handleSubmit() {
      if (!this.validateAll()) {
        uni.showToast({
          title: '请检查输入',
          icon: 'none'
        })
        return
      }
      
      this.loading = true
      
      try {
        // 获取登录token
        const token = uni.getStorageSync('token');
        
        if (!token) {
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/login/index'
            });
          }, 1500);
          return;
        }
        
        // 获取请求的URL和参数（按照API文档格式）
        const url = `${API_BASE_URL}/teacher/password`;
        const requestData = {
          oldpass: this.formData.oldPassword,
          newpass: this.formData.newPassword,
          newpass2: this.formData.confirmPassword,
          token: token // 在URL参数中传递token
        };
        
        console.log('修改密码请求参数:', requestData);
        
        // 调用后端API修改密码
        const updateResult = await new Promise((resolve, reject) => {
          uni.request({
            url: url,
            method: 'PUT',
            data: requestData,
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: (res) => {
              console.log('密码修改API响应:', res);
              
              if (res.statusCode === 200) {
                if (res.data && res.data.status === 0) {
                  resolve({
                    success: true,
                    msg: res.data.msg || '密码修改成功'
                  });
                } else {
                  resolve({
                    success: false,
                    msg: res.data.msg || '密码修改失败，请检查当前密码是否正确'
                  });
                }
              } else {
                resolve({
                  success: false,
                  msg: '服务器响应错误 (' + res.statusCode + ')'
                });
              }
            },
            fail: (err) => {
              console.error('密码修改API请求失败:', err);
              reject(err);
            }
          });
        }).catch(error => {
          console.error('请求异常', error);
          return { success: false, msg: '网络请求失败，请检查网络连接' };
        });
        
        if (updateResult.success) {
          // 密码修改成功
          uni.showToast({
            title: updateResult.msg,
            icon: 'success',
            duration: 2000
          });
          
          // 清空表单数据
          this.formData = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
          
          // 延迟返回上一页
          setTimeout(() => {
            try {
              uni.navigateBack();
            } catch (error) {
              console.error('返回失败:', error);
              uni.redirectTo({
                url: '/pages/teacher/profile'
              });
            }
          }, 1500);
        } else {
          // 密码修改失败
          uni.showToast({
            title: updateResult.msg,
            icon: 'none',
            duration: 2000
          });
        }
      } catch (error) {
        console.error('密码修改过程出错:', error);
        uni.showToast({
          title: '密码修改失败，请稍后重试',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style lang="scss">
.update-password-container {
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
      fill: currentColor;
      color: currentColor;
    }
  }
  
  .nav-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333333;
    margin: 0 auto;
  }
}

.form-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  margin: 30rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  width: calc(100% - 60rpx);
  box-sizing: border-box;
  
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
  
  .password-tips {
    margin-bottom: 40rpx;
    padding: 20rpx;
    background-color: #f0f7ff;
    border-radius: 8rpx;
    
    .tips-title {
      font-size: 26rpx;
      color: #1890ff;
      margin-bottom: 10rpx;
      display: block;
      font-weight: bold;
    }
    
    .tips-item {
      font-size: 24rpx;
      color: #666666;
      line-height: 36rpx;
      display: block;
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

/* SVG图标样式 */
.icon-svg {
  width: 40rpx;
  height: 40rpx;
  fill: currentColor;
  color: currentColor;
}
</style> 
