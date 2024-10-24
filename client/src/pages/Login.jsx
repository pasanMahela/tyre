import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AiOutlineUser, AiOutlineLock } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      
      // Redirect to /pos and pass success message through state
      navigate('/pos', { state: { message: 'Login successful!' } });
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }} // Slide in from the top
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center items-center h-screen bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500"
    >
      <motion.div
        className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-700">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            className="flex items-center border-b border-gray-300 py-2"
            whileFocus={{ scale: 1.05 }} // Scale up on focus
            transition={{ duration: 0.2 }}
          >
            <AiOutlineUser className="text-xl mr-2 text-gray-600" />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full outline-none py-2 px-2 bg-gray-100 rounded focus:bg-white transition duration-200"
              placeholder="Username"
              required
            />
          </motion.div>
          <motion.div
            className="flex items-center border-b border-gray-300 py-2"
            whileFocus={{ scale: 1.05 }} // Scale up on focus
            transition={{ duration: 0.2 }}
          >
            <AiOutlineLock className="text-xl mr-2 text-gray-600" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full outline-none py-2 px-2 bg-gray-100 rounded focus:bg-white transition duration-200"
              placeholder="Password"
              required
            />
          </motion.div>
          {error && (
            <motion.p
              className="text-red-500 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}
          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white py-2 rounded hover:bg-blue-500 transition duration-200"
            whileHover={{ scale: 1.05 }} // Scale up on hover
            transition={{ duration: 0.2 }}
          >
            Login
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Login;
