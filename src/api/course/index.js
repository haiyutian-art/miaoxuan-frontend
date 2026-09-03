/**
 * 课程相关API接口
 */
import request from '@/utils/request';

/**
 * 获取课程列表（学生）
 * @param {String} term - 学期
 * @returns {Promise} 课程列表
 */
export function getCourseList(term) {
  return request.get('/student/course', { term });
}

/**
 * 学生选课
 * @param {Object} data - 选课数据 {courseId, term}
 * @returns {Promise} 选课结果
 */
export function chooseCourse(data) {
  return request.post('/student/course', data);
}

/**
 * 学生退课
 * @param {Number} courseId - 课程ID
 * @returns {Promise} 退课结果
 */
export function deleteCourse(courseId) {
  return request.delete(`/student/course/${courseId}`);
}

/**
 * 按课程类型查询（学生）
 * @param {String} type - 课程类型
 * @param {String} term - 学期
 * @returns {Promise} 课程列表
 */
export function getCourseByType(type, term) {
  return request.get(`/student/course/type/${type}`, { term });
}

/**
 * 按专业查询课程（学生）
 * @param {Number} majorId - 专业ID
 * @param {String} term - 学期
 * @returns {Promise} 课程列表
 */
export function getCourseByMajor(majorId, term) {
  return request.get(`/student/course/major/${majorId}`, { term });
}

/**
 * 按课程名称模糊查询（学生）
 * @param {String} courseName - 课程名称
 * @param {String} term - 学期
 * @returns {Promise} 课程列表
 */
export function searchCourse(courseName, term) {
  return request.get('/student/course/search', { courseName, term });
}

/**
 * 获取学生已选课程列表
 * @param {String} term - 学期
 * @returns {Promise} 已选课程列表
 */
export function getMyCourses(term) {
  return request.get('/student/my-courses', { term });
}

/**
 * 获取教师课程列表
 * @returns {Promise} 教师课程列表
 */
export function getTeacherCourses() {
  return request.get('/teacher/courses');
}

/**
 * 根据课程ID获取选课学生列表
 * @param {Number} courseId - 课程ID
 * @returns {Promise} 选课学生列表
 */
export function getCourseStudents(courseId) {
  return request.get(`/teacher/course/${courseId}/students`);
}

/**
 * 获取选课记录详情
 * @param {Number} chooseId - 选课记录ID
 * @returns {Promise} 选课记录详情
 */
export function getChooseDetail(chooseId) {
  return request.get(`/teacher/grade/${chooseId}`);
}

/**
 * 更新学生成绩
 * @param {Number} chooseId - 选课记录ID
 * @param {Object} data - 成绩数据 {usualGrade, examGrade}
 * @returns {Promise} 更新结果
 */
export function updateGrade(chooseId, data) {
  return request.put(`/teacher/grade/${chooseId}`, data);
}

/**
 * 获取课程详情
 * @param {Number} courseId - 课程ID
 * @returns {Promise} 课程详情
 */
export function getCourseDetail(courseId) {
  return request.get(`/teacher/course/detail/${courseId}`);
} 