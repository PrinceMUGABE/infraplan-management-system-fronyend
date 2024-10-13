/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const AdminCreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    // email: '',
    phone: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    const newErrors = {};

    if (!/^[A-Za-z]{2,}$/.test(formData.first_name)) {
      newErrors.first_name = "First name must be at least 2 characters long.";
    }

    if (!/^[A-Za-z]{2,}$/.test(formData.last_name)) {
      newErrors.last_name = "Last name must be at least 2 characters long.";
    }

    // if (!/^[^\s@]+@gmail\.com$/.test(formData.email)) {
    //   newErrors.email = 'Email must be a valid Gmail address (e.g., example@gmail.com).';
    // }

    // Only allow numbers in the input

    if (!/^(078|079|072|073)\d{7}$/.test(formData.phone)) {
      newErrors.phone =
        "Phone number must be 10 digits starting with 078, 079, 072, or 073.";
    }

    if (!formData.role || formData.role === "choose") {
      newErrors.role = "Please select a valid role from the list.";
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Password must contain at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateFields();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataToSubmit = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      role: formData.role,
      password: formData.password,
      confirm_password: formData.confirmPassword,
    };

    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/signup/",
        dataToSubmit
      );

      if (response.status === 201) {
        setMessage(
          "Registration successful! Please check your email to activate your account."
        );
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setErrors((prev) => ({
          ...prev,
          form: response.data.error || "Registration failed. Please try again.",
        }));
      }
    } catch (error) {
      if (error.response?.data) {
        const backendErrors = error.response.data;
        const errorMessages = {};

        if (backendErrors.email) {
          errorMessages.email = backendErrors.email.join(" ");
        }
        if (backendErrors.phone) {
          errorMessages.phone = backendErrors.phone.join(" ");
        }

        setErrors(errorMessages);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-4xl mx-auto shadow-lg rounded-lg overflow-hidden">
        {/* Image container */}


        {/* Form container */}
        <div className="w-full md:w-1/2 bg-white p-8">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Create an Account
            </h2>
            {message && (
              <p className="text-green-500 text-center mb-4">{message}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* First Name */}
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium mb-1"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  className={`w-full px-3 py-1.5 text-sm border rounded-md ${
                    errors.first_name ? "border-red-500" : ""
                  }`}
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                />
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.first_name}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium mb-1"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  className={`w-full px-3 py-1.5 text-sm border rounded-md ${
                    errors.last_name ? "border-red-500" : ""
                  }`}
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                />
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.last_name}
                  </p>
                )}
              </div>

              {/* Phone */}
              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-1"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  pattern="[0-9]*"
                  className={`w-full px-3 py-1.5 text-sm border rounded-md ${
                    errors.phone ? "border-red-500" : ""
                  }`}
                  value={formData.phone}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) {
                      setFormData({ ...formData, phone: e.target.value });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "e" ||
                      e.key === "E" ||
                      e.key === "+" ||
                      e.key === "-" ||
                      e.key === "."
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium mb-1"
                >
                  Role
                </label>
                <select
                  id="role"
                  className={`w-full px-3 py-1.5 text-sm border rounded-md ${
                    errors.role ? "border-red-500" : ""
                  }`}
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="choose">Choose a role</option>
                  {/* <option value="admin">Admin</option> */}
                  <option value="project_owner">Project Owner</option>
                  <option value="planner">Planner</option>
                  <option value="engineer">Engineer</option>
                  <option value="stakeholder">Stakeholder</option>
                  {/* <option value="rdb_official">RDB Official</option> */}
                </select>
                {errors.role && (
                  <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1"
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`w-full px-3 py-1.5 text-sm border rounded-md ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute right-2 top-7 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeIcon className="h-4 w-4" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4" />
                  )}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium mb-1"
                >
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  className={`w-full px-3 py-1.5 text-sm border rounded-md ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  className="absolute right-2 top-7 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeIcon className="h-4 w-4" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4" />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 text-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex justify-center items-center">
                      <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                      Registering...
                    </span>
                  ) : (
                    "Register"
                  )}
                </button>
              </div>

              {/* Show form errors */}
              {errors.form && (
                <p className="text-red-500 text-xs text-center">
                  {errors.form}
                </p>
              )}

              {/* Link to Login */}
              <p className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminCreateUser;
