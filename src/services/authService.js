import axios from 'axios';

// This should match exactly how your server is configured
const API_URL = 'http://localhost:5000/api/';

export const registerUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}auth/register`, { email, password });
        
        // Store user data in localStorage for easy access
        if (response.data.user_id) {
            localStorage.setItem('user_id', response.data.user_id);
            localStorage.setItem('userEmail', email);
        }
        
        return response.data;
    } catch (err) {
        throw err.response?.data || { error: "Registration failed." };
    }
};

export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}auth/login`, { email, password });
        
        // Store user data in localStorage
        if (response.data.user_id) {
            localStorage.setItem('user_id', response.data.user_id);
            localStorage.setItem('userEmail', email);
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
        }
        
        return response.data;
    } catch (err) {
        throw err.response?.data || { error: "Login failed." };
    }
};

export const updateUserPassword = async (currentPassword, newPassword) => {
    try {
        // Log for debugging
        console.log("Starting password update request");
        
        const user_id = localStorage.getItem('user_id');
        if (!user_id) {
            console.error("No user_id found in localStorage");
            throw { error: "You must be logged in to change your password." };
        }
        
        const token = localStorage.getItem('token');
        console.log("Auth token exists:", !!token);
        
        // Create request configuration
        const config = {
            headers: {}
        };
        
        // Only add Authorization header if token exists
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log("Added token to request headers");
        }
        
        // Create request data
        const data = { 
            user_id, 
            current_password: currentPassword, 
            new_password: newPassword 
        };
        
        console.log("Making password update request to:", `${API_URL}auth/update-password`);
        console.log("With user_id:", user_id);
        
        // Make the request with proper error handling
        const response = await axios.post(`${API_URL}auth/update-password`, data, config);
        
        console.log("Password update response:", response.status);
        return response.data;
    } catch (err) {
        // Enhanced error logging
        console.error("Password update error details:", {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
            config: err.config
        });
        
        if (err.response?.status === 404) {
            throw { error: "API endpoint not found. Please check server configuration." };
        } else if (err.response?.status === 401 || err.response?.status === 403) {
            throw { error: "Authentication failed. Please log in again." };
        } else {
            throw err.response?.data || { error: `Password update failed: ${err.message}` };
        }
    }
};

export const updateUserEmail = async (newEmail) => {
    try {
        const user_id = localStorage.getItem('user_id');
        if (!user_id) {
            throw { error: "You must be logged in to change your email." };
        }
        
        const token = localStorage.getItem('token');
        
        // Create config with auth header
        const config = {
            headers: {}
        };
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await axios.post(
            `${API_URL}auth/update-email`, 
            { user_id, new_email: newEmail },
            config
        );
        
        // Update email in localStorage
        if (response.data.success) {
            localStorage.setItem('userEmail', newEmail);
        }
        
        return response.data;
    } catch (err) {
        throw err.response?.data || { error: "Email update failed." };
    }
};

export const logout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    // Don't remove user settings like darkMode, playerLevel, etc.
};

export const getCurrentUser = () => {
    return {
        user_id: localStorage.getItem('user_id'),
        email: localStorage.getItem('userEmail'),
        token: localStorage.getItem('token')
    };
};