import { json, type ActionFunctionArgs } from "@remix-run/node";
import api from "../utils/axios";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.json();
    
    const response = await api.post('/forms', formData, {
      headers: {
        'Accept': 'application/json',
      },
      withCredentials: true // Forward cookies for authentication
    });

    return json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Form creation error:', error);
    return json(
      { 
        success: false, 
        message: error.response?.data?.message || 'An error occurred while creating the form',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: error.response?.status || 500 }
    );
  }
} 