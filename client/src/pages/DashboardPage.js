// File: client/src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { DashboardProvider } from '../context/DashboardContext';
import Sidebar from '../components/Sidebar';
import DashboardHome from '../components/DashboardHome';
import AdminPanel from '../components/AdminPanel';
import PlatformHistory from '../components/PlatformHistory';
import MyFiles from '../components/MyFiles';
import Visualizations from '../components/Visualizations';
import Settings from '../components/Settings';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
    const [user, setUser] = useState({ id: null, name: '', role: '', avatarUrl: '' });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

    const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Fetch fresh user data from the backend
                const res = await axios.get('http://localhost:5001/api/auth/me', {
                    headers: { 'x-auth-token': token }
                });
                const currentUser = {
                    id: res.data._id,
                    name: res.data.name,
                    role: res.data.role,
                    avatarUrl: res.data.avatarUrl
                };
                setUser(currentUser);

                // Also refresh admin-specific data if needed
                if (currentUser.role === 'superadmin') {
                    const usersRes = await axios.get('http://localhost:5001/api/users', {
                        headers: { 'x-auth-token': token }
                    });
                    const pendingAdmins = usersRes.data.filter(u => u.role === 'admin' && !u.approved);
                    setPendingApprovalsCount(pendingAdmins.length);
                }
            } catch (err) {
                console.error("Failed to fetch user data.", err);
            }
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <div className={styles.layout}>
            <Sidebar 
                user={user} 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen}
                pendingApprovalsCount={pendingApprovalsCount}
            />
            <div className={styles.mainContent}>
                <header className={styles.header}>
                    <button onClick={() => setSidebarOpen(true)} className={styles.mobileMenuButton}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <h1 className={styles.pageTitle}>Dashboard</h1>
                </header>
                <main className={styles.pageContent}>
                    <DashboardProvider>
                        <Routes>
                            <Route path="/" element={<DashboardHome />} />
                            {(user.role === 'admin' || user.role === 'superadmin') && (
                                <Route path="admin-panel" element={<AdminPanel currentUser={user} />} />
                            )}
                            <Route path="platform-history" element={<PlatformHistory />} />
                            <Route path="my-files" element={<MyFiles />} />
                            <Route path="visualizations" element={<Visualizations />} />
                            <Route path="settings" element={<Settings onProfileUpdate={fetchUserData} />} />
                        </Routes>
                    </DashboardProvider>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
