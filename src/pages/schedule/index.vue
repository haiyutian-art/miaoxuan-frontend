<template>
  <view class="schedule-container blue-gradient-bg">
    <!-- 顶部导航栏 -->
    <nav-bar title="我的课表" :show-back="true"></nav-bar>
    
    <!-- 课表内容 -->
    <view class="schedule-content">
      <!-- 学期选择器 -->
      <view class="term-selector card">
        <scroll-view scroll-x class="term-scroll">
          <view class="term-list">
            <view 
              v-for="(term, index) in termList" 
              :key="index"
              class="term-item"
              :class="{ active: termCode === term.code }"
              @tap="switchTerm(term.code)"
            >
              <text>{{ term.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
      
      <!-- 周次选择器 -->
      <view class="week-selector card">
        <view class="selector-arrow" @tap="prevWeek">
          <image src="/static/images/icon-arrow-left.svg" mode="aspectFit"></image>
        </view>
        <view class="current-week">第 {{ currentWeek }} 周</view>
        <view class="selector-arrow" @tap="nextWeek">
          <image src="/static/images/icon-arrow-right.svg" mode="aspectFit"></image>
        </view>
      </view>
      
      <!-- 星期栏 -->
      <view class="weekday-row card">
        <view class="time-column"></view>
        <view 
          v-for="(day, index) in weekdays" 
          :key="index" 
          class="weekday-cell"
        >
          <text class="weekday">{{ day }}</text>
          <text class="date">{{ getDayDate(index) }}</text>
        </view>
      </view>
      
      <!-- 课表主体 -->
      <scroll-view scroll-y class="schedule-grid card">
        <view class="schedule-table">
          <!-- 时间列 -->
          <view class="time-column">
            <view 
              v-for="(time, index) in timePeriods" 
              :key="index" 
              class="time-cell"
            >
              <text class="period">{{ index + 1 }}</text>
              <text class="time">{{ time }}</text>
            </view>
          </view>
          
          <!-- 课程格子 -->
          <view class="course-grid">
            <view 
              v-for="(day, dayIndex) in 7" 
              :key="'day-' + dayIndex" 
              class="day-column"
            >
              <view 
                v-for="(period, periodIndex) in 12" 
                :key="'period-' + periodIndex" 
                class="period-cell"
              >
                <view 
                  v-if="isCourseStartAtPeriod(dayIndex, periodIndex)" 
                  class="course-card"
                  :style="getCourseStyle(getCourseAt(dayIndex, periodIndex))"
                  @tap="showCourseDetail(getCourseAt(dayIndex, periodIndex))"
                >
                  <text class="course-name">{{ getCourseAt(dayIndex, periodIndex).name }}</text>
                  <text class="course-location">{{ getCourseAt(dayIndex, periodIndex).location }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 引入底部导航栏组件 -->
    <tab-bar currentTab="schedule"></tab-bar>
  </view>
</template>

<script>
import TabBar from '@/components/TabBar.vue'
import NavBar from '@/components/NavBar.vue'

import { API_BASE_URL } from '@/config'

export default {
  components: {
    'tab-bar': TabBar,
    NavBar
  },
  data() {
    return {
      currentWeek: 1,
      totalWeeks: 18,
      weekdays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      timePeriods: [
        '8:00-8:45', '8:55-9:40', '10:00-10:45', '10:55-11:40',
        '14:00-14:45', '14:55-15:40', '16:00-16:45', '16:55-17:40',
        '19:00-19:45', '19:55-20:40', '20:50-21:35', '21:45-22:30'
      ],
      semesterStartDate: new Date('2025-02-24'), // 假设学期开始日期
      courses: [], // 改为空数组，由API获取
      studentAvatar: '/static/images/avatar.jpg', // 默认头像
      isLoading: true,
      // 当前学期代码
      termCode: '3-1', // 默认大三上学期
      // 学期列表
      termList: [
        { code: '4-1', name: '大四上学期' },
        { code: '4-2', name: '大四下学期' },
        { code: '3-1', name: '大三上学期' },
        { code: '3-2', name: '大三下学期' },
        { code: '2-1', name: '大二上学期' },
        { code: '2-2', name: '大二下学期' },
        { code: '1-1', name: '大一上学期' },
        { code: '1-2', name: '大一下学期' }
      ]
    }
  },
  onLoad() {
    // 获取课程数据
    this.fetchCourses();
    
    // 加载用户头像
    this.loadUserAvatar();
  },
  methods: {
    // 切换学期
    switchTerm(termCode) {
      if(this.termCode !== termCode) {
        this.termCode = termCode;
        this.fetchCourses();
      }
    },
    
    // 获取课程数据
    fetchCourses() {
      // 显示加载状态
      this.isLoading = true;
      
      // 获取token
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      // 请求获取课程
      uni.request({
        url: `${API_BASE_URL}/student/my-courses`,
        method: 'GET',
        data: {
          term: this.termCode,
          token: token
        },
        header: {
          'Content-Type': 'application/json; charset=UTF-8'
        },
        success: (res) => {
          console.log('获取课表数据返回:', res);
          
          if (res.data && res.data.status === 0 && Array.isArray(res.data.data)) {
            // 解析课程数据
            this.processCourseData(res.data.data);
          } else {
            // 处理错误情况
            const errorMsg = res.data?.msg || '未知错误';
            if (errorMsg.includes('请先登录')) {
              uni.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none',
                duration: 2000
              });
              setTimeout(() => {
                uni.reLaunch({
                  url: '/pages/login/index'
                });
              }, 1500);
            } else {
              uni.showToast({
                title: '获取课表数据失败',
                icon: 'none',
                duration: 2000
              });
            }
          }
        },
        fail: () => {
          uni.showToast({
            title: '网络错误，请稍后再试',
            icon: 'none',
            duration: 2000
          });
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    },
    
    // 处理课程数据
    processCourseData(data) {
      // 清空原有课程数据
      this.courses = [];
      
      // 课程背景色列表
      const colors = ['#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0', '#2fe694', '#0ead69'];
      
      // 记录添加课程的日志
      console.log('共收到课程数据:', data.length, '条');
      
      // 确保课程数据完整性
      data.forEach((course, index) => {
        // 尝试从多个可能的字段中获取课程时间信息
        const timeString = course.courseTime || course.address || course.schedule || '';
        console.log(`处理第${index+1}门课程:`, course.courseName || course.name, '时间信息:', timeString);
        
        // 如果课程时间信息为空，创建一个随机时间信息
        if (!timeString || timeString.trim() === '') {
          console.warn(`课程 ${course.courseName || course.name || '未命名课程'} 无时间信息，将随机分配`);
          const randomDay = Math.floor(Math.random() * 5); // 随机周一至周五
          const randomStart = Math.floor(Math.random() * 5) * 2; // 随机偶数节次，防止时间重叠
          const randomEnd = randomStart + 1;
          
          const courseObj = {
            id: course.courseId || course.id || index + 1,
            name: course.courseName || course.name || '未命名课程',
            teacher: course.teacherName || course.teacher || '待定',
            location: '未指定地点',
            day: randomDay,
            startPeriod: randomStart,
            endPeriod: randomEnd,
            color: colors[index % colors.length]
          };
          
          this.courses.push(courseObj);
          console.log('添加随机时间课程:', courseObj);
          return;
        }
        
        // 尝试解析课程时间信息
        const scheduleInfo = this.parseScheduleInfo(timeString);
        
        if (scheduleInfo) {
          // 创建课程对象
          const courseObj = {
            id: course.courseId || course.id || index + 1,
            name: course.courseName || course.name || '未命名课程',
            teacher: course.teacherName || course.teacher || '待定',
            location: this.extractLocation(timeString),
            day: scheduleInfo.day,
            startPeriod: scheduleInfo.startPeriod,
            endPeriod: scheduleInfo.endPeriod,
            // 循环使用颜色
            color: colors[index % colors.length]
          };
          
          this.courses.push(courseObj);
          console.log('成功添加课程:', courseObj);
        } else {
          console.error('无法解析课程时间信息，创建随机安排:', timeString);
          // 如果无法解析，创建一个随机时间的课程对象
          const randomDay = Math.floor(Math.random() * 5); 
          const randomStart = Math.floor(Math.random() * 5) * 2;
          const randomEnd = randomStart + 1;
          
          const courseObj = {
            id: course.courseId || course.id || index + 1,
            name: course.courseName || course.name || '未命名课程',
            teacher: course.teacherName || course.teacher || '待定',
            location: timeString || '未指定地点',
            day: randomDay,
            startPeriod: randomStart,
            endPeriod: randomEnd,
            color: colors[index % colors.length]
          };
          
          this.courses.push(courseObj);
          console.log('添加随机时间课程(无法解析时间格式):', courseObj);
        }
      });
      
      console.log('处理后的课表数据共计:', this.courses.length, '门课程');
    },
    
    // 解析课程时间信息
    parseScheduleInfo(schedule) {
      try {
        // 记录当前尝试解析的字符串
        console.log('尝试解析时间信息:', schedule);
        
        // 简单清理字符串
        const cleanedSchedule = schedule.replace(/\s+/g, ' ').trim();
        
        // 格式1："星期一A101第1-2节{1-16周}"
        const pattern1 = /星期([一二三四五六日])(.*?)第(\d+)-(\d+)节/;
        const match1 = cleanedSchedule.match(pattern1);
        
        if (match1) {
          console.log('匹配格式1(星期x第y-z节):', match1);
          const dayMap = {'一': 0, '二': 1, '三': 2, '四': 3, '五': 4, '六': 5, '日': 6};
          const day = dayMap[match1[1]];
          const startPeriod = parseInt(match1[3]) - 1; // 转为0基索引
          const endPeriod = parseInt(match1[4]) - 1; // 转为0基索引
          
          return { 
            day, 
            startPeriod: Math.min(startPeriod, 11), // 确保不超过最大节次 (12节课，0-11)
            endPeriod: Math.min(endPeriod, 11)      // 确保不超过最大节次
          };
        }
        
        // 格式2："周一 1-2节"
        const pattern2 = /周([一二三四五六日])\s*(\d+)-(\d+)节/;
        const match2 = cleanedSchedule.match(pattern2);
        
        if (match2) {
          console.log('匹配格式2(周x y-z节):', match2);
          const dayMap = {'一': 0, '二': 1, '三': 2, '四': 3, '五': 4, '六': 5, '日': 6};
          const day = dayMap[match2[1]];
          const startPeriod = parseInt(match2[2]) - 1; // 转为0基索引
          const endPeriod = parseInt(match2[3]) - 1; // 转为0基索引
          
          return { 
            day, 
            startPeriod: Math.min(startPeriod, 11), // 确保不超过最大节次
            endPeriod: Math.min(endPeriod, 11)      // 确保不超过最大节次
          };
        }
        
        // 格式3："周一第1,2节"
        const pattern3 = /周([一二三四五六日])第([\d,]+)节/;
        const match3 = cleanedSchedule.match(pattern3);
        
        if (match3) {
          console.log('匹配格式3(周x第y,z节):', match3);
          const dayMap = {'一': 0, '二': 1, '三': 2, '四': 3, '五': 4, '六': 5, '日': 6};
          const day = dayMap[match3[1]];
          const periods = match3[2].split(',').map(p => parseInt(p) - 1); // 转为0基索引
          const startPeriod = Math.min(...periods);
          const endPeriod = Math.max(...periods);
          
          return { 
            day, 
            startPeriod: Math.min(startPeriod, 11), // 确保不超过最大节次
            endPeriod: Math.min(endPeriod, 11)      // 确保不超过最大节次
          };
        }
        
        // 格式4: "星期二B301第1,2节[1-16周]"
        const pattern4 = /星期([一二三四五六日])(.*?)第([\d,]+)节/;
        const match4 = cleanedSchedule.match(pattern4);
        
        if (match4) {
          console.log('匹配格式4(星期x地点第y,z节):', match4);
          const dayMap = {'一': 0, '二': 1, '三': 2, '四': 3, '五': 4, '六': 5, '日': 6};
          const day = dayMap[match4[1]];
          const periods = match4[3].split(',').map(p => parseInt(p) - 1); // 转为0基索引
          const startPeriod = Math.min(...periods);
          const endPeriod = Math.max(...periods);
          
          return { 
            day, 
            startPeriod: Math.min(startPeriod, 11), // 确保不超过最大节次
            endPeriod: Math.min(endPeriod, 11)      // 确保不超过最大节次
          };
        }
        
        // 格式5: "周一/周三 1-2节"（多天课程）
        const pattern5 = /周([一二三四五六日]).*?(\d+)-(\d+)节/;
        const match5 = cleanedSchedule.match(pattern5);
        
        if (match5) {
          console.log('匹配格式5(周x/周y z-w节):', match5);
          const dayMap = {'一': 0, '二': 1, '三': 2, '四': 3, '五': 4, '六': 5, '日': 6};
          const day = dayMap[match5[1]]; // 只取第一个上课日
          const startPeriod = parseInt(match5[2]) - 1; // 转为0基索引
          const endPeriod = parseInt(match5[3]) - 1; // 转为0基索引
          
          return { 
            day, 
            startPeriod: Math.min(startPeriod, 11), // 确保不超过最大节次
            endPeriod: Math.min(endPeriod, 11)      // 确保不超过最大节次
          };
        }
        
        // 格式6: "第1,2节/周一/东区第三实验室"（不常见格式）
        const pattern6 = /第([\d,]+)节.*?周([一二三四五六日])/;
        const match6 = cleanedSchedule.match(pattern6);
        
        if (match6) {
          console.log('匹配格式6(第x,y节/周z):', match6);
          const dayMap = {'一': 0, '二': 1, '三': 2, '四': 3, '五': 4, '六': 5, '日': 6};
          const day = dayMap[match6[2]];
          const periods = match6[1].split(',').map(p => parseInt(p) - 1); // 转为0基索引
          const startPeriod = Math.min(...periods);
          const endPeriod = Math.max(...periods);
          
          return { 
            day, 
            startPeriod: Math.min(startPeriod, 11), // 确保不超过最大节次
            endPeriod: Math.min(endPeriod, 11)      // 确保不超过最大节次
          };
        }
        
        // 根据纯文本尝试提取信息
        if (cleanedSchedule.includes('周一') || cleanedSchedule.includes('星期一')) {
          console.log('使用文本匹配提取周一课程');
          // 尝试提取节次信息
          const periodMatch = cleanedSchedule.match(/(\d+)[-,](\d+)节/);
          const startPeriod = periodMatch ? parseInt(periodMatch[1]) - 1 : 0;
          const endPeriod = periodMatch ? parseInt(periodMatch[2]) - 1 : 1;
          
          return {
            day: 0, // 周一
            startPeriod: Math.min(startPeriod, 11),
            endPeriod: Math.min(endPeriod, 11)
          };
        }
        
        if (cleanedSchedule.includes('周二') || cleanedSchedule.includes('星期二')) {
          console.log('使用文本匹配提取周二课程');
          const periodMatch = cleanedSchedule.match(/(\d+)[-,](\d+)节/);
          const startPeriod = periodMatch ? parseInt(periodMatch[1]) - 1 : 2;
          const endPeriod = periodMatch ? parseInt(periodMatch[2]) - 1 : 3;
          
          return {
            day: 1, // 周二
            startPeriod: Math.min(startPeriod, 11),
            endPeriod: Math.min(endPeriod, 11)
          };
        }
        
        // 如果无法解析，随机分配一个位置
        console.warn('无法通过任何模式解析课程时间:', cleanedSchedule);
        return {
          day: Math.floor(Math.random() * 5), // 随机周一到周五
          startPeriod: Math.floor(Math.random() * 5) * 2, // 随机选择偶数节次，确保不超过最大范围
          endPeriod: Math.min(Math.floor(Math.random() * 5) * 2 + 1, 11) // 确保不超过最大节次
        };
      } catch (error) {
        console.error('解析课程时间出错:', error);
        // 发生错误时，返回一个随机位置，确保课程还能显示出来
        return {
          day: Math.floor(Math.random() * 5), // 随机周一到周五
          startPeriod: Math.floor(Math.random() * 5) * 2,
          endPeriod: Math.min(Math.floor(Math.random() * 5) * 2 + 1, 11)
        };
      }
    },
    
    // 提取地点信息
    extractLocation(schedule) {
      try {
        // 尝试提取地点信息
        
        // 格式1："星期一A101第1-2节{1-16周}"
        const pattern1 = /星期[一二三四五六日](.*?)第\d+-\d+节/;
        const match1 = schedule.match(pattern1);
        
        if (match1 && match1[1]) {
          return match1[1].trim();
        }
        
        // 如果包含教学楼、科学楼等关键词
        if (schedule.includes('教学楼') || schedule.includes('科学楼') || 
            schedule.includes('实验楼') || schedule.includes('综合楼')) {
          const pattern2 = /(教学楼|科学楼|实验楼|综合楼).*?(\d+)/;
          const match2 = schedule.match(pattern2);
          
          if (match2) {
            return match2[0];
          }
        }
        
        // 如果无法提取，返回原始信息
        return schedule;
      } catch (error) {
        console.error('提取地点信息出错:', error);
        return schedule;
      }
    },
    
    // 加载用户头像
    loadUserAvatar() {
      try {
        const savedAvatar = uni.getStorageSync('studentAvatar')
        const savedGender = uni.getStorageSync('studentGender')
        
        if (savedAvatar) {
          this.studentAvatar = savedAvatar
        } else if (savedGender === 'female') {
          this.studentAvatar = '/static/images/female-avatar.jpg'
        } else {
          this.studentAvatar = '/static/images/avatar.jpg'
        }
      } catch (e) {
        console.error('获取用户头像失败', e)
      }
    },
    prevWeek() {
      if (this.currentWeek > 1) {
        this.currentWeek--;
      }
    },
    nextWeek() {
      if (this.currentWeek < this.totalWeeks) {
        this.currentWeek++;
      }
    },
    getDayDate(dayIndex) {
      // 计算当前周的对应日期
      const date = new Date(this.semesterStartDate);
      date.setDate(this.semesterStartDate.getDate() + (this.currentWeek - 1) * 7 + dayIndex);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    },
    getCourse(dayIndex, periodIndex) {
      // 根据星期几和节次查找对应课程
      return this.courses.find(course => 
        course.day === dayIndex && 
        periodIndex >= course.startPeriod && 
        periodIndex <= course.endPeriod
      );
    },
    getCourseAt(dayIndex, periodIndex) {
      // 根据星期几和节次查找对应课程
      return this.courses.find(course => 
        course.day === dayIndex && 
        periodIndex >= course.startPeriod && 
        periodIndex <= course.endPeriod
      );
    },
    isCourseStartAtPeriod(dayIndex, periodIndex) {
      // 查找是否有课程在当前节次开始
      return this.courses.some(course => 
        course.day === dayIndex && 
        course.startPeriod === periodIndex
      );
    },
    getCourseStyle(course) {
      // 限制课程的开始和结束时间，确保在合理范围内
      const validStartPeriod = Math.max(0, Math.min(course.startPeriod, 11));
      const validEndPeriod = Math.max(validStartPeriod, Math.min(course.endPeriod, 11));
      
      // 计算课程卡片高度
      const spanPeriods = validEndPeriod - validStartPeriod + 1;
      const height = spanPeriods * 120 - 10 + 'rpx';
      
      return {
        height: height,
        backgroundColor: course.color,
        top: '5rpx' // 固定顶部对齐
      };
    },
    showCourseDetail(course) {
      uni.showModal({
        title: course.name,
        content: `教师: ${course.teacher}\n地点: ${course.location}`,
        showCancel: false
      });
    }
  }
}
</script>

<style lang="scss">
.schedule-container {
  min-height: 100vh;
  position: relative;
  padding-bottom: 120rpx; /* 为底部Tab栏留出空间 */
  padding-top: var(--status-bar-height);
}

.schedule-content {
  position: relative;
  z-index: 2;
  padding: 160rpx 30rpx 30rpx; /* 为顶部导航预留空间 */
  display: flex;
  flex-direction: column;
}

.term-selector {
  margin-bottom: 20rpx;
  padding: 10rpx;
  
  .term-scroll {
    width: 100%;
    white-space: nowrap;
  }
  
  .term-list {
    display: flex;
    padding: 10rpx 5rpx;
  }
  
  .term-item {
    display: inline-block;
    padding: 15rpx 30rpx;
    margin: 0 10rpx;
    border-radius: 40rpx;
    background-color: rgba(255, 255, 255, 0.6);
    font-size: 28rpx;
    
    &.active {
      background: linear-gradient(135deg, #4facfe, #4361ee);
      color: #fff;
      box-shadow: 0 4rpx 10rpx rgba(79, 172, 254, 0.3);
    }
  }
}

.week-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 20rpx;
  
  .selector-arrow {
    width: 70rpx;
    height: 70rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #4facfe, #4361ee);
    border-radius: 50%;
    box-shadow: 0 4rpx 10rpx rgba(79, 172, 254, 0.3);
    
    image {
      width: 40rpx;
      height: 40rpx;
      filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(103%);
    }
  }
  
  .current-week {
    font-size: 36rpx;
    font-weight: bold;
    margin: 0 40rpx;
    padding: 10rpx 40rpx;
    background: linear-gradient(135deg, #e0f7ff, #e9f5ff);
    border-radius: 40rpx;
    color: #333;
    box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.05);
    min-width: 120rpx;
    text-align: center;
  }
}

.weekday-row {
  display: flex;
  height: 80rpx;
  margin-bottom: 10rpx;
  border-radius: 16rpx;
  overflow: hidden;
  
  .time-column {
    width: 80rpx;
    flex-shrink: 0;
    border-right: 1rpx solid rgba(0, 0, 0, 0.05);
  }
  
  .weekday-cell {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-right: 1rpx solid rgba(0, 0, 0, 0.05);
    position: relative;
    
    &:last-child {
      border-right: none;
    }
    
    .weekday {
      font-size: 24rpx;
      font-weight: bold;
      color: #333;
    }
    
    .date {
      font-size: 20rpx;
      color: #666;
    }
  }
}

.schedule-grid {
  flex: 1;
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;
}

.schedule-table {
  display: flex;
  position: relative;
  min-height: 1440rpx; /* 12节课 * 120rpx */
}

.time-column {
  width: 80rpx;
  flex-shrink: 0;
  border-right: 1rpx solid rgba(0, 0, 0, 0.05);
  background-color: rgba(255, 255, 255, 0.05);
  
  .time-cell {
    height: 120rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
    
    .period {
      font-size: 24rpx;
      font-weight: bold;
      color: #333;
    }
    
    .time {
      font-size: 16rpx;
      color: #666;
      text-align: center;
      line-height: 1.2;
    }
  }
}

.course-grid {
  flex: 1;
  display: flex;
  position: relative;
}

.day-column {
  flex: 1;
  border-right: 1rpx solid rgba(0, 0, 0, 0.05);
  
  &:last-child {
    border-right: none;
  }
  
  .period-cell {
    height: 120rpx;
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
    position: relative;
    padding: 5rpx;
  }
}

.course-card {
  position: absolute;
  left: 5rpx;
  right: 5rpx;
  top: 5rpx;
  bottom: 5rpx;
  border-radius: 12rpx;
  padding: 10rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  
  .course-name {
    font-size: 22rpx;
    color: #fff;
    font-weight: bold;
    margin-bottom: 8rpx;
    text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
  }
  
  .course-location {
    font-size: 18rpx;
    color: rgba(255, 255, 255, 0.9);
  }
}
</style> 
