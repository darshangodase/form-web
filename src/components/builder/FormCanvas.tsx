import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import FormField from "./FormField";
import FormValidation from "./FormValidation";

interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];  // For dropdown fields
  checkboxOptions?: string[];  // For checkbox fields
}

interface FormSettings {
  submitButtonText: string;
  successMessage: string;
}

interface FormCanvasProps {
  fields: FormField[];
  onDrop: (fieldType: string) => void;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onDuplicate: (id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  formName?: string;
  formDescription?: string;
  onFormDetailsUpdate?: (updates: { name?: string; description?: string }) => void;
}



export default function FormCanvas({
  fields,
  onDrop,
  onUpdate,
  onDelete,
  onMove,
  onDuplicate,
  onDragOver,
  formName = "Untitled Form",
  formDescription = "",
  onFormDetailsUpdate,
}: FormCanvasProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [dragOverFieldId, setDragOverFieldId] = useState<string | null>(null);

  // Mock settings for preview
  const previewSettings: FormSettings = {
    submitButtonText: "Submit",
    successMessage: "Thank you for your submission!",
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
    onDragOver?.(e);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter((prev) => prev + 1);
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter((prev) => prev - 1);
    if (dragCounter <= 1) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(0);
    setIsDraggingOver(false);
    const fieldType = e.dataTransfer.getData("fieldType");
    if (fieldType) {
      onDrop(fieldType);
    }
  };

  const handleFieldDragStart = (e: React.DragEvent, fieldId: string) => {
    e.stopPropagation();
    setDraggedFieldId(fieldId);
    e.dataTransfer.setData('fieldId', fieldId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleFieldDragOver = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedFieldId === fieldId) return;
    setDragOverFieldId(fieldId);
  };

  const handleFieldDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFieldId(null);
  };

  const handleFieldDrop = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedFieldId || draggedFieldId === fieldId) {
      setDraggedFieldId(null);
      setDragOverFieldId(null);
      return;
    }

    const draggedIndex = fields.findIndex(f => f.id === draggedFieldId);
    const targetIndex = fields.findIndex(f => f.id === fieldId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    // Use the existing onMove function to move the field
    if (draggedIndex < targetIndex) {
      // Move down until we reach the target
      for (let i = draggedIndex; i < targetIndex; i++) {
        onMove(draggedFieldId, "down");
      }
    } else {
      // Move up until we reach the target
      for (let i = draggedIndex; i > targetIndex; i--) {
        onMove(draggedFieldId, "up");
      }
    }

    setDraggedFieldId(null);
    setDragOverFieldId(null);
  };

  const handleFieldDragEnd = () => {
    setDraggedFieldId(null);
    setDragOverFieldId(null);
  };

  return (
    <div className="flex h-full">
      {/* Form Builder Section */}
      <div 
        className={`flex-1 min-h-full ${
          isDraggingOver 
            ? "bg-blue-50 dark:bg-blue-900/20" 
            : "bg-gray-100 dark:bg-gray-800"
        } transition-colors overflow-auto`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="mb-8 text-center">
              <input
                type="text"
                value={formName}
                onChange={(e) => onFormDetailsUpdate?.({ name: e.target.value })}
                className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                placeholder="Untitled Form"
              />
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => onFormDetailsUpdate?.({ description: e.target.value })}
                className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-center"
                  placeholder="Add a description for your form"
                />
            </div>

            {fields.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div
                  className={`border-2 border-dashed rounded-lg p-8 transition-colors duration-200 ${
                    isDraggingOver 
                      ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <p
                    className={`text-lg transition-colors duration-200 ${
                      isDraggingOver 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {isDraggingOver
                      ? "Drop to add field"
                      : "Drag and drop form fields here to start building your form"}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Available fields: Text Input, Text Area, Dropdown, Checkbox, Date Picker, Email Input, Phone Input
                  </p>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      draggable
                      onDragStart={(e) => handleFieldDragStart(e, field.id)}
                      onDragOver={(e) => handleFieldDragOver(e, field.id)}
                      onDragLeave={handleFieldDragLeave}
                      onDrop={(e) => handleFieldDrop(e, field.id)}
                      onDragEnd={handleFieldDragEnd}
                      className={`relative ${
                        dragOverFieldId === field.id
                          ? 'border-2 border-blue-500 dark:border-blue-400'
                          : ''
                      }`}
                    >
                      <FormField
                        field={field}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onMove={onMove}
                        onDuplicate={onDuplicate}
                        isFirst={index === 0}
                        isLast={index === fields.length - 1}
                      />
                    </div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="w-1/2 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10 text-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Live Preview</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">See how your form will look to users</p>
        </div>
        <div className="p-6 flex justify-center">
          <div className="w-full max-w-2xl">
            <FormValidation
              fields={fields}
              settings={previewSettings}
              formName={formName}
              formDescription={formDescription}
              onSubmit={async (data) => {
                console.log('Preview form submitted:', data);
                return Promise.resolve();
              }}
              onValidationError={(errors) => console.log('Preview validation errors:', errors)}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 