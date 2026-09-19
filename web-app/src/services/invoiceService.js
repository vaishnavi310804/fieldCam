import platformApi from "./api";

export const getInvoices = async (params) => {
  const response = await platformApi.get("/invoices", { params });
  return response.data;
};

export const getInvoiceStats = async () => {
  const response = await platformApi.get("/invoices/stats");
  return response.data;
};

export const getInvoiceOverview = async () => {
  const response = await platformApi.get("/invoices/overview");
  return response.data;
};

export const getInvoiceById = async (id) => {
  const response = await platformApi.get(`/invoices/${id}`);
  return response.data;
};

export const createInvoice = async (invoiceData) => {
  const response = await platformApi.post("/invoices", invoiceData);
  return response.data;
};

export const updateInvoice = async (id, invoiceData) => {
  const response = await platformApi.put(`/invoices/${id}`, invoiceData);
  return response.data;
};

export const updateInvoiceStatus = async (id, status) => {
  const response = await platformApi.patch(`/invoices/${id}/status`, { status });
  return response.data;
};
