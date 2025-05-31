import api from '@/utils/axios';

export interface FormData {
  formName: string;
  formDescription: string;
  fields: Array<{
    id: string;
    type: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
    checkboxOptions?: string[];
  }>;
  settings: {
    submitButtonText: string;
    successMessage: string;
  };
}

export interface FormSubmission {
  formId: string;
  data: Record<string, any>;
}

export const formsApi = {
  // Create a new form
  createForm: async (formData: FormData) => {
    const response = await api.post('/forms', formData);
    return response.data;
  },

  // Submit a form response
  submitForm: async (formId: string, submissionData: Record<string, any>) => {
    const response = await api.post(`/forms/${formId}/submit`, submissionData);
    return response.data;
  },

  // Get all forms for the current user
  getForms: async () => {
    const response = await api.get('/forms');
    return response.data;
  },

  // Get a specific form by ID
  getForm: async (formId: string) => {
    const response = await api.get(`/forms/${formId}`);
    return response.data;
  },

  // Get form submissions
  getFormSubmissions: async (formId: string) => {
    const response = await api.get(`/forms/${formId}/submissions`);
    return response.data;
  },

  // Delete a form
  deleteForm: async (formId: string) => {
    const response = await api.delete(`/forms/${formId}`);
    return response.data;
  },

  // Update a form
  updateForm: async (formId: string, formData: Partial<FormData>) => {
    const response = await api.put(`/forms/${formId}`, formData);
    return response.data;
  }
}; 