import platformApi from "./api";

export const getSupportTickets = async (params) => {
  const response = await platformApi.get("/support/tickets", { params });
  return response.data;
};

export const getSupportStats = async () => {
  const response = await platformApi.get("/support/stats");
  return response.data;
};

export const getSupportTicketById = async (id) => {
  const response = await platformApi.get(`/support/tickets/${id}`);
  return response.data;
};

export const createSupportTicket = async (ticketData) => {
  const response = await platformApi.post("/support/tickets", ticketData);
  return response.data;
};

export const updateSupportTicket = async (id, ticketData) => {
  const response = await platformApi.put(`/support/tickets/${id}`, ticketData);
  return response.data;
};

export const updateSupportTicketStatus = async (id, status) => {
  const response = await platformApi.patch(`/support/tickets/${id}/status`, { status });
  return response.data;
};

// Aliases for compatibility
export const getTickets = getSupportTickets;
export const getTicketStats = getSupportStats;
export const getTicketById = getSupportTicketById;
export const createTicket = createSupportTicket;
export const updateTicket = updateSupportTicket;
export const updateTicketStatus = updateSupportTicketStatus;
