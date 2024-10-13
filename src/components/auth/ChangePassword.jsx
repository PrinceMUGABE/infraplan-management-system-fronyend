import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    new_password: '',
    confirm_password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasDigit: false,
    hasSpecialChar: false,
    isValidLength: false,
    passwordsMatch: false,
  });

  useEffect(() => {
    // Assuming user data is stored in sessionStorage from the login response
    const user = JSON.parse(sessionStorage.getItem('userData'));
    if (user && user.username) {
      axios.get(`http://127.0.0.1:8000/account/get_user/${user.username}/`)
        .then(response => {
          const userData = response.data;
          setFormData((prevFormData) => ({
            ...prevFormData,
            email: userData.email,
          }));
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          setError('Failed to fetch user data.');
        });
    }
  }, []);

  const getCsrfToken = () => {
    let csrfToken = null;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      if (cookie.trim().startsWith('csrftoken=')) {
        csrfToken = cookie.trim().split('=')[1];
        break;
      }
    }
    return csrfToken;
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isValidLength = password.length >= 5;

    setPasswordErrors({
      hasUpperCase,
      hasLowerCase,
      hasDigit,
      hasSpecialChar,
      isValidLength,
      passwordsMatch: formData.new_password === formData.confirm_password,
    });

    return hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar && isValidLength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match.');
      setPasswordErrors((prevErrors) => ({
        ...prevErrors,
        passwordsMatch: false,
      }));
      return;
    }
    if (!validatePassword(formData.new_password)) {
      setError('Password must meet all criteria.');
      return;
    }
    const csrfToken = getCsrfToken();
    try {
      const response = await axios.post('http://127.0.0.1:8000/account/reset_password/', formData, {
        headers: {
          'X-CSRFToken': csrfToken,
        },
      });
      if (response.data.message === "Password reset successfully. Please check your email for confirmation.") {
        setFormData({ email: '', new_password: '', confirm_password: '' }); // Clear the form fields
        setMessage('Password reset successfully. Please check your email for confirmation.');
        setError(''); // Clear any previous error
        setTimeout(() => {
          navigate('/login');
        }, 2000); // Navigate after 2 seconds to show success message
      } else {
        setError(response.data.error || 'Password reset failed. Please try again.');
        setMessage(''); // Clear any previous message
      }
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred. Please try again.');
      setMessage(''); // Clear any previous message
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'new_password' || name === 'confirm_password') {
      validatePassword(formData.new_password);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Change Password
        </h2>
      </div>
      <small className='mt-1.5 text-center'>Reset password</small>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-500 text-sm">{message}</p>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                readOnly
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div>
            <label htmlFor="new_password" className="block text-sm font-medium leading-6 text-gray-900">
              New Password
            </label>
            <div className="mt-2">
              <input
                id="new_password"
                name="new_password"
                type="password"
                required
                value={formData.new_password}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              {formSubmitted && !passwordErrors.hasUpperCase && <p className="text-red-500 text-sm">Password must contain an uppercase letter.</p>}
              {formSubmitted && !passwordErrors.hasLowerCase && <p className="text-red-500 text-sm">Password must contain a lowercase letter.</p>}
              {formSubmitted && !passwordErrors.hasDigit && <p className="text-red-500 text-sm">Password must contain a digit.</p>}
              {formSubmitted && !passwordErrors.hasSpecialChar && <p className="text-red-500 text-sm">Password must contain a special character.</p>}
              {formSubmitted && !passwordErrors.isValidLength && <p className="text-red-500 text-sm">Password must be at least 5 characters long.</p>}
            </div>
          </div>
          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium leading-6 text-gray-900">
              Confirm Password
            </label>
            <div className="mt-2">
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              {formSubmitted && !passwordErrors.passwordsMatch && <p className="text-red-500 text-sm">Passwords do not match.</p>}
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
