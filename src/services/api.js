import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://tauportal.vercel.app/api', // Fallback to provided prod URL if local env not set
});

// Add a request interceptor to attach JWT
API.interceptors.request.use((config) => {
    try {
        const saved = localStorage.getItem('user');
        const user = saved ? JSON.parse(saved) : null;
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
    } catch (err) {
        console.error("API Interceptor Error:", err);
    }
    return config;
});

export const login = (credentials) => API.post('/auth/login', credentials);
export const signup = (userData) => API.post('/auth/signup', userData);
export const getDashboardData = (role) => API.get(`/dashboard/${role}`);
export const getAttendance = (email) => API.get(`/attendance/${email}`);
export const addAttendance = (data) => API.post('/attendance', data);
export const updateAttendance = (data) => API.put('/attendance', data);
export const batchUpdateAttendance = (data) => API.post('/attendance/batch-update', data);
export const getBatchAttendance = (data) => API.post('/attendance/batch-view', data);
export const bulkAttendance = (data) => API.post('/attendance/bulk', data);
export const getResults = (email, role, batch) => API.get(`/results/${email}${role ? `?role=${role}&batch=${batch}` : ''}`);
export const updateMarks = (data) => API.post('/results/update', data);
export const batchViewResults = (data) => API.post('/results/batch-view', data);
export const batchUpdateMarks = (data) => API.post('/results/batch-update', data);
export const publishResults = (data) => API.post('/results/publish', data);
export const getPublishStatus = () => API.get('/results/config/status');

// Admin Actions
export const getAdminStats = () => API.get('/admin/stats');
export const getStudents = () => API.get('/admin/students');
export const updateStudent = (email, data) => API.put(`/admin/students/${email}`, data);
export const getFaculty = () => API.get('/admin/faculty');
export const createFaculty = (data) => API.post('/admin/faculty', data);
export const updateFaculty = (email, data) => API.put(`/admin/faculty/${email}`, data);
export const getSubjects = () => API.get('/admin/subjects');
export const updateSubjects = (data) => API.post('/admin/subjects', data);
export const getAttendanceReport = (params) => API.get('/admin/attendance-report', { params });
export const getPendingRegistrations = () => API.get('/admin/pending');
export const approveRegistration = (email) => API.post('/admin/approve', { email });
export const rejectRegistration = (email) => API.post('/admin/reject', { email });
export const getExams = () => API.get('/admin/exams');
export const createExam = (data) => API.post('/admin/exams', data);
export const deleteExam = (id) => API.delete(`/admin/exams/${id}`);

export default API;
