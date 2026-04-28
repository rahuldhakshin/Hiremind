import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("jq_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem("jq_refresh_token");
        if (refresh) {
          const { data } = await axios.post(`${API_BASE}/auth/token/refresh/`, {
            refresh,
          });
          localStorage.setItem("jq_access_token", data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem("jq_access_token");
        localStorage.removeItem("jq_refresh_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───
export const authAPI = {
  login: (email: string, password: string, role: string) =>
    api.post("/auth/login/", { email, password, role }),
  register: (data: Record<string, unknown>) => api.post("/auth/register/", data),
  logout: (refresh: string) => api.post("/auth/logout/", { refresh }),
};

// ─── Student Profile ───
export const profileAPI = {
  get: () => api.get("/student/profile/"),
  update: (data: Record<string, unknown>) => api.patch("/student/profile/", data),
  parseResume: (file: File) => {
    const form = new FormData();
    form.append("resume", file);
    return api.post("/resume/parse/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  atsReview: (file: File) => {
    const form = new FormData();
    form.append("resume", file);
    return api.post("/resume/review/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  interviewQuestions: (file: File) => {
    const form = new FormData();
    form.append("resume", file);
    return api.post("/resume/interview-questions/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  placementPredict: () => api.post("/predict/placement/"),
};

// ─── Jobs ───
export const jobsAPI = {
  list: (params?: Record<string, unknown>) => api.get("/jobs/", { params }),
  detail: (id: number) => api.get(`/jobs/${id}/`),
  apply: (id: number) => api.post(`/applications/apply/`, { job: id }),
  withdraw: (id: number) => api.post(`/applications/${id}/withdraw/`),
  skillGap: (id: number) => api.get(`/jobs/${id}/skill-gap/`),
  coverLetter: (id: number) => api.post(`/jobs/${id}/cover-letter/`),
  readinessScore: () => api.get(`/student/readiness-score/`),
};

// ─── Applications ───
export const applicationsAPI = {
  list: () => api.get("/applications/my/"),
  detail: (id: number) => api.get(`/applications/${id}/`),
};

// ─── AI Chat ───
export const aiChatAPI = {
  send: (message: string, history: unknown[]) =>
    api.post("/ai/chat/", { message, history }),
};

// ─── Notifications ───
export const notificationsAPI = {
  list: () => api.get("/notifications/"),
  markRead: (id: number) => api.patch(`/notifications/${id}/read/`, { is_read: true }),
  markAllRead: () => api.post("/notifications/read-all/"),
};

// ─── Recruiter ───
export const recruiterAPI = {
  myJobs: () => api.get("/jobs/my-jobs/"),
  postJob: (data: Record<string, unknown>) => api.post("/jobs/create/", data),
  updateJob: (id: number, data: Record<string, unknown>) =>
    api.patch(`/jobs/${id}/`, data),
  getApplicants: (jobId: number) => api.get(`/applications/job/${jobId}/`),
  updateApplicationStatus: (appId: number, status: string) =>
    api.patch(`/applications/${appId}/status/`, { status }),
};

// ─── Admin ───
export const adminAPI = {
  allUsers: () => api.get("/admin/all-users/"),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}/`),
  systemStats: () => api.get("/admin/system-stats/"),
};

// ─── Alumni ───
export const alumniAPI = {
  list: (params?: Record<string, unknown>) => api.get("/alumni/", { params }),
  reviews: (companyName: string) =>
    api.get("/reviews/", { params: { company: companyName } }),
  submitReview: (data: Record<string, unknown>) => api.post("/reviews/", data),
};

// ─── Placement Officer ───
export const officerAPI = {
  drives: () => api.get("/drives/"),
  createDrive: (data: Record<string, unknown>) => api.post("/drives/", data),
  pendingJobs: () => api.get("/jobs/pending/"),
  approveJob: (id: number, action: "approve" | "reject") => api.post(`/jobs/${id}/approve/`, { action }),
  reports: () => api.get("/analytics/"),
};

export default api;
