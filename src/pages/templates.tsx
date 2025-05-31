import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { PlusIcon } from '@heroicons/react/24/outline';

// Import template JSON files directly
import contactForm from '../templates/contact-form.json';
import customerFeedback from '../templates/customer-feedback.json';
import eventRegistration from '../templates/event-registration.json';
import jobApplication from '../templates/job-application.json';
import newsletterSignup from '../templates/newsletter-signup.json';

interface Template {
  id: string;
  name: string;
  description: string;
  settings: {
    title: string;
    description: string;
    submitButtonText: string;
    successMessage: string;
  };
  fields: Array<{
    id: string;
    type: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
    checkboxOptions?: string[];
  }>;
}

// Define templates array
const templates: Template[] = [
  {
    id: 'contact-form',
    name: contactForm.settings.title,
    description: contactForm.settings.description,
    ...contactForm
  },
  {
    id: 'customer-feedback',
    name: customerFeedback.settings.title,
    description: customerFeedback.settings.description,
    ...customerFeedback
  },
  {
    id: 'event-registration',
    name: eventRegistration.settings.title,
    description: eventRegistration.settings.description,
    ...eventRegistration
  },
  {
    id: 'job-application',
    name: jobApplication.settings.title,
    description: jobApplication.settings.description,
    ...jobApplication
  },
  {
    id: 'newsletter-signup',
    name: newsletterSignup.settings.title,
    description: newsletterSignup.settings.description,
    ...newsletterSignup
  }
];

export default function Templates() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    // Simulate loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Form Templates
            </h1>
            <p className="mt-3 text-xl text-gray-500 dark:text-gray-300 sm:mt-4">
              Choose a template to get started or create your own form from scratch
            </p>
          </div>

          {loading ? (
            <div className="mt-12 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="mt-12 text-center text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : (
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/builder"
                className="relative block p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors group"
              >
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                    <PlusIcon />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    Create New Form
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Start from scratch with a blank form
                  </p>
                </div>
              </Link>

              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  className="relative block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700"
                >
                  <Link to={`/builder?template=${template.id}`} className="block">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {template.description}
                    </p>
                    <div className="mt-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        Use Template
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 