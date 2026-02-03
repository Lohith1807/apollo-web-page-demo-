import React, { createContext, useState, useContext, useEffect } from 'react';
console.log("AuthContext.jsx Loaded");
import { login as apiLogin, signup as apiSignup } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch (err) {
            console.error("Local storage parsing failed:", err);
            return null;
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await apiLogin(credentials);
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return data;
        } catch (err) {
            console.warn('Backend login failed, attempting local demo fallback...');
            const { email, password, role } = credentials;

            const demoAccounts = {
                'admin@apollo.edu': { name: 'Admin Demo', role: 'admin' },
                'teacher@apollo.edu': { name: 'Teacher Demo', role: 'teacher' },
                'student@apollo.edu': { name: 'Student Demo', role: 'student' }
            };

            if (demoAccounts[email] && password === 'Test@123') {
                const mockUser = {
                    _id: 'mock_' + Date.now(),
                    ...demoAccounts[email],
                    email: email,
                    token: 'mock_token_' + role
                };
                setUser(mockUser);
                localStorage.setItem('user', JSON.stringify(mockUser));
                return mockUser;
            }

            setError(err.response?.data?.message || 'Login failed. Please check credentials.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await apiSignup(userData);
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return data;
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
