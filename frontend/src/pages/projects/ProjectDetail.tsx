import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FileText, Clock, Map, ChevronLeft, Download, Users, PlusCircle, Calendar, BarChart, Eye, Edit } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { IProject, IPeriod, ProjectStatus, UserRole } from '../../types';
import { useAuth } from '../../store/AuthContext';
import { projectService, periodService, fileService } from '../../services';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<IProject | null>(null);
  const [periods, setPeriods] = useState<IPeriod[]>([]);
  const [currentPeriodData, setCurrentPeriodData] = useState<IPeriod | null>(null);

  // Get authenticated user information
  const { user } = useAuth();
  const userRole = user?.role as UserRole;

  // Determine if display admin/manager options
  const hasAdminAccess = userRole === "admin" || userRole === "manager";

  // Load project
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const projectData = await projectService.getProjectById(id);
        setProject(projectData);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Could not load project information.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Load periods
  useEffect(() => {
    const fetchPeriods = async () => {
      if (!id) return;

      setIsLoadingPeriods(true);

      try {
        const response = await periodService.getProjectPeriods(id);
        setPeriods(response.items);

        // Set the first period as selected by default
        if (response.items.length > 0 && !selectedPeriod) {
          setSelectedPeriod(response.items[0].id.toString());
        }
      } catch (err) {
        console.error("Error fetching periods:", err);
        // We don't show error to not overload the interface
      } finally {
        setIsLoadingPeriods(false);
      }
    };

    fetchPeriods();
  }, [id, selectedPeriod]);

  // Load data for the selected period
  useEffect(() => {
    const fetchPeriodDetails = async () => {
      if (!selectedPeriod) {
        setCurrentPeriodData(null);
        return;
      }

      try {
        const periodData = await periodService.getPeriodById(selectedPeriod);
        setCurrentPeriodData(periodData);
      } catch (err) {
        console.error("Error fetching period details:", err);
        setCurrentPeriodData(null);
      }
    };

    fetchPeriodDetails();
  }, [selectedPeriod]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Project not found</h2>
        <p className="text-gray-600 mb-4">{error || "The project you're looking for doesn't exist or has been deleted."}</p>
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation bar with actions */}
      <div className="flex justify-between items-center">
        <Link
          to="/projects"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Back</span>
        </Link>

        <div className="space-x-2">
          <Button
            variant="secondary"
            leftIcon={<Download size={16} />}
          >
            Generate PDF
          </Button>
        </div>
      </div>

      {/* General information panel */}
      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{project.name}</h2>
            <p className="text-gray-600 mb-4">{project.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-gray-700">General Information</h3>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-start">
                    <span className="font-medium text-gray-600 mr-2">Location:</span>
                    <span>{project.location}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-gray-600 mr-2">Type:</span>
                    <span>{project.type}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-gray-600 mr-2">Responsible:</span>
                    <span>{project.owner}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">Status and Dates</h3>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-center">
                    <span className="font-medium text-gray-600 mr-2">Status:</span>
                    <StatusBadge status={project.status} />
                  </li>
                  <li className="flex items-center">
                    <span className="font-medium text-gray-600 mr-2">Start date:</span>
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1 text-gray-400" />
                      {project.startDate}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="font-medium text-gray-600 mr-2">Last update:</span>
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1 text-gray-400" />
                      {project.lastUpdate || project.updatedAt}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">Team</h3>
              <div className="flex flex-wrap mt-2">
                {project.team && project.team.length > 0 ? (
                  project.team.map((member, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm mr-2 mb-2">
                      {member.name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic">No members assigned to this project.</span>
                )}
              </div>
            </div>
          </div>

          {/* Period selector */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <Clock size={18} className="mr-2" />
              Select Period
            </h3>

            <div className="mb-4">
              {isLoadingPeriods ? (
                <div className="py-2 flex justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              ) : periods.length > 0 ? (
                <select
                  className="w-full p-2 border border-gray-300 rounded bg-white"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  {periods.map(period => (
                    <option key={period.id} value={period.id.toString()}>
                      {period.periodName}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-gray-500 text-sm italic">No periods available.</div>
              )}
            </div>

            {/* Period action buttons */}
            <div className="space-y-2">
              {hasAdminAccess && (
                <Link to={`/projects/${id}/periods/new`}>
                  <Button
                    variant="primary"
                    leftIcon={<PlusCircle size={16} />}
                    className="w-full"
                  >
                    Add New Period
                  </Button>
                </Link>
                // <Button
                //   variant="primary"
                //   className="w-full"
                //   leftIcon={<PlusCircle size={16} />}
                //   as={Link}
                //   to={`/projects/${id}/periods/new`}
                // >
                //   Add New Period
                // </Button>
              )}

              {selectedPeriod && (
                <>
                  <Button
                    variant="secondary"
                    className="w-full"
                    leftIcon={<Eye size={16} />}
                    as={Link}
                    to={`/projects/${id}/periods/${selectedPeriod}`}
                  >
                    View Period Details
                  </Button>

                  {hasAdminAccess && (
                    <Button
                      variant="secondary"
                      className="w-full"
                      leftIcon={<Edit size={16} />}
                      as={Link}
                      to={`/projects/${id}/periods/${selectedPeriod}/edit`}
                    >
                      Edit Period
                    </Button>
                  )}

                  <Button
                    variant="secondary"
                    className="w-full"
                    leftIcon={<BarChart size={16} />}
                    as={Link}
                    to={`/projects/${id}/periods/${selectedPeriod}/visualization`}
                  >
                    View Analysis
                  </Button>
                </>
              )}
            </div>

            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Period Information</h4>
              {currentPeriodData ? (
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Volume:</span>
                    <span className="font-medium">{currentPeriodData.volume || 'N/A'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Start time:</span>
                    <span className="font-medium">{currentPeriodData.startTime || 'N/A'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Width:</span>
                    <span className="font-medium">{currentPeriodData.width || 'N/A'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Max depth:</span>
                    <span className="font-medium">{currentPeriodData.maxDepth || 'N/A'}</span>
                  </li>
                </ul>
              ) : (
                <p className="text-gray-500 text-sm italic">No data available for this period.</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Map */}
      <Card
        title={`Route Map - ${selectedPeriod ? periods.find(p => p.id.toString() === selectedPeriod)?.periodName || 'No period selected' : 'No period selected'}`}
        icon={<Map size={18} className="mr-2" />}
      >
        <div className="bg-gray-100 p-4 rounded-md">
          <div className="relative h-96 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
            <p className="text-gray-500">Map preview not available</p>

            {/* Markers (visual only) */}
            <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
              I
            </div>
            <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
              F
            </div>

            {/* Section info */}
            <div className="absolute right-4 top-4 bg-white p-3 rounded shadow-md text-sm">
              <h4 className="font-bold text-gray-800">Section 31</h4>
              <p className="text-gray-600 mb-1">659806</p>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Length:</span>
                <span className="font-medium">2.4 km</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Visualizations and analysis */}
      <Card
        title="Visualizations and Analysis"
        icon={<FileText size={18} className="mr-2" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Analysis charts (placeholders) */}
          <div className="bg-gray-50 rounded border border-gray-200 overflow-hidden">
            <div className="p-3 bg-gray-100 border-b border-gray-200">
              <h4 className="font-medium text-gray-700">Heat Map</h4>
            </div>
            <div className="p-4">
              <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                <p className="text-gray-500 text-sm">Preview not available</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded border border-gray-200 overflow-hidden">
            <div className="p-3 bg-gray-100 border-b border-gray-200">
              <h4 className="font-medium text-gray-700">Depth Analysis</h4>
            </div>
            <div className="p-4">
              <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                <p className="text-gray-500 text-sm">Preview not available</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded border border-gray-200 overflow-hidden">
            <div className="p-3 bg-gray-100 border-b border-gray-200">
              <h4 className="font-medium text-gray-700">Water Flow</h4>
            </div>
            <div className="p-4">
              <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                <p className="text-gray-500 text-sm">Preview not available</p>
              </div>
            </div>
          </div>
        </div>

        {selectedPeriod && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="primary"
              leftIcon={<BarChart size={16} />}
              as={Link}
              to={`/projects/${id}/periods/${selectedPeriod}/visualization`}
            >
              View Complete Analysis Dashboard
            </Button>
          </div>
        )}
      </Card>

      {/* Panel for notes and observations */}
      <Card title="Notes and Observations">
        {currentPeriodData?.notes ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-700">{currentPeriodData.notes}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">No notes or observations for this period.</p>
        )}

        {hasAdminAccess && selectedPeriod && (
          <div className="mt-4">
            <Button
              variant="secondary"
              leftIcon={<Edit size={16} />}
              as={Link}
              to={`/projects/${id}/periods/${selectedPeriod}/edit`}
            >
              Edit Observations
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProjectDetail;
