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

export const reviewInvoice = async (id, payload) => {
  const response = await platformApi.post(`/invoices/${id}/review`, payload);
  return response.data;
};

export const sendInvoice = async (id, payload) => {
  const response = await platformApi.post(`/invoices/${id}/send`, payload);
  return response.data;
};

export const recordInvoicePayment = async (id, payload) => {
  const response = await platformApi.post(`/invoices/${id}/payment`, payload);
  return response.data;
};

export const submitInvoice = async (id) => {
  const response = await platformApi.post(`/invoices/${id}/submit`);
  return response.data;
};

export const getInvoicePreview = async (projectId) => {
  const response = await platformApi.get(`/invoices/preview/${projectId}`);
  return response.data;
};

export const downloadInvoicePdf = async (id, invoiceNumber) => {
  try {
    const response = await platformApi.get(`/invoices/${id}/pdf`, {
      responseType: "blob",
    });

    // Detect if error response was serialized as json blob
    if (response.data && response.data.type === "application/json") {
      const text = await response.data.text();
      let errorMsg = "Failed to download invoice PDF";
      try {
        const parsed = JSON.parse(text);
        errorMsg = parsed.message || errorMsg;
      } catch {
        // fallback
      }
      throw new Error(errorMsg);
    }

    const file = new Blob([response.data], { type: "application/pdf" });
    const fileURL = window.URL.createObjectURL(file);
    const downloadLink = document.createElement("a");
    downloadLink.href = fileURL;
    downloadLink.download = `Invoice_${invoiceNumber || id}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(fileURL);
    return true;
  } catch (error) {
    if (error.response && error.response.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const parsed = JSON.parse(text);
        throw new Error(parsed.message || "Failed to download invoice PDF", {
          cause: error,
        });
      } catch (parseErr) {
        if (parseErr.message && parseErr.message !== "Failed to download invoice PDF") {
          throw parseErr;
        }
      }
    }
    throw error;
  }
};
