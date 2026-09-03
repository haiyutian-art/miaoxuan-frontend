<template>
  <view class="grade-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @tap="goBack">
        <CommonIcon type="back" size="medium" clickable />
      </view>
      <text class="title">成绩管理</text>
      <view class="placeholder-btn"></view>
    </view>

    <!-- 课程选择区域 -->
    <view class="course-selector" v-if="!selectedCourse || showCourseSelector">
      <view class="selector-title">选择课程</view>
      <view class="course-list">
        <view 
          class="course-item" 
          v-for="(course, index) in teacherCourses" 
          :key="course.courseId" 
          @tap="selectCourse(course)"
          :class="{'selected': selectedCourse && selectedCourse.courseId === course.courseId}"
        >
          <view class="course-item-name">{{course.courseName}}</view>
          <view class="course-item-info">
            <text class="course-item-code">{{course.courseId}}</text>
            <text class="course-item-students">{{course.number || 0}}人</text>
          </view>
        </view>
      </view>
      
      <view class="empty-courses" v-if="teacherCourses.length === 0 && !isLoadingCourses">
        <text>暂无课程数据</text>
      </view>
      
      <view class="loading-state mini" v-if="isLoadingCourses">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载课程中...</text>
      </view>
    </view>

    <!-- 当前课程信息 -->
    <view class="current-course-info" v-if="selectedCourse && !showCourseSelector">
      <view class="course-basic-info">
        <text class="course-name">{{selectedCourse.courseName}}</text>
        <text class="course-id">ID: {{selectedCourse.courseId}}</text>
      </view>
      <view class="course-switch-btn" @tap="showCourseSelector = true">
        <text>切换课程</text>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-section" v-if="selectedCourse">
      <view class="search-bar">
        <text class="iconfont icon-search"></text>
        <input type="text" v-model="searchKey" placeholder="搜索学生姓名/学号" @input="handleSearch" confirm-type="search" />
        <text class="clear-btn" v-if="searchKey" @tap="clearSearch">×</text>
      </view>
      
      <view class="overview-card">
        <view class="overview-stat">
          <text class="stat-value">{{studentsInfo.totalCount}}</text>
          <text class="stat-label">总人数</text>
        </view>
        <view class="overview-divider"></view>
        <view class="overview-stat">
          <text class="stat-value">{{studentsInfo.gradedCount}}</text>
          <text class="stat-label">已录入</text>
        </view>
        <view class="overview-divider"></view>
        <view class="overview-stat">
          <text class="stat-value">{{studentsInfo.avgGrade || '-'}}</text>
          <text class="stat-label">平均分</text>
        </view>
      </view>
    </view>

    <!-- 成绩列表 -->
    <view class="grade-list" v-if="filteredStudents.length > 0 && selectedCourse">
      <view class="student-card" v-for="(student, index) in filteredStudents" :key="index" :animation="getCardAnimation(index)">
        <view class="student-header">
          <view class="student-avatar">
            {{student.studentName.slice(0, 1)}}
          </view>
          <view class="student-info">
            <text class="student-name">{{student.studentName}}</text>
            <text class="student-no">{{student.studentNo}}</text>
          </view>
          <view class="grade-status" :class="getGradeStatusClass(student)">
            {{getGradeStatusText(student)}}
          </view>
        </view>
        
        <view class="grade-inputs">
          <view class="grade-field">
            <text class="grade-label">平时成绩 (40%)</text>
            <view class="input-container" :class="{'focus': currentFocus === `usual-${student.chooseId}`, 'error': hasError(student, 'usualGrade')}">
              <input 
                type="digit" 
                class="grade-input" 
                placeholder="请输入" 
                v-model="student.usualGrade" 
                @focus="setFocus(`usual-${student.chooseId}`)" 
                @blur="validateGrade(student, 'usualGrade')"
                :disabled="isSubmitting"
              />
            </view>
          </view>
          
          <view class="grade-field">
            <text class="grade-label">考试成绩 (60%)</text>
            <view class="input-container" :class="{'focus': currentFocus === `exam-${student.chooseId}`, 'error': hasError(student, 'examGrade')}">
              <input 
                type="digit" 
                class="grade-input" 
                placeholder="请输入" 
                v-model="student.examGrade" 
                @focus="setFocus(`exam-${student.chooseId}`)" 
                @blur="validateGrade(student, 'examGrade')"
                :disabled="isSubmitting"
              />
            </view>
          </view>
          
          <view class="grade-field total-grade">
            <text class="grade-label">总成绩</text>
            <view class="total-value" :class="getGradeClass(calculateTotalGrade(student))">
              {{calculateTotalGrade(student)}}
            </view>
          </view>
        </view>
        
        <view class="card-actions">
          <view class="action-btn save-btn" @tap="saveGrade(student)" :class="{'disabled': isSubmitting || !canSaveGrade(student)}">
            <text class="iconfont icon-save"></text>
            <text>保存</text>
          </view>
          <view class="action-btn reset-btn" @tap="resetGrade(student)" :class="{'disabled': isSubmitting}">
            <text class="iconfont icon-reset"></text>
            <text>重置</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="((filteredStudents.length === 0 && !isLoading) || !selectedCourse) && !showCourseSelector">
      <image src="/static/images/empty-students.png" mode="aspectFit" class="empty-icon"></image>
      <text class="empty-text">{{getEmptyText()}}</text>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-if="isLoading && selectedCourse">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 批量操作栏 -->
    <view class="batch-actions" v-if="filteredStudents.length > 0 && selectedCourse">
      <view class="batch-btn save-all-btn" @tap="saveAllGrades" :class="{'disabled': isSubmitting || !hasGradeChanges()}">
        <text class="btn-text">保存全部</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getTeacherCourses } from '@/api/course/index.js';
