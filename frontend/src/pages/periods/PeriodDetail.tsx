import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit, Trash, Download, MapPin, FileText, Calendar, Clock, Droplet, Ruler } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FileUploader from '../../components/common/FileUploader';
import { IPeriod, IProjectFile } from '../../types';
import { periodService, fileService, projectService } from '../../services';
import { useAuth } from '../../store/AuthContext';

const PeriodDetail: React.FC = () => {
  const { projectId, periodId } = useParams<{ projectId: string; periodId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [period, setPeriod] = useState<IPeriod | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [files, setFiles] = useState<IProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [fileCategory, setFileCategory] = useState<'map' | 'image' | 'document' | 'analysis'>('document');

  // User permission check
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    const fetchData = async () => {
      if (!periodId || !projectId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch period data
        const periodData = await periodService.getPeriodById(periodId);
        setPeriod(periodData);

        // Fetch project name
        const project = await projectService.getProjectById(projectId);
        setProjectName(project.name);

        // Fetch files associated with this period
        const filesResponse = await fileService.getFiles(1, 50, projectId, periodId);
        setFiles(filesResponse.items);
      } catch (err) {
        console.error('Error fetching period data:', err);
        setError('Error loading period data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [periodId, projectId]);

  // Handle file upload completion
  const handleUploadComplete = async (fileIds: string[]) => {
    try {
      // Refresh files list
      if (projectId && periodId) {
        const filesResponse = await fileService.getFiles(1, 50, projectId, periodId);
        setFiles(filesResponse.items);
      }
      setShowUploadModal(false);
    } catch (err) {
      console.error('Error refreshing files:', err);
    }
  };

  // Handle period deletion
  const handleDelete = async () => {
    if (!periodId) return;

    const confirmed = window.confirm('Are you sure you want to delete this period? This action cannot be undone.');
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      await periodService.deletePeriod(periodId);
      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error('Error deleting period:', err);
      setError('Error deleting period. Please try again.');
      setIsDeleting(false);
    }
  };

  // Filter files by category
  const mapFiles = files.filter(file => file.category === 'map');
  const imageFiles = files.filter(file => file.category === 'image');
  const documentFiles = files.filter(file => file.category === 'document');
  const analysisFiles = files.filter(file => file.category === 'analysis');

  // Render file card for each category
  const renderFileCard = (files: IProjectFile[], title: string, icon: React.ReactNode, category: 'map' | 'image' | 'document' | 'analysis') => (
    <Card
      title={title}
      icon={icon}
      actions={
        canEdit ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setFileCategory(category);
              setShowUploadModal(true);
            }}
          >
            Upload
          </Button>
        ) : undefined
      }
    >
      {files.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {files.map((file) => (
            <li key={file.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <FileText size={16} className="text-gray-500 mr-2" />
                <span className="text-blue-600 hover:underline cursor-pointer">
                  {file.name}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="text"
                  size="sm"
                  leftIcon={<Download size={16} />}
                  onClick={() => window.open(fileService.getDownloadUrl(file.id.toString()), '_blank')}
                >
                  Download
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No {title.toLowerCase()} files available for this period.</p>
      )}
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !period) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Period not found</h2>
        <p className="text-gray-600 mb-4">{error || "The period you're looking for doesn't exist or has been deleted."}</p>
        <Link to={`/projects/${projectId}`} className="text-blue-600 hover:underline">
          Return to Project
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation and actions */}
      <div className="flex justify-between items-center">
        <Link
          to={`/projects/${projectId}`}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Back to Project</span>
        </Link>

        {canEdit && (
          <div className="flex space-x-2">
            <Button
              variant="primary"
              leftIcon={<Edit size={16} />}
              onClick={() => navigate(`/projects/${projectId}/periods/${periodId}/edit`)}
            >
              Edit Period
            </Button>
            <Button
              variant="danger"
              leftIcon={<Trash size={16} />}
              isLoading={isDeleting}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Period information */}
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{period.periodName}</h2>
          <p className="text-gray-600">
            Project: <span className="font-medium">{projectName}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date information */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Time Information</h3>
            <div className="space-y-2">
              <div className="flex items-start">
                <Calendar size={18} className="text-gray-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Date Range</p>
                  <p className="font-medium">
                    {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {period.startTime && (
                <div className="flex items-start">
                  <Clock size={18} className="text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Start Time</p>
                    <p className="font-medium">{period.startTime}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Water metrics */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Water Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              {period.volume && (
                <div className="flex items-start">
                  <Droplet size={18} className="text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Volume</p>
                    <p className="font-medium">{period.volume} m³/s</p>
                  </div>
                </div>
              )}

              {period.width && (
                <div className="flex items-start">
                  <Ruler size={18} className="text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Width</p>
                    <p className="font-medium">{period.width} m</p>
                  </div>
                </div>
              )}

              {period.maxDepth && (
                <div className="flex items-start">
                  <Ruler size={18} className="text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Max Depth</p>
                    <p className="font-medium">{period.maxDepth} cm</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes section */}
        {period.notes && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-3">Notes</h3>
            <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
              <p className="text-gray-800">{period.notes}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Files section */}
      <div className="space-y-4">
        {renderFileCard(mapFiles, "Maps", <MapPin size={20} className="text-blue-600" />, 'map')}
        {renderFileCard(imageFiles, "Images", <FileText size={20} className="text-blue-600" />, 'image')}
        {renderFileCard(documentFiles, "Documents", <FileText size={20} className="text-blue-600" />, 'document')}
        {renderFileCard(analysisFiles, "Analysis", <FileText size={20} className="text-blue-600" />, 'analysis')}
      </div>

      {/* File upload modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Upload {fileCategory === 'map' ? 'Maps' :
                       fileCategory === 'image' ? 'Images' :
                       fileCategory === 'analysis' ? 'Analysis Files' : 'Documents'}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowUploadModal(false)}
              >
                <Trash size={20} />
              </button>
            </div>

            <FileUploader
              projectId={projectId || ''}
              periodId={periodId}
              category={fileCategory}
              onUploadComplete={handleUploadComplete}
              maxFiles={5}
              acceptedFileTypes={
                fileCategory === 'map' ? '.kml,.geojson,.json' :
                fileCategory === 'image' ? '.jpg,.jpeg,.png,.gif' :
                fileCategory === 'analysis' ? '.csv,.xlsx,.json' :
                '.pdf,.doc,.docx,.txt,.csv,.xlsx'
              }
            />

            <div className="mt-4 flex justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowUploadModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodDetail;
