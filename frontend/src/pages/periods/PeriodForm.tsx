import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, Calculator, Clock, Calendar } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { IPeriodCreate, IPeriodUpdate, IPeriod } from '../../types';
import { periodService, projectService } from '../../services';

interface IPeriodFormProps {
  isEdit?: boolean;
}

const PeriodForm: React.FC<IPeriodFormProps> = ({ isEdit = false }) => {
  const { id: projectId, periodId } = useParams<{ id: string; periodId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('');

  // Initialize form data with default values
  const [formData, setFormData] = useState<IPeriodCreate | IPeriodUpdate>({
    periodName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    volume: '',
    startTime: '',
    width: '',
    maxDepth: '',
    notes: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch project info to display project name
        if (projectId) {
          const project = await projectService.getProjectById(projectId);
          setProjectName(project.name);
        }

        // If editing, fetch period data
        if (isEdit && periodId) {
          const period = await periodService.getPeriodById(periodId);
          setFormData({
            periodName: period.periodName,
            startDate: period.startDate,
            endDate: period.endDate,
            volume: period.volume || '',
            startTime: period.startTime || '',
            width: period.width || '',
            maxDepth: period.maxDepth || '',
            notes: period.notes || ''
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error loading data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, periodId, isEdit]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      if (isEdit && periodId) {
        // Update existing period
        await periodService.updatePeriod(periodId, formData as IPeriodUpdate);
      } else {
        // Create new period
        await periodService.createPeriod(projectId, {
          ...formData as IPeriodCreate,
          projectId: Number(projectId)
        });
      }

      // Navigate back to project detail page
      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error('Error saving period:', err);
      setError('Error saving period. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with back button and save button */}
      <div className="flex justify-between items-center">
        <Link
          to={`/projects/${projectId}`}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Back to Project</span>
        </Link>

        <Button
          variant="success"
          leftIcon={<Save size={16} />}
          isLoading={isSaving}
          onClick={handleSubmit}
          type="submit"
        >
          {isEdit ? 'Update Period' : 'Save Period'}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Main form */}
      <Card
        title={isEdit ? 'Edit Period' : 'Create New Period'}
        icon={<Clock size={20} className="text-blue-600" />}
        isLoading={isLoading}
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <p className="text-gray-600 mb-4">
                Project: <span className="font-medium">{projectName}</span>
              </p>
            </div>

            {/* Basic period information */}
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Period Name *
                </label>
                <input
                  type="text"
                  name="periodName"
                  value={formData.periodName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Summer 2024"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Start Date *
                </label>
                <div className="flex items-center">
                  <Calendar size={18} className="text-gray-400 mr-2" />
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  End Date *
                </label>
                <div className="flex items-center">
                  <Calendar size={18} className="text-gray-400 mr-2" />
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Start Time (optional)
                </label>
                <div className="flex items-center">
                  <Clock size={18} className="text-gray-400 mr-2" />
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Water-related metrics */}
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Volume (m³/s) (optional)
                </label>
                <div className="flex items-center">
                  <Calculator size={18} className="text-gray-400 mr-2" />
                  <input
                    type="number"
                    step="0.01"
                    name="volume"
                    value={formData.volume}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 42.5"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Width (m) (optional)
                </label>
                <div className="flex items-center">
                  <Calculator size={18} className="text-gray-400 mr-2" />
                  <input
                    type="number"
                    step="0.01"
                    name="width"
                    value={formData.width}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 12.5"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Maximum Depth (cm) (optional)
                </label>
                <div className="flex items-center">
                  <Calculator size={18} className="text-gray-400 mr-2" />
                  <input
                    type="number"
                    step="0.1"
                    name="maxDepth"
                    value={formData.maxDepth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 185.5"
                  />
                </div>
              </div>
            </div>

            {/* Notes section - spans full width */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Notes (optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any observations or additional information about this period"
              />
            </div>
          </div>

          {/* Submit button for smaller screens */}
          <div className="mt-6 md:hidden">
            <Button
              variant="success"
              leftIcon={<Save size={16} />}
              isLoading={isSaving}
              type="submit"
              className="w-full"
            >
              {isEdit ? 'Update Period' : 'Save Period'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PeriodForm;