import CommonIcon from '@/components/CommonIcon.vue'

import { API_BASE_URL } from '@/config'

export default {
  components: {
    CommonIcon
  },
  data() {
    return {
      courseId: '',
      courseName: '',
      searchKey: '',
      students: [],
      originalStudents: [], // 用于保存初始数据，用于重置和检测变更
      isLoading: false,
      isSubmitting: false,
      currentFocus: '',
      errors: {},
      cardAnimations: [],
      studentsInfo: {
        totalCount: 0,
        gradedCount: 0,
        avgGrade: 0
      },
      // 新增属性，用于课程选择功能
      teacherCourses: [],
      isLoadingCourses: true,
      selectedCourse: null,
      showCourseSelector: false,
      selectedStudentId: '',
      selectedStudentName: ''
    }
  },
  computed: {
    filteredStudents() {
      if (!this.searchKey) return this.students
      const key = this.searchKey.toLowerCase()
      return this.students.filter(student => 
        student.studentName.toLowerCase().includes(key) || 
        student.studentNo.toLowerCase().includes(key)
      )
    }
  },
  onLoad(options) {
    // 如果从其他页面传入了课程ID和名称，先记录下来
    this.courseId = options.courseId
    this.courseName = options.courseName
    
    // 检查是否有从学生管理页面传递的学生信息
    const selectedStudent = uni.getStorageSync('selectedStudent')
    if (selectedStudent) {
      console.log('从学生管理页面获取到学生信息:', selectedStudent)
      // 保存学生信息，稍后查找相关课程
      this.selectedStudentId = selectedStudent.studentId
      this.selectedStudentName = selectedStudent.studentName
      
      // 清除本地存储中的临时学生信息
      uni.removeStorageSync('selectedStudent')
    }
    
    // 从后端获取教师所有课程列表
    this.getTeacherCourseList()
  },
  methods: {
    // 获取教师所有课程列表
    getTeacherCourseList() {
      this.isLoadingCourses = true
      
      // 获取登录token
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        })
        this.isLoadingCourses = false
        return
      }
      
      // 调用后端API获取教师课程
      getTeacherCourses().then(res => {
        console.log('获取教师课程列表响应:', res)
        
        if (res.status === 0 && res.data) {
          // 成功获取课程列表
          this.teacherCourses = res.data
          
          // 如果有从其他页面传入的课程ID，尝试匹配
          if (this.courseId) {
            const matchedCourse = this.teacherCourses.find(
              course => String(course.courseId) === String(this.courseId)
            )
            
            if (matchedCourse) {
              // 找到匹配的课程，自动选择
              this.selectCourse(matchedCourse)
            } else {
              // 没有找到匹配的课程，显示选择界面
              this.showCourseSelector = true
            }
          } else if (this.teacherCourses.length > 0) {
            // 如果没有传入课程ID但有课程，显示选择界面
            this.showCourseSelector = true
          }
        } else {
          uni.showToast({
            title: res.msg || '获取课程列表失败',
            icon: 'none'
          })
        }
      }).catch(err => {
        console.error('获取教师课程列表失败:', err)
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
      }).finally(() => {
        this.isLoadingCourses = false
      })
    },
    
    // 选择课程
    selectCourse(course) {
      this.selectedCourse = course
      this.courseId = course.courseId
      this.courseName = course.courseName
      this.showCourseSelector = false
      
      // 重置搜索关键词，确保显示全部学生
      if (!this.selectedStudentId) {
        this.searchKey = ''
      }
      
      // 加载所选课程的学生列表
      this.getStudentList()
    },

    goBack() {
      try {
        uni.reLaunch({
          url: '/pages/teacher/course'
        });
      } catch (error) {
        console.error('返回异常:', error);
        uni.reLaunch({
          url: '/pages/teacher/course'
        });
      }
    },
    
    getStudentList() {
      // 确保已选择课程
      if (!this.selectedCourse || !this.courseId) {
        console.error('未选择课程，无法获取学生列表')
        return
      }
      
      this.isLoading = true
      
      // 获取登录token
      const token = uni.getStorageSync('token')
      if (!token) {
        console.error('未找到登录token')
        uni.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        })
        this.useLocalDemoData()
        this.isLoading = false
        return
      }
      
      // 获取课程学生名单 - 使用后端支持的token参数
      uni.request({
        url: `${API_BASE_URL}/teacher/course/${this.courseId}/students`,
        method: 'GET',
        data: { token: token }, // token作为请求参数传递，符合后端接口定义
        success: (res) => {
          console.log('获取学生列表响应:', res)
          if (res.statusCode === 200 && res.data && res.data.status === 0) {
            // 处理后端返回的数据
            const studentList = res.data.data || []
            
            this.students = studentList.map(student => {
              return {
                chooseId: student.chooseId.toString(),
                studentId: student.studentId,
                studentNo: student.studentNo,
                studentName: student.studentName,
                usualGrade: student.usualGrade ? student.usualGrade.toString() : '',
                examGrade: student.examGrade ? student.examGrade.toString() : ''
              }
            })
            
            // 保存一份原始数据，用于重置和对比变化
            this.originalStudents = JSON.parse(JSON.stringify(this.students))
            
            // 初始化动画
            this.initCardAnimations()
            
            // 更新统计信息
            this.updateStudentsInfo()
            
            // 检查是否需要自动定位到特定学生
            if (this.selectedStudentId) {
              // 查找传入的学生ID
              const targetStudent = this.students.find(
                s => String(s.studentId) === String(this.selectedStudentId)
              )
              
              if (targetStudent) {
                // 找到对应学生，设置搜索关键词以过滤出该学生
                this.searchKey = targetStudent.studentName || targetStudent.studentNo
                
                // 滚动到该学生所在位置
                setTimeout(() => {
                  const query = uni.createSelectorQuery()
                  query.selectAll('.student-card').boundingClientRect()
                  query.exec(res => {
                    if (res && res[0] && res[0].length > 0) {
                      // 找到学生在过滤后列表中的索引
                      const index = this.filteredStudents.findIndex(
                        s => String(s.studentId) === String(this.selectedStudentId)
                      )
                      
                      if (index >= 0 && index < res[0].length) {
                        const scrollTop = res[0][index].top
                        uni.pageScrollTo({
                          scrollTop: scrollTop,
                          duration: 300
                        })
                        
                        // 提示用户已找到学生
                        uni.showToast({
                          title: `已定位到学生: ${this.selectedStudentName}`,
                          icon: 'none',
                          duration: 2000
                        })
                      }
                    }
                  })
                }, 500)
              } else {
                uni.showToast({
                  title: `未在本课程找到该学生`,
                  icon: 'none'
                })
              }
              
              // 清除选中学生信息，避免重复处理
              this.selectedStudentId = ''
              this.selectedStudentName = ''
            }
          } else {
            console.error('获取学生名单失败:', res.data?.msg || '未知错误')
            uni.showToast({
              title: res.data?.msg || '获取学生数据失败',
              icon: 'none'
            })
            
            // 如果获取失败则使用本地模拟数据
            this.useLocalDemoData()
          }
        },
        fail: (err) => {
          console.error('获取学生列表失败:', err)
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          })
          
          // 如果获取失败则使用本地模拟数据
          this.useLocalDemoData()
        },
        complete: () => {
          this.isLoading = false
        }
      })
    },
    
    // 使用本地模拟数据（仅当API请求失败时使用）
    useLocalDemoData() {
      // 模拟学生数据
      this.students = [
        {
          studentNo: '2023001',
          studentName: '张三',
          usualGrade: '85',
          examGrade: '92',
          chooseId: '1'
        },
        {
          studentNo: '2023002',
          studentName: '李四',
          usualGrade: '78',
          examGrade: '85',
          chooseId: '2'
        },
        {
          studentNo: '2023003',
          studentName: '王五',
          usualGrade: '',
          examGrade: '',
          chooseId: '3'
        },
        {
          studentNo: '2023004',
          studentName: '赵六',
          usualGrade: '65',
          examGrade: '',
          chooseId: '4'
        },
        {
          studentNo: '2023005',
          studentName: '钱七',
          usualGrade: '',
          examGrade: '72',
          chooseId: '5'
        }
      ]
      
      // 保存一份原始数据，用于重置和对比变化
      this.originalStudents = JSON.parse(JSON.stringify(this.students))
      
      // 初始化动画
      this.initCardAnimations()
      
      // 更新统计信息
      this.updateStudentsInfo()
    },
    initCardAnimations() {
      this.cardAnimations = []
      setTimeout(() => {
        this.filteredStudents.forEach((_, index) => {
          let animation = uni.createAnimation({
            duration: 300,
            timingFunction: 'ease',
            delay: index * 100
          })
          
          animation.opacity(1).translateY(0).step()
          this.cardAnimations[index] = animation.export()
        })
      }, 100)
    },
    getCardAnimation(index) {
      return this.cardAnimations[index]
    },
    updateStudentsInfo() {
      const totalCount = this.students.length
      const gradedCount = this.students.filter(s => s.usualGrade && s.examGrade).length
      
      // 计算平均分
      let totalGrade = 0
      let validCount = 0
      
      this.students.forEach(student => {
        if (student.usualGrade && student.examGrade) {
          const usual = parseFloat(student.usualGrade) || 0
          const exam = parseFloat(student.examGrade) || 0
          const total = usual * 0.4 + exam * 0.6
          
          totalGrade += total
          validCount++
        }
      })
      
      const avgGrade = validCount > 0 ? (totalGrade / validCount).toFixed(1) : 0
      
      this.studentsInfo = {
        totalCount,
        gradedCount,
        avgGrade
      }
    },
    getEmptyText() {
      if (!this.selectedCourse) {
        return '请先选择课程'
      }
      return this.searchKey ? '未找到匹配的学生' : '暂无学生数据'
    },
    showGradeHelp() {
      uni.showModal({
        title: '成绩录入说明',
        content: '平时成绩占40%，考试成绩占60%。\n成绩范围0-100分。\n蓝色：优秀(≥85)\n绿色：良好(≥70)\n黄色：及格(≥60)\n红色：不及格(<60)',
        showCancel: false
      })
    },
    handleSearch() {
      // 搜索功能已在computed中实现
    },
    clearSearch() {
      this.searchKey = ''
    },
    setFocus(fieldId) {
      this.currentFocus = fieldId
      // 清除错误
      if (this.errors[fieldId]) {
        this.errors[fieldId] = false
      }
    },
    hasError(student, field) {
      const errorKey = `${field}-${student.chooseId}`
      return this.errors[errorKey]
    },
    validateGrade(student, type) {
      const errorKey = `${type}-${student.chooseId}`
      this.currentFocus = ''
      
      const grade = student[type]
      if (grade === '') return true
      
      const num = parseFloat(grade)
      if (isNaN(num) || num < 0 || num > 100) {
        this.errors[errorKey] = true
        uni.showToast({
          title: '请输入0-100之间的数字',
          icon: 'none'
        })
        return false
      }
      
      this.errors[errorKey] = false
      return true
    },
    calculateTotalGrade(student) {
      if (!student.usualGrade && !student.examGrade) return '-'
      
      const usual = parseFloat(student.usualGrade) || 0
      const exam = parseFloat(student.examGrade) || 0
      
      if (this.hasError(student, 'usualGrade') || this.hasError(student, 'examGrade')) {
        return '-'
      }
      
      return (usual * 0.4 + exam * 0.6).toFixed(1)
    },
    getGradeClass(grade) {
      if (grade === '-') return ''
      
      const numGrade = parseFloat(grade)
      if (numGrade >= 85) return 'grade-excellent'
      if (numGrade >= 70) return 'grade-good'
      if (numGrade >= 60) return 'grade-pass'
      return 'grade-fail'
    },
    getGradeStatusClass(student) {
      if (this.hasError(student, 'usualGrade') || this.hasError(student, 'examGrade')) {
        return 'status-error'
      }
      
      if (student.usualGrade && student.examGrade) {
        return 'status-complete'
      }
      
      if (student.usualGrade || student.examGrade) {
        return 'status-partial'
      }
      
      return 'status-none'
    },
    getGradeStatusText(student) {
      if (this.hasError(student, 'usualGrade') || this.hasError(student, 'examGrade')) {
        return '有错误'
      }
      
      if (student.usualGrade && student.examGrade) {
        return '已完成'
      }
      
      if (student.usualGrade || student.examGrade) {
        return '部分完成'
      }
      
      return '未录入'
    },
    canSaveGrade(student) {
      return (student.usualGrade || student.examGrade) && 
        !this.hasError(student, 'usualGrade') && 
        !this.hasError(student, 'examGrade')
    },
    hasGradeChanges() {
      return this.students.some(student => {
        const original = this.originalStudents.find(s => s.chooseId === student.chooseId)
        return (student.usualGrade !== original.usualGrade || student.examGrade !== original.examGrade) &&
          !this.hasError(student, 'usualGrade') && 
          !this.hasError(student, 'examGrade')
      })
    },
    resetGrade(student) {
      // 找到对应的原始学生数据
      const original = JSON.parse(JSON.stringify(this.originalStudents.find(s => s.chooseId === student.chooseId)))
      if (original) {
        // 直接赋值属性而不是引用
        student.usualGrade = original.usualGrade
        student.examGrade = original.examGrade
      }
      
      // 清除可能的错误
      this.errors[`usualGrade-${student.chooseId}`] = false
      this.errors[`examGrade-${student.chooseId}`] = false
      
      uni.showToast({
        title: '成绩已重置',
        icon: 'none'
      })
    },
    async saveGrade(student) {
      if (!this.canSaveGrade(student)) {
        return
      }
      
      this.isSubmitting = true
      
      // 获取登录token
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        this.isSubmitting = false
        return
      }
      
      try {
        uni.showLoading({ title: '保存中...' })
        
        // 调用后端API保存成绩 - 使用后端支持的token参数
        const res = await new Promise((resolve, reject) => {
          uni.request({
            url: `${API_BASE_URL}/teacher/grade/${student.chooseId}`,
            method: 'PUT',
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'  // PUT请求需要设置Content-Type
            },
            data: {
              usualGrade: parseFloat(student.usualGrade) || 0,
              examGrade: parseFloat(student.examGrade) || 0,
              token: token  // token作为请求参数传递，符合后端接口定义
            },
            success: (res) => resolve(res),
            fail: (err) => reject(err)
          })
        })
        
        console.log('保存成绩响应:', res)
        
        if (res.statusCode === 200 && res.data && res.data.status === 0) {
          // 保存成功后更新原始数据
          const index = this.originalStudents.findIndex(s => s.chooseId === student.chooseId)
          if (index >= 0) {
            this.originalStudents[index].usualGrade = student.usualGrade
            this.originalStudents[index].examGrade = student.examGrade
          }
          
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
          
          // 更新统计信息
          this.updateStudentsInfo()
        } else {
          console.error('保存成绩失败:', res.data?.msg || '未知错误')
          uni.showToast({
            title: res.data?.msg || '保存失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('保存成绩失败:', error)
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
        this.isSubmitting = false
      }
    },
    async saveAllGrades() {
      if (!this.hasGradeChanges() || this.isSubmitting) {
        return
      }
      
      this.isSubmitting = true
      
      // 获取登录token
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        this.isSubmitting = false
        return
      }
      
      try {
        uni.showLoading({ title: '批量保存中...' })
        
        // 找出所有有变更的学生成绩
        const changedStudents = this.students.filter(student => {
          const original = this.originalStudents.find(s => s.chooseId === student.chooseId)
          return (student.usualGrade !== original.usualGrade || student.examGrade !== original.examGrade) &&
            !this.hasError(student, 'usualGrade') && 
            !this.hasError(student, 'examGrade') &&
            (student.usualGrade || student.examGrade)
        })
        
        // 批量提交所有变更的成绩 - 使用后端支持的token参数
        const promises = changedStudents.map(student => {
          return new Promise((resolve, reject) => {
            uni.request({
              url: `${API_BASE_URL}/teacher/grade/${student.chooseId}`,
              method: 'PUT',
              header: {
                'Content-Type': 'application/x-www-form-urlencoded'  // PUT请求需要设置Content-Type
              },
              data: {
                usualGrade: parseFloat(student.usualGrade) || 0,
                examGrade: parseFloat(student.examGrade) || 0,
                token: token  // token作为请求参数传递，符合后端接口定义
              },
              success: (res) => resolve(res),
              fail: (err) => reject(err)
            })
          })
        })
        
        // 等待所有请求完成
        const results = await Promise.allSettled(promises)
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value.data.status === 0).length
        
        if (successCount === changedStudents.length) {
          // 全部保存成功
          // 更新原始数据
          changedStudents.forEach(student => {
            const index = this.originalStudents.findIndex(s => s.chooseId === student.chooseId)
            if (index >= 0) {
              this.originalStudents[index].usualGrade = student.usualGrade
              this.originalStudents[index].examGrade = student.examGrade
            }
          })
          
          uni.showToast({
            title: '全部保存成功',
            icon: 'success'
          })
          
          // 更新统计信息
          this.updateStudentsInfo()
        } else {
          // 部分保存失败
          uni.showToast({
            title: `成功${successCount}/${changedStudents.length}`,
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('批量保存成绩失败:', error)
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style lang="scss">
/* SVG图标样式 */
.icon-svg {
  width: 40rpx;
  height: 40rpx;
  fill: currentColor;
  color: currentColor;
}

/* 使用图片代替字体图标 */
.icon-back:before { content: '\2190'; } /* 左箭头 ← */
.icon-help:before { content: '\003F'; } /* 问号 ? */
.icon-search:before { content: '\1F50D'; } /* 放大镜 🔍 */
.icon-save:before { content: '\1F4BE'; } /* 保存 💾 */
.icon-reset:before { content: '\21BB'; } /* 循环 ↻ */

/* 通用图标样式 */
.iconfont {
  font-family: sans-serif;
  font-style: normal;
}

.grade-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  position: relative;
  
  .title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
  }
  
  .back-btn, .placeholder-btn {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    z-index: 1;
  }
  
  .back-btn {
    background: rgba(0, 0, 0, 0.05);
    transition: background-color 0.2s;
    
    &:active {
      background: rgba(0, 0, 0, 0.1);
    }
  }
}

.search-section {
  padding: 30rpx;
  margin-top: -80rpx;
  position: relative;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
  
  .search-bar {
    background-color: #ffffff;
    border-radius: 12rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    padding: 0 20rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
    margin-bottom: 20rpx;
    
    .icon-search {
      font-size: 36rpx;
      color: #999999;
      margin-right: 10rpx;
    }
    
    input {
      flex: 1;
      height: 80rpx;
      font-size: 28rpx;
      color: #333333;
    }
    
    .clear-btn {
      font-size: 36rpx;
      color: #999999;
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .overview-card {
    background-color: #ffffff;
    border-radius: 12rpx;
    height: 120rpx;
    display: flex;
    align-items: center;
    justify-content: space-around;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
    
    .overview-stat {
      flex: 1;
      text-align: center;
      
      .stat-value {
        display: block;
        font-size: 40rpx;
        font-weight: bold;
        color: #1890ff;
        margin-bottom: 6rpx;
      }
      
      .stat-label {
        display: block;
        font-size: 24rpx;
        color: #999999;
      }
    }
    
    .overview-divider {
      width: 2rpx;
      height: 60rpx;
      background-color: #f0f0f0;
    }
  }
}

.grade-list {
  padding: 0 30rpx;
  width: 100%;
  box-sizing: border-box;
  
  .student-card {
    background-color: #ffffff;
    border-radius: 16rpx;
    margin-bottom: 30rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    overflow: hidden;
    width: 100%;
    box-sizing: border-box;
    opacity: 0;
    transform: translateY(30rpx);
    
    .student-header {
      display: flex;
      align-items: center;
      margin-bottom: 30rpx;
      
      .student-avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 40rpx;
        background-color: #1890ff;
        color: #ffffff;
        font-size: 36rpx;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;
      }
      
      .student-info {
        flex: 1;
        
        .student-name {
          font-size: 32rpx;
          font-weight: bold;
          color: #333333;
          margin-bottom: 6rpx;
          display: block;
        }
        
        .student-no {
          font-size: 24rpx;
          color: #999999;
          display: block;
        }
      }
      
      .grade-status {
        font-size: 24rpx;
        padding: 4rpx 16rpx;
        border-radius: 30rpx;
        
        &.status-complete {
          background-color: rgba(82, 196, 26, 0.1);
          color: #52c41a;
        }
        
        &.status-partial {
          background-color: rgba(250, 173, 20, 0.1);
          color: #faad14;
        }
        
        &.status-none {
          background-color: rgba(153, 153, 153, 0.1);
          color: #999999;
        }
        
        &.status-error {
          background-color: rgba(245, 34, 45, 0.1);
          color: #f5222d;
        }
      }
    }
    
    .grade-inputs {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -10rpx;
      
      .grade-field {
        width: 33.33%;
        padding: 0 10rpx;
        margin-bottom: 20rpx;
        
        .grade-label {
          font-size: 24rpx;
          color: #666666;
          margin-bottom: 10rpx;
          display: block;
        }
        
        .input-container {
          height: 80rpx;
          background-color: #f5f5f5;
          border-radius: 8rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1rpx solid transparent;
          transition: all 0.3s;
          
          &.focus {
            background-color: #ffffff;
            border-color: #1890ff;
            box-shadow: 0 0 0 1rpx rgba(24, 144, 255, 0.2);
          }
          
          &.error {
            border-color: #f5222d;
            background-color: #fff2f0;
          }
          
          .grade-input {
            width: 100%;
            height: 80rpx;
            text-align: center;
            font-size: 28rpx;
            font-weight: bold;
            color: #333333;
          }
        }
        
        .total-value {
          height: 80rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f5f5f5;
          border-radius: 8rpx;
          font-size: 32rpx;
          font-weight: bold;
          color: #333333;
          
          &.grade-excellent {
            background-color: rgba(24, 144, 255, 0.1);
            color: #1890ff;
          }
          
          &.grade-good {
            background-color: rgba(82, 196, 26, 0.1);
            color: #52c41a;
          }
          
          &.grade-pass {
            background-color: rgba(250, 173, 20, 0.1);
            color: #faad14;
          }
          
          &.grade-fail {
            background-color: rgba(245, 34, 45, 0.1);
            color: #f5222d;
          }
        }
      }
    }
    
    .card-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 10rpx;
      
      .action-btn {
        display: flex;
        align-items: center;
        margin-left: 20rpx;
        height: 60rpx;
        padding: 0 20rpx;
        border-radius: 8rpx;
        font-size: 26rpx;
        
        .iconfont {
          margin-right: 6rpx;
        }
        
        &.save-btn {
          background-color: #1890ff;
          color: #ffffff;
        }
        
        &.reset-btn {
          background-color: #f0f0f0;
          color: #666666;
        }
        
        &.disabled {
          opacity: 0.5;
          pointer-events: none;
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  
  .empty-icon {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: 30rpx;
    opacity: 0.5;
  }
  
  .empty-text {
    font-size: 30rpx;
    color: #999999;
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  
  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 6rpx solid #f0f0f0;
    border-top: 6rpx solid #1890ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20rpx;
  }
  
  .loading-text {
    font-size: 28rpx;
    color: #999999;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}

.batch-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  padding: 20rpx 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  
  .batch-btn {
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8rpx;
    font-size: 30rpx;
    
    &.save-all-btn {
      background-color: #1890ff;
      color: #ffffff;
      font-weight: bold;
    }
    
    &.disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  }
}

/* 课程选择器样式 */
.course-selector {
  background-color: #ffffff;
  border-radius: 12rpx;
  margin: 30rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  
  .selector-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 20rpx;
    position: relative;
    padding-left: 20rpx;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 8rpx;
      height: 28rpx;
      width: 6rpx;
      background-color: #1890ff;
      border-radius: 3rpx;
    }
  }
  
  .course-list {
    .course-item {
      background-color: #f9f9f9;
      border-radius: 8rpx;
      padding: 20rpx;
      margin-bottom: 16rpx;
      transition: background-color 0.2s;
      
      &:active, &.selected {
        background-color: rgba(24, 144, 255, 0.1);
      }
      
      &.selected {
        border-left: 4rpx solid #1890ff;
      }
      
      .course-item-name {
        font-size: 30rpx;
        font-weight: bold;
        color: #333333;
        margin-bottom: 8rpx;
      }
      
      .course-item-info {
        display: flex;
        justify-content: space-between;
        
        .course-item-code {
          font-size: 24rpx;
          color: #666666;
        }
        
        .course-item-students {
          font-size: 24rpx;
          color: #1890ff;
        }
      }
    }
  }
  
  .empty-courses {
    padding: 60rpx 0;
    text-align: center;
    color: #999999;
    font-size: 28rpx;
  }
}

/* 当前课程信息 */
.current-course-info {
  background-color: #ffffff;
  margin: 30rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  
  .course-basic-info {
    .course-name {
      font-size: 30rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 4rpx;
      display: block;
    }
    
    .course-id {
      font-size: 24rpx;
      color: #999999;
    }
  }
  
  .course-switch-btn {
    padding: 10rpx 20rpx;
    background-color: rgba(24, 144, 255, 0.1);
    border-radius: 30rpx;
    color: #1890ff;
    font-size: 24rpx;
    
    &:active {
      background-color: rgba(24, 144, 255, 0.2);
    }
  }
}

/* 加载状态小尺寸样式 */
.loading-state.mini {
  padding: 30rpx 0;
  
  .loading-spinner {
    width: 40rpx;
    height: 40rpx;
    margin-bottom: 10rpx;
  }
  
  .loading-text {
    font-size: 24rpx;
  }
}
</style> 
