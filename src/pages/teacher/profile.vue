<template>
  <view class="profile-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="nav-back" @tap="goBack">
          <image class="icon-svg" src="/static/images/icon-back.svg" mode="aspectFit"></image>
        </view>
        <text class="page-title">个人中心</text>
        <view class="header-actions">
          <!-- 移除右侧箭头图标 -->
        </view>
      </view>
    </view>

    <!-- 个人信息卡片 -->
    <view class="profile-card">
      <view class="card-inner" :animation="cardAnimation">
        <view class="avatar-section">
          <view class="avatar-container" @tap="chooseAvatar">
            <image class="avatar-image" :src="teacherInfo.avatar" mode="aspectFill"></image>
            <view class="gender-toggle" @tap.stop="toggleGender">
              <svg class="icon-svg gender-icon" :class="teacherInfo.gender">
                <use :xlink:href="'/static/icons/teacher-icons.svg#icon-gender-' + teacherInfo.gender"></use>
              </svg>
            </view>
          </view>
          <text class="user-name">{{teacherInfo.name}}</text>
          <text class="user-role">{{teacherInfo.title}} / {{teacherInfo.department}}</text>
        </view>
        
        <view class="basic-info">
          <view class="info-item" :animation="getItemAnimation(0)">
            <text class="info-label">教师工号</text>
            <text class="info-value">{{teacherInfo.id}}</text>
          </view>
          <view class="info-item" :animation="getItemAnimation(1)">
            <text class="info-label">职称</text>
            <text class="info-value">{{teacherInfo.title}}</text>
          </view>
          <view class="info-item" :animation="getItemAnimation(2)">
            <text class="info-label">所属院系</text>
            <text class="info-value">{{teacherInfo.department}}</text>
          </view>
          <view class="info-item" :animation="getItemAnimation(3)">
            <text class="info-label">办公室</text>
            <text class="info-value">{{teacherInfo.office}}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 联系信息卡片 -->
    <view class="info-section" :animation="sectionAnimation">
      <view class="section-title">
        <text class="title-text">联系方式</text>
      </view>
      
      <view class="info-card">
        <view class="info-item" @tap="editInfo('phone')">
          <svg class="icon-svg item-icon">
            <use xlink:href="/static/icons/teacher-icons.svg#icon-notification"></use>
          </svg>
          <view class="item-content">
            <text class="item-label">电话号码</text>
            <text class="item-value">{{teacherInfo.phone}}</text>
          </view>
          <svg class="icon-svg edit-icon">
            <use xlink:href="/static/icons/teacher-icons.svg#icon-right"></use>
          </svg>
        </view>
        
        <view class="divider"></view>
        
        <view class="info-item" @tap="editInfo('email')">
          <svg class="icon-svg item-icon">
            <use xlink:href="/static/icons/teacher-icons.svg#icon-notification"></use>
          </svg>
          <view class="item-content">
            <text class="item-label">电子邮箱</text>
            <text class="item-value">{{teacherInfo.email}}</text>
          </view>
          <svg class="icon-svg edit-icon">
            <use xlink:href="/static/icons/teacher-icons.svg#icon-right"></use>
          </svg>
        </view>
      </view>
    </view>

    <!-- 设置卡片 -->
    <view class="info-section" :animation="settingsAnimation">
      <view class="section-title">
        <text class="title-text">账号设置</text>
      </view>
      
      <view class="settings-card">
        <view class="setting-item" @tap="navigateTo('/pages/teacher/update-info')">
          <svg class="icon-svg">
            <use xlink:href="/static/icons/teacher-icons.svg#icon-student"></use>
          </svg>
          <text class="setting-text">修改个人信息</text>
          <svg class="icon-svg">
            <use xlink:href="/static/icons/teacher-icons.svg#icon-right"></use>
          </svg>
        </view>
        
        <view class="divider"></view>
        
        <view class="setting-item" @tap="navigateTo('/pages/teacher/update-password')">
          <svg class="icon-svg">
            <use xlink:href="/static/icons/teacher-icons.svg#icon-notification"></use>
          </svg>
          <text class="setting-text">修改密码</text>
          <svg class="icon-svg">
            <use xlink:href="/static/icons/teacher-icons.svg#icon-right"></use>
          </svg>
        </view>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-section" :animation="logoutAnimation">
      <view class="logout-btn" @tap="confirmLogout">
        <text class="logout-text">退出登录</text>
      </view>
    </view>
  </view>
</template>

<script>
import { API_BASE_URL } from '@/config'

