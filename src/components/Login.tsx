import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

interface FormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const { login } = useAuth();

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) return 'Email is required';
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        break;
      
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2) return 'First name must be at least 2 characters';
        if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'First name can only contain letters, spaces, hyphens, and apostrophes';
        break;
      
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.trim().length < 2) return 'Last name must be at least 2 characters';
        if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (touched[name] && errors[name as keyof FormErrors]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      email: true,
      firstName: true,
      lastName: true
    });

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(formData);
      console.log('Login successful');
    } catch (err) {
      setError('Login failed. Please check your information and try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fixed validation logic
  const hasFieldErrors = Object.values(errors).some(error => error !== undefined);
  const hasAllFields = formData.email.trim() && formData.firstName.trim() && formData.lastName.trim();
  const isFormValid = !hasFieldErrors && hasAllFields;

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Sensor Analysis Login</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email: <span className="required">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.email ? 'error' : ''}
              required
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="firstName">First Name: <span className="required">*</span></label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.firstName ? 'error' : ''}
              required
            />
            {errors.firstName && <div className="field-error">{errors.firstName}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name: <span className="required">*</span></label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.lastName ? 'error' : ''}
              required
            />
            {errors.lastName && <div className="field-error">{errors.lastName}</div>}
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            disabled={loading || !isFormValid} 
            className="login-button"
          >
            {loading ? 'Logging in...' : 'Login / Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;