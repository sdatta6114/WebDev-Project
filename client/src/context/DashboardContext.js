// File: client/src/context/DashboardContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
    const [stats, setStats] = useState({
        totalUploads: 0,
        deletedFiles24h: 0, // Add new stat
        currentFiles: 0,
    });
    const [myRecentFiles, setMyRecentFiles] = useState([]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get('http://localhost:5001/api/files/stats', {
                headers: { 'x-auth-token': token }
            });
            setStats({
                totalUploads: res.data.totalUploads,
                deletedFiles24h: res.data.deletedFiles24h, // Set new stat
                currentFiles: res.data.currentFiles,
            });
            setMyRecentFiles(res.data.myRecentFiles);
        } catch (err) {
            console.error("Failed to fetch dashboard stats.", err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const value = {
        stats,
        myRecentFiles,
        fetchStats
    };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
};