export default {
  data() {
    return {
      teacherInfo: {
        id: 'T20230001',
        name: '张教授',
        title: '副教授',
        department: '计算机科学与技术学院',
        office: '教学楼 A栋 503',
        avatar: '/static/images/avatar.png',
        phone: '138****5678',
        email: 'zhang.professor@university.edu.cn',
        gender: 'male'
      },
      cardAnimation: null,
      itemAnimations: [],
      sectionAnimation: null,
      settingsAnimation: null,
      logoutAnimation: null
    }
  },
  onLoad() {
    this.initAnimations()
    this.loadTeacherInfo()
    
    // 监听教师信息更新事件
    uni.$on('updateTeacherInfo', this.loadTeacherInfo)
  },
  onUnload() {
    // 移除事件监听
    uni.$off('updateTeacherInfo', this.loadTeacherInfo)
  },
  onShow() {
    this.loadTeacherInfo()
  },
  methods: {
    goBack() {
      try {
        uni.reLaunch({
          url: '/pages/teacher/index'
        });
      } catch (error) {
        console.error('返回异常:', error);
        uni.reLaunch({
          url: '/pages/teacher/index'
        });
      }
    },
    showMore() {
      uni.showActionSheet({
        itemList: ['分享名片', '打印信息', '帮助中心'],
        success: (res) => {
          uni.showToast({
            title: '该功能开发中',
            icon: 'none'
          })
        }
      })
    },
    navigateTo(url) {
      uni.navigateTo({
        url: url
      })
    },
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const avatarPath = res.tempFilePaths[0]
          this.teacherInfo.avatar = avatarPath
          
          // 保存头像到本地存储
          uni.setStorageSync('teacherAvatar', avatarPath)
          
          uni.showToast({
            title: '头像设置成功',
            icon: 'success'
          })
        }
      })
    },
    editInfo(type) {
      let title = type === 'phone' ? '修改电话号码' : '修改电子邮箱'
      let content = type === 'phone' ? this.teacherInfo.phone : this.teacherInfo.email
      
      uni.showModal({
        title: title,
        content: '该功能暂未开放，请前往个人信息修改页面进行更改',
        showCancel: true,
        confirmText: '前往',
        success: (res) => {
          if (res.confirm) {
            this.navigateTo('/pages/teacher/update-info')
          }
        }
      })
    },
    confirmLogout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出当前账号吗？',
        success: (res) => {
          if (res.confirm) {
            // 只清除登录相关的存储，保留教师个人信息
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            
            // 重定向到登录页
            uni.reLaunch({
              url: '/pages/login/index'
            })
          }
        }
      })
    },
    initAnimations() {
      // 卡片动画
      this.cardAnimation = this.createAnimation({
        duration: 800,
        timingFunction: 'ease-out',
        delay: 100
      }, (animation) => {
        animation.opacity(1).translateY(0).step()
      })
      
      // 信息项动画
      this.itemAnimations = []
      for (let i = 0; i < 4; i++) {
        this.itemAnimations.push(
          this.createAnimation({
            duration: 600,
            timingFunction: 'ease-out',
            delay: 300 + i * 100
          }, (animation) => {
            animation.opacity(1).translateX(0).step()
          })
        )
      }
      
      // 部分内容动画
      this.sectionAnimation = this.createAnimation({
        duration: 800,
        timingFunction: 'ease-out',
        delay: 500
      }, (animation) => {
        animation.opacity(1).translateY(0).step()
      })
      
      // 设置动画
      this.settingsAnimation = this.createAnimation({
        duration: 800,
        timingFunction: 'ease-out',
        delay: 700
      }, (animation) => {
        animation.opacity(1).translateY(0).step()
      })
      
      // 退出登录按钮动画
      this.logoutAnimation = this.createAnimation({
        duration: 800,
        timingFunction: 'ease-out',
        delay: 900
      }, (animation) => {
        animation.opacity(1).translateY(0).step()
      })
    },
    createAnimation(options, animationStep) {
      const animation = uni.createAnimation({
        duration: options.duration,
        timingFunction: options.timingFunction,
        delay: options.delay
      })
      
      animationStep(animation)
      return animation.export()
    },
    getItemAnimation(index) {
      return this.itemAnimations[index]
    },
    toggleGender() {
      // 切换性别
      if (this.teacherInfo.gender === 'male') {
        this.teacherInfo.gender = 'female'
        this.teacherInfo.name = '李教授'
        // 保存到本地存储
        uni.setStorageSync('teacherGender', 'female')
      } else {
        this.teacherInfo.gender = 'male'
        this.teacherInfo.name = '张教授'
        // 保存到本地存储
        uni.setStorageSync('teacherGender', 'male')
      }
      
      // 显示切换成功提示
      uni.showToast({
        title: `已切换为${this.teacherInfo.gender === 'male' ? '男' : '女'}教师`,
        icon: 'none',
        duration: 1500
      })
    },
    loadTeacherInfo() {
      // 获取登录token
      const token = uni.getStorageSync('token');
      
      if (!token) {
        console.error('未找到登录token，请先登录');
        return;
      }
      
      // 从本地存储获取教师信息
      const savedInfo = uni.getStorageSync('teacherInfo');
      
      // 如果已有缓存，先使用缓存的教师信息
      if (savedInfo) {
        try {
          const teacherData = JSON.parse(savedInfo);
          this.updateTeacherInfoFromData(teacherData);
        } catch (e) {
          console.error('解析缓存教师信息失败', e);
        }
      }
      
      // 获取保存的会话cookie
      const jsessionid = uni.getStorageSync('jsessionid');
      const sessionCookie = uni.getStorageSync('sessionCookie');
      
      console.log('使用的JSESSIONID:', jsessionid);
      console.log('使用的token:', token);
      
      // 调用后端接口获取最新的教师信息
      uni.request({
        url: `${API_BASE_URL}/user/info?token=${token}`,
        method: 'GET',
        header: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Cookie': sessionCookie || ('JSESSIONID=' + jsessionid)
        },
        withCredentials: true, // 启用cookie
        success: (res) => {
          // 即使状态码是200但data.data为空，依然视为成功并使用本地数据
          const isValidData = res.statusCode === 200 && res.data && 
                             (res.data.status === 0 && res.data.data) ||
                             (res.data.errMsg === 'request:ok');
                              
          if (isValidData) {
            // 如果响应中有有效数据
            if (res.data.data) {
              console.log('获取教师信息成功:', res.data);
              // 保存到本地存储
              uni.setStorageSync('teacherInfo', JSON.stringify(res.data.data));
              // 更新教师信息
              this.updateTeacherInfoFromData(res.data.data);
            } else {
              console.log('API响应成功但无数据，使用本地数据');
              // 直接视为登录成功，使用默认/缓存数据
              this.useLocalTeacherData(savedInfo);
            }
          } else {
            console.log('API返回错误或登录已过期，尝试使用缓存信息');
            // 使用本地数据
            this.useLocalTeacherData(savedInfo);
          }
        },
        fail: (err) => {
          console.error('获取教师信息请求失败:', err);
          
          // 网络请求失败时，尝试使用缓存信息
          if (savedInfo) {
            try {
              const teacherData = JSON.parse(savedInfo);
              this.updateTeacherInfoFromData(teacherData);
              console.log('网络请求失败，使用缓存的教师信息');
            } catch (e) {
              console.error('解析缓存教师信息失败', e);
            }
          }
        }
      });
    },
    
    // 从数据中更新教师信息的辅助方法
    updateTeacherInfoFromData(data) {
      if (!data) return;
      
      // 使用已保存的自定义头像
      const savedAvatar = uni.getStorageSync('teacherAvatar');
      if (savedAvatar) {
        this.teacherInfo.avatar = savedAvatar;
      }
      
      // 根据后端返回的数据结构更新教师信息
      if (data.username) this.teacherInfo.name = data.username;
      if (data.userNo) this.teacherInfo.id = data.userNo;
      if (data.id) this.teacherInfo.id = data.id;
      
      // 获取教师院系信息（优先从缓存和主页的数据中获取）
      const savedDepartment = uni.getStorageSync('teacherDepartment');
      
      if (savedDepartment) {
        // 优先使用主页保存的院系信息
        this.teacherInfo.department = savedDepartment;
      } else if (data.major) {
        this.teacherInfo.department = data.major;
      } else if (data.majorName) {
        this.teacherInfo.department = data.majorName;
      } else {
        // 根据教师ID判断所属院系
        this.getDepartmentByTeacherId();
      }
      
      if (data.title) this.teacherInfo.title = data.title || '教师';
      if (data.phone) this.teacherInfo.phone = data.phone;
      if (data.email) this.teacherInfo.email = data.email;
      if (data.office) this.teacherInfo.office = data.office || '教学楼 A栋 503';
      
      // 设置性别
      if (data.sex) {
        this.teacherInfo.gender = data.sex === '女' ? 'female' : 'male';
        
        // 如果没有自定义头像，根据性别设置默认头像
        if (!savedAvatar) {
          this.teacherInfo.avatar = this.teacherInfo.gender === 'female' 
            ? '/static/images/teacher-female.png'
            : '/static/images/teacher-male.png';
        }
      }
      
      // 更新本地存储
      uni.setStorageSync('teacherName', this.teacherInfo.name);
      if (data.userNo) uni.setStorageSync('teacherId', data.userNo);
      if (data.id) uni.setStorageSync('teacherId', data.id);
      uni.setStorageSync('teacherDepartment', this.teacherInfo.department);
      if (data.title) uni.setStorageSync('teacherTitle', data.title);
      if (data.phone) uni.setStorageSync('teacherPhone', this.teacherInfo.phone);
      if (data.email) uni.setStorageSync('teacherEmail', this.teacherInfo.email);
      if (data.office) uni.setStorageSync('teacherOffice', this.teacherInfo.office);
      if (data.sex) uni.setStorageSync('teacherGender', this.teacherInfo.gender);
      
      console.log('教师个人主页信息已更新:', this.teacherInfo);
    },
    
    // 根据教师ID判断所属院系
    getDepartmentByTeacherId() {
      const teacherId = uni.getStorageSync('teacherId');
      console.log('根据教师ID判断院系，教师ID:', teacherId);
      
      // 根据教师ID判断专业
      if (teacherId === '1') {
        this.teacherInfo.department = '计算机科学与技术学院';
      } else if (teacherId === '2') {
        this.teacherInfo.department = '信息工程学院';
      } else if (teacherId === '3') {
        this.teacherInfo.department = '艺术学院';
      } else if (teacherId === '4') {
        this.teacherInfo.department = '外国语学院';
      } else {
        this.teacherInfo.department = '信息工程学院';
      }
      
      // 保存到本地存储
      uni.setStorageSync('teacherDepartment', this.teacherInfo.department);
    },
    useLocalTeacherData(savedInfo) {
      // 使用本地数据更新教师信息
      if (savedInfo) {
        try {
          const teacherData = JSON.parse(savedInfo);
          this.updateTeacherInfoFromData(teacherData);
          console.log('使用本地数据更新教师信息');
        } catch (e) {
          console.error('解析本地教师信息失败', e);
        }
      } else {
        // 如果没有缓存信息，使用登录时保存的基本信息
        const defaultTeacher = {
          username: uni.getStorageSync('teacherName') || '教师用户',
          id: uni.getStorageSync('teacherId') || '未知ID',
          sex: uni.getStorageSync('teacherGender') === 'female' ? '女' : '男',
          phone: uni.getStorageSync('teacherPhone') || '138****5678',
          email: uni.getStorageSync('teacherEmail') || 'teacher@xiyou.edu.cn',
          role: 'teacher',
          title: '教师',
          office: '教学楼 A栋 503'
        };
        
        // 更新教师信息
        this.updateTeacherInfoFromData(defaultTeacher);
        
        // 保存默认信息到本地
        uni.setStorageSync('teacherInfo', JSON.stringify(defaultTeacher));
      }
    }
  }
}
</script>

