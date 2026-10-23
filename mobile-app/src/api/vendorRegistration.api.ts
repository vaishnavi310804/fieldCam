import { platformClient } from "./platformClient";

export interface VendorRegistrationPayload {
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  location: string;
  services: string[];
  description?: string;
}

export interface VendorRegistrationData {
  _id: string;
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  location: string;
  services: string[];
  description?: string;
  status: string;
  createdAt: string;
}

export interface VendorRegistrationResponse {
  success: boolean;
  message: string;
  data?: VendorRegistrationData;
}

/**
 * Submits a prospective vendor registration request to platform-service.
 * Public unauthenticated endpoint.
 */
export const submitVendorRegistration = async (
  payload: VendorRegistrationPayload
): Promise<VendorRegistrationResponse> => {
  const response = await platformClient.post<VendorRegistrationResponse>(
    "/vendor-registrations",
    payload
  );
  return response.data;
};
