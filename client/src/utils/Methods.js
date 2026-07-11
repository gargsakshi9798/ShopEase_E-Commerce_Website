import axiosClient from "./ApiInstance";

// axiosClient already has VITE_API_BASE_URL as baseURL — pass relative paths only.
// DO NOT prepend BASE here; doing so causes double-baseURL requests like:
//   http://localhost:5000/api/v1/http://localhost:5000/api/v1/customer/profile

export const GET = async (url, params = {}) => {
  const response = await axiosClient.get(url, { params });
  return response.data;
};

export const POST = async (url, data) => {
  const response = await axiosClient.post(url, data);
  return response.data;
};

export const PUT = async (url, data) => {
  const response = await axiosClient.put(url, data);
  return response.data;
};

export const PATCH = async (url, data) => {
  const response = await axiosClient.patch(url, data);
  return response.data;
};

export const DELETE = async (url) => {
  const response = await axiosClient.delete(url);
  return response.data;
};

export const POST_FORM = async (url, formData) => {
  const response = await axiosClient.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const PUT_FORM = async (url, formData) => {
  const response = await axiosClient.put(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const Select2Data = (data, labelKey = "name", valueKey = "_id") =>
  data.map((item) => ({ label: item[labelKey], value: item[valueKey] }));

export const getImgUrl = (path) => {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path;
  return `${import.meta.env.VITE_IMG_URL}${path}`;
};

export const formatCurrency = (amount, currency = "₹") =>
  `${currency}${Number(amount || 0).toLocaleString("en-IN")}`;

export const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

export const formatDateTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};
