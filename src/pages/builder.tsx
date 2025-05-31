import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import FormBuilder from '@/components/builder/FormBuilder';
import Navbar from '@/components/Navbar';
import { useAppSelector } from '@/hooks';

// Import template JSON files
import contactForm from '../templates/contact-form.json';
import customerFeedback from '../templates/customer-feedback.json';
import eventRegistration from '../templates/event-registration.json';
import jobApplication from '../templates/job-application.json';
import newsletterSignup from '../templates/newsletter-signup.json';

// Template mapping
const templates = {
  'contact-form': contactForm,
  'customer-feedback': customerFeedback,
  'event-registration': eventRegistration,
  'job-application': jobApplication,
  'newsletter-signup': newsletterSignup
};

export default function Builder() {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("template");
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(!!templateId);
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    const loadTemplate = () => {
      if (!templateId) {
        console.log('No template ID provided, starting with empty form');
        setLoading(false);
        return;
      }

      try {
        console.log('Loading template:', templateId);
        // Load template from local templates
        const selectedTemplate = templates[templateId as keyof typeof templates];
        console.log('Selected template:', selectedTemplate);
        
        if (selectedTemplate) {
          console.log('Setting template with fields:', selectedTemplate.fields);
          setTemplate(selectedTemplate);
        } else {
          console.error(`Template not found: ${templateId}`);
        }
      } catch (error) {
        console.error("Error loading template:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [templateId, isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading template...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering FormBuilder with template:', template);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <div className="pt-16">
        <FormBuilder initialTemplate={template} templateId={templateId} />
      </div>
    </div>
  );
} 