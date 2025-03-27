import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart as BarChartIcon, PieChart as PieChartIcon, LineChart as LineChartIcon, Calendar, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { IPeriod, IPeriodAnalysis } from '../../types';
import { periodService, fileService } from '../../services';

// Mock data for visualizations (to be replaced with real data later)
const mockAnalysisData = {
  dataPoints: [
    { position: 'P1', depth: 125, flow: 20.4, temperature: 18.2, timestamp: '2023-06-01T08:00:00' },
    { position: 'P2', depth: 145, flow: 22.5, temperature: 17.9, timestamp: '2023-06-01T08:30:00' },
    { position: 'P3', depth: 180, flow: 25.7, temperature: 17.5, timestamp: '2023-06-01T09:00:00' },
    { position: 'P4', depth: 165, flow: 23.8, temperature: 17.8, timestamp: '2023-06-01T09:30:00' },
    { position: 'P5', depth: 140, flow: 21.3, temperature: 18.0, timestamp: '2023-06-01T10:00:00' },
    { position: 'P6', depth: 132, flow: 19.8, temperature: 18.3, timestamp: '2023-06-01T10:30:00' },
  ],
  summaryStats: {
    avgDepth: 147.8,
    maxDepth: 180,
    avgFlow: 22.25,
    maxFlow: 25.7,
    avgTemperature: 17.95
  }
};

const comparativePeriodData = [
  { name: 'January 2023', volume: 35.4, depth: 142, width: 15.2 },
  { name: 'March 2023', volume: 32.1, depth: 138, width: 15.0 },
  { name: 'June 2023', volume: 28.5, depth: 125, width: 14.8 },
  { name: 'September 2023', volume: 34.2, depth: 140, width: 15.1 },
  { name: 'December 2023', volume: 38.7, depth: 148, width: 15.4 },
  { name: 'Current', volume: 36.8, depth: 145, width: 15.2 },
];

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const PeriodVisualization: React.FC = () => {
  const { projectId, periodId } = useParams<{ projectId: string; periodId: string }>();
  const [period, setPeriod] = useState<IPeriod | null>(null);
  const [analysisData, setAnalysisData] = useState<IPeriodAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!periodId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch period data
        const periodData = await periodService.getPeriodById(periodId);
        setPeriod(periodData);

        // TODO: Replace this with a real API call to get analysis data when available
        // Simulating loading analysis data
        setTimeout(() => {
          setAnalysisData(mockAnalysisData as any);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching visualization data:', err);
        setError('Error loading visualization data. Please try again.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [periodId]);

  // Function to export data to CSV
  const exportDataToCSV = () => {
    if (!analysisData) return;

    // Create CSV content
    const csvContent = [
      // Headers
      ['Position', 'Depth (cm)', 'Flow (m³/s)', 'Temperature (°C)', 'Timestamp'].join(','),
      // Data rows
      ...analysisData.dataPoints.map(point => [
        point.position,
        point.depth,
        point.flow,
        point.temperature,
        point.timestamp
      ].join(','))
    ].join('\n');

    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `period-${periodId}-analysis.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Visualization not available</h2>
        <p className="text-gray-600 mb-4">{error || "Could not load visualization data for this period."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">{period.periodName} - Visualization Dashboard</h2>
        <Button
          variant="secondary"
          leftIcon={<Download size={16} />}
          onClick={exportDataToCSV}
        >
          Export Data
        </Button>
      </div>

      {/* Summary statistics */}
      <Card
        title="Summary Statistics"
        icon={<BarChartIcon size={20} className="text-blue-600" />}
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Average Depth</p>
            <p className="text-xl font-bold text-blue-600">{analysisData?.summaryStats.avgDepth.toFixed(1)} cm</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Maximum Depth</p>
            <p className="text-xl font-bold text-green-600">{analysisData?.summaryStats.maxDepth.toFixed(1)} cm</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Average Flow</p>
            <p className="text-xl font-bold text-purple-600">{analysisData?.summaryStats.avgFlow.toFixed(1)} m³/s</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Maximum Flow</p>
            <p className="text-xl font-bold text-yellow-600">{analysisData?.summaryStats.maxFlow.toFixed(1)} m³/s</p>
          </div>
        </div>
      </Card>

      {/* Charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Depth and Flow Chart */}
        <Card
          title="Depth and Flow by Position"
          icon={<LineChartIcon size={20} className="text-blue-600" />}
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analysisData?.dataPoints}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="position" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="depth" stroke="#8884d8" name="Depth (cm)" />
                <Line yAxisId="right" type="monotone" dataKey="flow" stroke="#82ca9d" name="Flow (m³/s)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Temperature Chart */}
        <Card
          title="Temperature by Position"
          icon={<LineChartIcon size={20} className="text-blue-600" />}
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analysisData?.dataPoints}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="position" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="temperature" stroke="#FF8042" name="Temperature (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Historical Comparison Bar Chart */}
        <Card
          title="Historical Period Comparison"
          icon={<BarChartIcon size={20} className="text-blue-600" />}
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparativePeriodData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="volume" name="Volume (m³/s)" fill="#8884d8" />
                <Bar dataKey="depth" name="Depth (cm)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Metrics Distribution Pie Chart */}
        <Card
          title="Measurement Distribution"
          icon={<PieChartIcon size={20} className="text-blue-600" />}
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Depth', value: analysisData?.summaryStats.avgDepth || 0 },
                    { name: 'Flow', value: analysisData?.summaryStats.avgFlow || 0 },
                    { name: 'Temperature', value: analysisData?.summaryStats.avgTemperature || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value}`, 'Value']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Data points table */}
      <Card
        title="Data Points"
        icon={<Calendar size={20} className="text-blue-600" />}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Position</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Depth (cm)</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Flow (m³/s)</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Temperature (°C)</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analysisData?.dataPoints.map((point, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4">{point.position}</td>
                  <td className="py-2 px-4">{point.depth}</td>
                  <td className="py-2 px-4">{point.flow}</td>
                  <td className="py-2 px-4">{point.temperature}</td>
                  <td className="py-2 px-4">{new Date(point.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PeriodVisualization;