<style lang="scss">
/* 使用SVG图标替代iconfont */
.icon-svg {
  width: 40rpx;
  height: 40rpx;
  color: #ffffff;
}

.item-icon {
  width: 48rpx;
  height: 48rpx;
  color: #1890ff;
  margin-right: 20rpx;
}

.edit-icon {
  width: 36rpx;
  height: 36rpx;
  color: #cccccc;
}

/* 通用图标样式 */
.iconfont {
  font-family: sans-serif;
  font-style: normal;
}

.profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 50rpx;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.header {
  height: 240rpx;
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #1890ff, #722ed1);
    z-index: 1;
  }
  
  .header-content {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 60rpx 30rpx 0;
    height: 88rpx;
    width: 100%;
    box-sizing: border-box;
    
    .nav-back {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      transition: background-color 0.2s;
      
      &:active {
        background-color: rgba(255, 255, 255, 0.2);
      }
      
      .icon-svg {
        width: 40rpx;
        height: 40rpx;
        color: #ffffff;
      }
    }
    
    .page-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #ffffff;
    }
    
    .header-actions {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      
      .icon-svg {
        width: 40rpx;
        height: 40rpx;
        color: #ffffff;
      }
    }
  }
}

.profile-card {
  margin-top: -60rpx;
  padding: 0 30rpx;
  position: relative;
  z-index: 10;
  width: 100%;
  box-sizing: border-box;
  
  .card-inner {
    background-color: #ffffff;
    border-radius: 20rpx;
    box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
    overflow: hidden;
    opacity: 0;
    transform: translateY(30rpx);
    width: 100%;
    box-sizing: border-box;
    
    .avatar-section {
      padding: 40rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: linear-gradient(to bottom, rgba(24, 144, 255, 0.05), rgba(0, 0, 0, 0));
      
      .avatar-container {
        position: relative;
        margin-bottom: 20rpx;
        
        .avatar-image {
          width: 160rpx;
          height: 160rpx;
          border-radius: 80rpx;
          border: 4rpx solid rgba(24, 144, 255, 0.2);
          transition: all 0.3s ease;
        }
        
        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.1);
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 80rpx;
        }
        
        &:active {
          .avatar-image {
            transform: scale(0.95);
          }
          
          &::after {
            opacity: 1;
          }
        }
        
        .gender-toggle {
          position: absolute;
          right: 10rpx;
          top: 10rpx;
          width: 40rpx;
          height: 40rpx;
          border-radius: 50%;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
          
          .gender-icon {
            width: 24rpx;
            height: 24rpx;
            
            &.male {
              color: #1890ff;
            }
            
            &.female {
              color: #eb2f96;
            }
          }
        }
      }
      
      .user-name {
        font-size: 36rpx;
        font-weight: bold;
        color: #333333;
        margin-bottom: 8rpx;
      }
      
      .user-role {
        font-size: 26rpx;
        color: #666666;
      }
    }
    
    .basic-info {
      padding: 0 40rpx 40rpx;
      
      .info-item {
        display: flex;
        justify-content: space-between;
        padding: 20rpx 0;
        opacity: 0;
        transform: translateX(20rpx);
        
        .info-label {
          font-size: 28rpx;
          color: #999999;
        }
        
        .info-value {
          font-size: 28rpx;
          color: #333333;
          font-weight: 500;
        }
      }
    }
  }
}

