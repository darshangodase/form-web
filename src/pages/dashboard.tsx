import { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import type { RootState } from '@/store';
import api from '../utils/axios';

// Use the proxy URL instead of direct API URL
const API_BASE_URL = '/api';

interface Form {
  formId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  submissions: FormSubmission[];
}

interface FormSubmission {
  _id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: string;
}


const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const fetchWithRetry = async (url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

export default function Dashboard() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForms = async () => {
      if (!user?.id) {
        navigate('/auth/login');
        setError('Please log in to view your forms');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch forms created by the user
        const formsResponse = await api.get(`/forms/user/${user.id}`);
        
        if (!formsResponse.data.success) {
          throw new Error(formsResponse.data.message || 'Failed to fetch forms');
        }

        // For each form, fetch its submissions
        const formsWithSubmissions = await Promise.all(
          formsResponse.data.forms.map(async (form: Form) => {
            try {
              const submissionsResponse = await api.get(`/forms/${form.formId}/submissions`);
              
              if (!submissionsResponse.data.success) {
                console.warn(`Failed to fetch submissions for form ${form.formId}:`, submissionsResponse.data.message);
                return {
                  ...form,
                  submissions: []
                };
              }

              return {
                ...form,
                submissions: submissionsResponse.data.submissions || []
              };
            } catch (submissionError: any) {
              console.warn(`Error fetching submissions for form ${form.formId}:`, submissionError);
              return {
                ...form,
                submissions: []
              };
            }
          })
        );
        
        setForms(formsWithSubmissions);
      } catch (err: any) {
        console.error('Error fetching forms:', err);
        let errorMessage = 'Failed to load forms. Please try again.';
        
        if (err.response) {
          if (err.response.status === 401) {
            errorMessage = 'Your session has expired. Please log in again.';
            navigate('/auth/login');
          } else {
            errorMessage = err.response.data?.message || err.message;
          }
        } else if (err.request) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        setForms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForms();
  }, [user?.id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Forms</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                View and manage your forms and their submissions
              </p>
            </div>
            <Link
              to="/builder"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New Form
            </Link>
          </div>

          {forms.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No forms yet</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Get started by creating a new form
              </p>
              <div className="mt-6">
                <Link
                  to="/builder"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create New Form
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {forms.map((form) => (
                <div
                  key={form.formId}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                          {form.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {form.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {form.submissions.length} responses
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(form.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex space-x-3">
                      <Link
                        to={`/form/${form.formId}`}
                        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        View Form
                      </Link>
                      <Link
                        to={`/response/${form.formId}`}
                        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        View Responses
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 