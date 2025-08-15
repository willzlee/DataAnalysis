import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { SensorData } from '../types';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [descriptionError, setDescriptionError] = useState<string>('');
  const [touched, setTouched] = useState(false);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    loadSensorData();
  }, []);

  const loadSensorData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getSensorData();
      setSensorData(data);
    } catch (err) {
      setError('Failed to load sensor data');
      console.error('Error loading sensor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateDescription = (value: string): string => {
    const trimmed = value.trim();
    
    if (!trimmed) {
      return 'Analysis description is required';
    }
    
    if (trimmed.length < 10) {
      return 'Description must be at least 10 characters long';
    }
    
    if (trimmed.length > 1000) {
      return 'Description must be less than 1000 characters';
    }

    // Check for meaningful content (not just repeated characters)
    if (/^(.)\1{9,}$/.test(trimmed)) {
      return 'Please provide a meaningful analysis description';
    }

    return '';
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);

    // Validate on change if already touched
    if (touched) {
      const error = validateDescription(value);
      setDescriptionError(error);
    }
  };

  const handleDescriptionBlur = () => {
    setTouched(true);
    const error = validateDescription(description);
    setDescriptionError(error);
  };

  const generateChartImage = (): Promise<string> => {
    return new Promise((resolve) => {
      if (chartRef.current) {
        const canvas = chartRef.current.canvas;
        
        // Create a new canvas with white background
        const newCanvas = document.createElement('canvas');
        newCanvas.width = 128;
        newCanvas.height = 128;
        const newContext = newCanvas.getContext('2d');
        
        if (newContext) {
          // Fill with white background
          newContext.fillStyle = 'white';
          newContext.fillRect(0, 0, 128, 128);
          
          // Draw the chart scaled down
          newContext.drawImage(canvas, 0, 0, 128, 128);
          
          // Convert to base64
          const base64 = newCanvas.toDataURL('image/png').split(',')[1];
          resolve(base64);
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched(true);
    const validationError = validateDescription(description);
    setDescriptionError(validationError);

    if (validationError || !sensorData || !user) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const plotImage = await generateChartImage();
      
      await apiService.submitResults({
        plot: plotImage,
        description: description.trim(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        lineNumber: sensorData.lineNumber,
      });

      alert('Analysis submitted successfully!');
      setDescription('');
      setDescriptionError('');
      setTouched(false);
      // Optionally load new sensor data
      loadSensorData();
    } catch (err) {
      setError('Failed to submit analysis. Please try again.');
      console.error('Error submitting analysis:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = sensorData ? {
    labels: sensorData.points.map((_, index) => index.toString()),
    datasets: [
      {
        label: 'Sensor Readings',
        data: sensorData.points,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Sensor Data - Line ${sensorData?.lineNumber || 'N/A'}`,
      },
    },
    scales: {
      y: {
        min: -1000,
        max: 1000,
      },
    },
  };

  const isFormValid = !descriptionError && description.trim().length >= 10;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Sensor Analysis Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.firstName} {user?.lastName}</span>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        {loading && <div className="loading">Loading sensor data...</div>}
        
        {error && (
          <div className="error-message">
            {error}
            <button onClick={loadSensorData} className="retry-button">Retry</button>
          </div>
        )}

        {sensorData && (
          <div className="data-section">
            <div className="data-info">
              <h3>Sensor Data Information</h3>
              <p><strong>Timestamp:</strong> {new Date(sensorData.timestamp).toLocaleString()}</p>
              <p><strong>Line Number:</strong> {sensorData.lineNumber}</p>
              <p><strong>Data Points:</strong> {sensorData.points.length}</p>
              <button onClick={loadSensorData} className="refresh-button">
                Load New Data
              </button>
            </div>

            <div className="chart-section">
              <h3>Sensor Readings Visualization</h3>
              {chartData && (
                <Line
                  ref={chartRef}
                  data={chartData}
                  options={chartOptions}
                />
              )}
            </div>

            <div className="analysis-section">
              <h3>Submit Analysis</h3>
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="description">
                    Analysis Description: <span className="required">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={handleDescriptionChange}
                    onBlur={handleDescriptionBlur}
                    rows={4}
                    placeholder="Describe your analysis of the sensor data... (minimum 10 characters)"
                    className={descriptionError ? 'error' : ''}
                    required
                  />
                  <div className="char-count">
                    {description.length}/1000 characters
                    {description.trim().length > 0 && description.trim().length < 10 && (
                      <span className="char-count-error"> (minimum 10 required)</span>
                    )}
                  </div>
                  {descriptionError && <div className="field-error">{descriptionError}</div>}
                </div>
                
                <button
                  type="submit"
                  disabled={submitting || !isFormValid}
                  className="submit-button"
                >
                  {submitting ? 'Submitting...' : 'Submit Analysis'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;