const API_BASE_URL = "https://hostelops-api.onrender.com"

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("hostelops_token")

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  const data = await response.json()

    if (!response.ok) {
    let errorMessage = "Something went wrong. Please try again."

    if (typeof data.detail === "string") {
      errorMessage = data.detail
    } else if (Array.isArray(data.detail)) {
      errorMessage = data.detail
        .map((item) => item.msg || JSON.stringify(item))
        .join(", ")
    } else if (data.detail && typeof data.detail === "object") {
      errorMessage = data.detail.message || JSON.stringify(data.detail)
    }

    throw new Error(errorMessage)
  }

  return data
}

export async function loginUser(email, password) {
  return apiRequest("/users/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  })
}

export async function getMyProfile() {
  return apiRequest("/users/me")
}


export async function getComplaints(page = 1, limit = 50) {
  return apiRequest(`/complaints?page=${page}&limit=${limit}`)
}

export async function getNotifications() {
  return apiRequest("/notifications")
}

export async function getComplaint(complaintId) {
  return apiRequest(`/complaints/${complaintId}`)
}

export async function getComplaintHistory(complaintId) {
  return apiRequest(`/complaints/${complaintId}/history`)
}

export async function getComplaintCategories() {
  return apiRequest("/complaint-categories")
}

export async function createComplaint(complaintData) {
  return apiRequest("/complaints", {
    method: "POST",
    body: JSON.stringify(complaintData),
  })
}

export async function getRoomAssignments() {
  return apiRequest("/room-assignments")
}

export async function markNotificationAsRead(notificationId) {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  })
}

export async function getRooms() {
  return apiRequest("/rooms")
}

export async function getTechnicians() {
  return apiRequest("/technicians")
}

export async function getWardenDashboard() {
  return apiRequest("/dashboard/warden")
}

export async function assignComplaint(complaintId, technicianId) {
  return apiRequest(`/complaints/${complaintId}/assign`, {
    method: "POST",
    body: JSON.stringify({
      technician_id: Number(technicianId),
    }),
  })
}

export async function getTechnicianDashboard() {
  return apiRequest("/dashboard/technician")
}

export async function getAssignedComplaints() {
  return apiRequest("/complaints/assigned-to-me")
}

export async function updateComplaintStatus(complaintId, status) {
  return apiRequest(`/complaints/${complaintId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
    }),
  })
}