.info-section {
  padding: 0 30rpx;
  margin-top: 30rpx;
  opacity: 0;
  transform: translateY(30rpx);
  width: 100%;
  box-sizing: border-box;
  
  .section-title {
    margin-bottom: 20rpx;
    
    .title-text {
      font-size: 32rpx;
      font-weight: bold;
      color: #333333;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -8rpx;
        width: 40rpx;
        height: 4rpx;
        background-color: #1890ff;
        border-radius: 2rpx;
      }
    }
  }
  
  .info-card {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 20rpx 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    width: 100%;
    box-sizing: border-box;
    
    .info-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      
      .item-content {
        flex: 1;
        
        .item-label {
          font-size: 24rpx;
          color: #999999;
          margin-bottom: 6rpx;
          display: block;
        }
        
        .item-value {
          font-size: 30rpx;
          color: #333333;
          display: block;
        }
      }
      
      .icon-svg {
        width: 40rpx;
        height: 40rpx;
        color: #1890ff;
        opacity: 0.8;
      }
      
      .edit-icon {
        width: 36rpx;
        height: 36rpx;
        color: #cccccc;
        padding: 10rpx;
      }
    }
    
    .divider {
      height: 1rpx;
      background-color: #f0f0f0;
      margin: 0 20rpx 0 80rpx;
    }
  }
  
  .settings-card {
    background-color: #ffffff;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    width: 100%;
    box-sizing: border-box;
    
    .setting-item {
      display: flex;
      align-items: center;
      padding: 30rpx;
      
      .icon-svg {
        font-size: 36rpx;
        color: #1890ff;
        margin-right: 20rpx;
        opacity: 0.8;
      }
      
      .setting-text {
        flex: 1;
        font-size: 30rpx;
        color: #333333;
      }
      
      .icon-svg {
        font-size: 36rpx;
        color: #cccccc;
      }
    }
    
    .divider {
      height: 1rpx;
      background-color: #f0f0f0;
      margin: 0 30rpx 0 86rpx;
    }
  }
}

.logout-section {
  padding: 80rpx 30rpx 30rpx;
  opacity: 0;
  transform: translateY(30rpx);
  width: 100%;
  box-sizing: border-box;
  
  .logout-btn {
    height: 90rpx;
    background-color: #ffffff;
    border-radius: 45rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    
    .logout-text {
      font-size: 32rpx;
      color: #f5222d;
    }
    
    &:active {
      opacity: 0.8;
    }
  }
}
</style> 
