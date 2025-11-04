/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Axios from "axios";

const API_BASE_URL = import.meta.env.VITE_ADMIN_URL;

export default class ApiService {
  static updateBookingStatus(_id: string, _updatedStatus: string, _internalNotes: string) {
    throw new Error("Method not implemented.");
  }

  static getToken() {
    return localStorage.getItem("token");
  }
  static getRole() {
    return localStorage.getItem("role");
  }

  static getHeader() {
    const token = this.getToken();
    return {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    };
  }

  static getFormHeader() {
    const token = this.getToken();
    return {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "multipart/form-data",
    };
  }

  static async loginUser(loginData: { email: string; password: string; }) {
    const response = await Axios.post(`${API_BASE_URL}/auth/login`, loginData);
    return response.data;
  }

  static async forgotPassword(forgotData: { email: string; }) {
    const response = await Axios.post(`${API_BASE_URL}/auth/forgot`, forgotData);
    return response.data;
  }

  static async restPassword(resetData: any) {
    const response = await Axios.post(`${API_BASE_URL}/auth/reset`, resetData);
    return response.data;
  }

  static async register(registerData: any) {
    const response = await Axios.post(`${API_BASE_URL}/auth/register`, registerData);
    return response.data;
  }




  static async getPackages(params = {}) {
    try {
      const response = await Axios.get(`${API_BASE_URL}/packages`, {
        params,
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async getPackageBySlug(slug: string) {
    try {
      const response = await Axios.get(`${API_BASE_URL}/packages/${slug}`, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async createPackage(packageData: FormData) {
    try {
      const response = await Axios.post(`${API_BASE_URL}/packages`, packageData, {
        headers: this.getFormHeader(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async updatePackage(id: string, packageData: FormData) {
    try {
      const response = await Axios.put(`${API_BASE_URL}/packages/${id}`, packageData, {
        headers: this.getFormHeader(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async deletePackage(id: string) {
    try {
      const response = await Axios.delete(`${API_BASE_URL}/packages/${id}`, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userid");
  }

  static isAuthenticated() {
    return !!this.getToken();
  }

  static isAdmin() {
    const role = this.getRole();
    return role === "admin";
  }
  static isUser() {
    const role = this.getRole();
    return role === "user";
  }

  static clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }

  static async getReviews(params = {}) {
    try {
      const response = await Axios.get(`${API_BASE_URL}/reviews`, {
        params,
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async updateReview(id: string, data: any) {
    try {
      const response = await Axios.put(`${API_BASE_URL}/reviews/${id}`, data, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async deleteReview(id: string) {
    try {
      const response = await Axios.delete(`${API_BASE_URL}/reviews/${id}`, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }


  static async getSharePhotos(params = {}) {
    try {
      const id = localStorage.getItem("userid")
      const response = await Axios.get(`${API_BASE_URL}/photos/${id}`, {
        params,
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async addSharePhoto(data: { packageId: string; drivelink: string; description: string; user: string | null; }) {
    const res = await Axios.post(`${API_BASE_URL}/photos`, data,
      {
        headers: this.getHeader(),
      }
    );

    return res.data;
  }


  static async getAllPhotoSubmission(keyword: string) {
    try {
      const response = await Axios.get(`${API_BASE_URL}/photos`, {
        params: { keyword },
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async getGallery(params = {}) {
    try {
      const response = await Axios.get(`${API_BASE_URL}/gallery`, {
        params,
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  // Dashboard API methods
  static async getBookings(params = {}) {
    try {
      const response = await Axios.get(`${API_BASE_URL}/bookings`, {
        params,
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  async updateBookingStatus(bookingId: any, status: any, internalNotes: any) {
    try {
      const response = await Axios.patch(
        `${API_BASE_URL}/bookings/${bookingId}/status`,
        { status, internalNotes },
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating booking status:", error);
      throw error;
    }
  }

  //update booking status
  static async resendBookingConfirmation(data: {
    bookingId: string;
    customerEmail: string;
    customerName: string;
    packageName: string;
    status: string;
    dateFrom: string;
    dateTo: string;
    travelersCount: number;
    specialRequests?: string;
  }) {
    try {
      const response = await Axios.post(
        `${API_BASE_URL}/bookings/send-booking-confirmation`,
        data,
        { headers: this.getHeader() }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }


  static async getDashboardStats() {
    try {
      const response = await Axios.get(`${API_BASE_URL}/dashboard/stats`, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async getUsers(params = {}) {
    try {
      const response = await Axios.get(`${API_BASE_URL}/users`, {
        params,
        headers: this.getHeader(),
      });

      // Handle both possible formats: { data: [...] } or [...]
      if (Array.isArray(response.data)) {
        return { data: response.data };
      } else if (response.data?.data) {
        return response.data;
      } else {
        return { data: [] };
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      throw error.response?.data || error.message;
    }
  }

  static async deleteUser(userId: string) {
    try {
      const response = await Axios.delete(`${API_BASE_URL}/users/${userId}`, {
        headers: this.getHeader(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async getSubscribers(params = {}) {
  try {
    const response = await Axios.get(`${API_BASE_URL}/subscribers`, {
      params,
      headers: this.getHeader(),
    });

    // Handle both possible formats
    if (Array.isArray(response.data)) {
      return { data: response.data };
    } else if (response.data?.data) {
      return response.data;
    } else {
      return { data: [] };
    }
  } catch (error: any) {
    console.error("Error fetching subscribers:", error);
    throw error.response?.data || error.message;
  }
}


}
