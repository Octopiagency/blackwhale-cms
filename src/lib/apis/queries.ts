/* eslint-disable @typescript-eslint/no-explicit-any */
import { axiosPrivate } from "../axios-private";

export const getAdmins = async ({ params = {} }: { params: any }) => {
  const response = await axiosPrivate.get(`/admin/admins${params}`);
  if (response.data.code !== 200)
    throw new Error(response.data ?? "Request Failed.");
  return response.data.results;
};

export const getSingleAdmin = async (id: string) => {
  const response = await axiosPrivate.get(`/admin/admins/${id}`);
  if (response.data.code !== 200)
    throw new Error(response.data ?? "Request Failed.");
  return response.data.results;
};

export const addAdmin = async (values: any) => {
  const response = await axiosPrivate.post(`/admin/admins`, values);

  if (response.data.code !== 200)
    throw new Error(response.data ?? "Request Failed.");
  return response.data.results;
};

export const updateAdmin = async (values: any) => {
  const response = await axiosPrivate.put(`/admin/admins/update`, values);
  if (response.data.code !== 200) {
    throw new Error(response.data.message || "Request Failed.");
  }
  return response.data;
};

export const deleteAdmin = async (id: string) => {
  const response = await axiosPrivate.delete(`/admin/admins/delete/${id}`);
  if (response.data.code !== 200) {
    throw new Error(response.data.message || "Request Failed.");
  }
  return response.data;
};

export const getAdminTypes = async ({ params = {} }: { params: any }) => {
  const query = params?.params ? `${params.params}` : "";
  const response = await axiosPrivate.get(`/admin/admin-type${query}`);
  if (response.data.code !== 200)
    throw new Error(response.data ?? "Request Failed.");
  return response.data.results;
};

export const getFunctionsAll = async () => {
  const response = await axiosPrivate.get(`/admin/function`);
  if (response.data.code !== 200)
    throw new Error(response.data ?? "Request Failed.");
  return response.data.results;
};

export const addPrivileges = async (values: any) => {
  const response = await axiosPrivate.post(`/admin/admin-type`, values);

  if (response.data.code !== 200)
    throw new Error(response.data ?? "Request Failed.");
  return response.data.results;
};

export const editPrivileges = async (values: any, id: string) => {
  const payload = {
    name: values.name,
    type_id: id,
    privileges: values.privileges,
  };
  const response = await axiosPrivate.put(`/admin/admin-type/update`, payload);
  if (response.data.code !== 200)
    throw new Error(response.data ?? "Request Failed.");
  return response.data.results;
};

export const deleteAdminType = async (id: string) => {
  const response = await axiosPrivate.delete(`/admin/admin-type/delete/${id}`);
  if (response.data.code !== 200) {
    throw new Error(response.data.message || "Request Failed.");
  }
  return response.data;
};

export const getCategories = async ({ params = {} }: { params: any }) => {
  const response = await axiosPrivate.get(`/admin/category${params}`);
  if (response.data.code !== 200)
    throw new Error(response.data ?? "Request Failed.");
  return response.data.results;
};

export const addCategory = async (values: any) => {
  const response = await axiosPrivate.post(`/admin/category`, values);

  if (response.data.code !== 200)
    throw new Error(response.data ?? "Request Failed.");
  return response.data.results;
};

export const updateCategory = async (values: any) => {
  const response = await axiosPrivate.put(`/admin/category/update`, values);
  if (response.data.code !== 200) {
    throw new Error(response.data.message || "Request Failed.");
  }
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await axiosPrivate.delete(`/admin/category/delete/${id}`);
  if (response.data.code !== 200) {
    throw new Error(response.data.message || "Request Failed.");
  }
  return response.data;
};

export const getStores = async ({ params = {} }: { params: any }) => {
  const response = await axiosPrivate.get(`/admin/store${params}`);
  if (response.data.code !== 200)
    throw new Error(response.data ?? "Request Failed.");
  return response.data.results;
};

export const getSingleStore = async (id: string) => {
  const response = await axiosPrivate.get(`/admin/store/${id}`);
  if (response.data.code !== 200)
    throw new Error(response.data ?? "Request Failed.");
  return response.data.results;
};

export const addStore = async (values: any) => {
  const response = await axiosPrivate.post(`/admin/store`, values);

  if (response.data.code !== 200)
    throw new Error(response.data ?? "Request Failed.");
  return response.data.results;
};

export const updateStore = async (values: any) => {
  const response = await axiosPrivate.put(`/admin/store/update`, values);
  if (response.data.code !== 200) {
    throw new Error(response.data.message || "Request Failed.");
  }
  return response.data;
};

export const deleteStore = async (id: string) => {
  const response = await axiosPrivate.delete(`/admin/store/delete/${id}`);
  if (response.data.code !== 200) {
    throw new Error(response.data.message || "Request Failed.");
  }
  return response.data;
};

export const getProducts = async ({ params = {} }: { params: any }) => {
  const response = await axiosPrivate.get(`/admin/product${params}`);
  if (response.data.code !== 200)
    throw new Error(response.data ?? "Request Failed.");
  return response.data.results;
};

export const getSingleProduct = async (id: string) => {
  const response = await axiosPrivate.get(`/admin/product/${id}`);
  if (response.data.code !== 200)
    throw new Error(response.data ?? "Request Failed.");
  return response.data.results;
};

export const addProduct = async (values: any) => {
  const response = await axiosPrivate.post(`/admin/product`, values);

  if (response.data.code !== 200)
    throw new Error(response.data ?? "Request Failed.");
  return response.data.results;
};

export const updateProduct = async (values: any) => {
  const response = await axiosPrivate.put(`/admin/product/update`, values);
  if (response.data.code !== 200) {
    throw new Error(response.data.message || "Request Failed.");
  }
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await axiosPrivate.delete(`/admin/product/delete/${id}`);
  if (response.data.code !== 200) {
    throw new Error(response.data.message || "Request Failed.");
  }
  return response.data;
};
