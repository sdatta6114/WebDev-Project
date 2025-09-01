// File: client/src/components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDashboard } from '../context/DashboardContext';
import styles from './AdminPanel.module.css';

const AdminPanel = ({ currentUser }) => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const { fetchStats } = useDashboard();

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5001/api/users', {
                headers: { 'x-auth-token': token }
            });
            setUsers(res.data);
        } catch (err) {
            setError('Failed to fetch users.');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleApprove = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5001/api/users/approve/${userId}`, {}, {
                headers: { 'x-auth-token': token }
            });
            fetchUsers();
        } catch (err) {
            alert('Failed to approve user.');
        }
    };
    
    const handleReject = async (userId) => {
        if (window.confirm('Are you sure you want to reject and remove this user?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5001/api/users/${userId}`, {
                    headers: { 'x-auth-token': token }
                });
                fetchUsers();
            } catch (err) {
                alert(err.response?.data?.msg || 'Failed to reject user.');
            }
        }
    };
    
    const handleDeleteFile = async (fileId) => {
        if (window.confirm('Are you sure you want to permanently delete this file?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5001/api/files/${fileId}`, {
                    headers: { 'x-auth-token': token }
                });
                fetchUsers(); // Refresh the user and file list in the admin panel
                fetchStats(); // Refresh the dashboard stats
            } catch (err) {
                alert(err.response?.data?.msg || 'Failed to delete file.');
            }
        }
    };

    return (
        <div className={styles.card}>
            <h2 className={styles.title}>Manage Users & Admins</h2>
            {error && <p className={styles.errorText}>{error}</p>}
            
            {currentUser.role === 'superadmin' && users.filter(u => !u.approved).length > 0 && (
                <div className={styles.approvalSection}>
                    <h3 className={styles.subtitle}>Pending Approvals</h3>
                    {users.filter(u => !u.approved).map(user => (
                        <div key={user._id} className={styles.approvalCard}>
                            <span>{user.name} ({user.email})</span>
                            <div className={styles.approvalActions}>
                                <button onClick={() => handleApprove(user._id)} className={styles.approveButton}>Approve</button>
                                <button onClick={() => handleReject(user._id)} className={styles.rejectButton}>Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Uploaded Files</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.filter(u => u.approved).map(user => {
                            const canManageUserFiles = 
                                currentUser.role === 'superadmin' || 
                                (currentUser.role === 'admin' && user.role === 'user') ||
                                currentUser.id === user._id;

                            return (
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td className={styles.capitalize}>{user.role}</td>
                                    <td>
                                        <span className={`${styles.status} ${user.isActive ? styles.active : styles.inactive}`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        {user.files && user.files.length > 0 ? (
                                            <ul className={styles.fileList}>
                                                {user.files.map(file => (
                                                    <li key={file._id}>
                                                        <span>{file.originalName}</span>
                                                        {canManageUserFiles && (
                                                            <button onClick={() => handleDeleteFile(file._id)} className={styles.deleteFileButton}>Delete</button>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : 'No files uploaded'}
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleReject(user._id)}
                                            disabled={(currentUser.role === 'admin' && user.role !== 'user') || user.role === 'superadmin'}
                                            className={styles.removeButton}
                                        >
                                            Remove User
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;
