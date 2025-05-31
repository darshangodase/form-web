import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface FormField {
  id: string;
  type: string;
  label: string;
}

interface Form {
  formId: string;
  title: string;
  description: string;
  fields: FormField[];
}

interface FormSubmission {
  _id: string;
  formId: string;
  data: Record<string, string>;
  submittedAt: string;
}

export default function FormResponses() {
  const { formId } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch form details (needed for field labels)
        const formResponse = await fetch(`/api/forms/${formId}`);
        if (!formResponse.ok) {
          throw new Error('Failed to fetch form details');
        }
        const formData = await formResponse.json();
        
        // Fetch form submissions
        const submissionsResponse = await fetch(`/api/forms/${formId}/submissions`);
        if (!submissionsResponse.ok) {
          throw new Error('Failed to fetch submissions');
        }
        const submissionsData = await submissionsResponse.json();
        
        if (!formData.success || !submissionsData.success) {
          throw new Error('API returned error');
        }
        
        setForm(formData.form);
        setSubmissions(submissionsData.submissions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setLoading(false);
      }
    };

    if (formId) {
      fetchData();
    }
  }, [formId]);

  const exportToExcel = () => {
    if (!form || !submissions.length) return;

    // Get all unique field IDs from submissions
    const allFieldIds = Array.from(
      new Set(submissions.flatMap(sub => Object.keys(sub.data)))
    );

    // Get field labels from form fields
    const fieldLabels = allFieldIds.reduce((acc, fieldId) => {
      const field = form.fields.find(f => f.id === fieldId);
      acc[fieldId] = field?.label || fieldId;
      return acc;
    }, {} as Record<string, string>);

    // Prepare headers
    const headers = [
      'Submitted At',
      ...allFieldIds.map(fieldId => fieldLabels[fieldId])
    ];

    // Prepare data rows
    const data = submissions.map(submission => [
      new Date(submission.submittedAt).toLocaleString(),
      ...allFieldIds.map(fieldId => submission.data[fieldId] || '-')
    ]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Set column widths
    const colWidths = headers.map(header => ({
      wch: Math.max(header.length, 20) // Minimum width of 20 characters
    }));
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Form Responses');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    // Create download link
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${form.title || 'Form'}_Responses_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-[90vh] pt-16 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500"></div>
          <span className="text-gray-600 dark:text-gray-300 font-medium">Loading responses...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[90vh] pt-16 bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-100 dark:border-red-900">
          <div className="p-6">
            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400 mb-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-semibold">Error</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-[90vh] pt-16 bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-yellow-100 dark:border-yellow-900">
          <div className="p-6">
            <div className="flex items-center space-x-3 text-yellow-600 dark:text-yellow-400 mb-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-semibold">Form Not Found</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">The requested form could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get all unique field IDs from submissions
  const allFieldIds = Array.from(
    new Set(submissions.flatMap(sub => Object.keys(sub.data)))
  );

  // Get field labels from form fields
  const fieldLabels = allFieldIds.reduce((acc, fieldId) => {
    const field = form.fields.find(f => f.id === fieldId);
    acc[fieldId] = field?.label || fieldId;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="min-h-[90vh] pt-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Form Responses
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'} received
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={exportToExcel}
                  disabled={!submissions.length}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg 
                    className="w-4 h-4 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                  Export to Excel
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          {submissions.length === 0 ? (
            <div className="p-12 text-center">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No submissions</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by sharing your form.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      Submitted At
                    </th>
                    {allFieldIds.map(fieldId => (
                      <th 
                        key={fieldId}
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                      >
                        {fieldLabels[fieldId]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {submissions.map((submission, index) => (
                    <tr 
                      key={submission._id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        index % 2 === 0 
                          ? 'bg-white dark:bg-gray-800' 
                          : 'bg-gray-50 dark:bg-gray-900'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </td>
                      {allFieldIds.map(fieldId => (
                        <td 
                          key={fieldId} 
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                        >
                          {submission.data[fieldId] || (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 