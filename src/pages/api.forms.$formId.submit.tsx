import { json, type ActionFunctionArgs } from "@remix-run/node";
import api from "../utils/axios";

export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const formId = params.formId;
    if (!formId) {
      return json({ success: false, message: "Form ID is required" }, { status: 400 });
    }

    const formData = await request.json();
    
    const response = await api.post(`/forms/${formId}/submit`, formData, {
      headers: {
        'Accept': 'application/json',
      }
    });

    return json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Form submission error:', error);
    return json(
      { 
        success: false, 
        message: error.response?.data?.message || 'An error occurred while submitting the form',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: error.response?.status || 500 }
    );
  }
} 