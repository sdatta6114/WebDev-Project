// File: client/src/components/UploadHistory.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './PlatformHistory.module.css';

const PlatformHistory = () => {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5001/api/files/activity', {
                    headers: { 'x-auth-token': token }
                });
                setHistoryData(res.data);
            } catch (err) {
                console.error("Failed to fetch upload history.", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) {
        return <div className={styles.card}><p>Loading history...</p></div>;
    }

    return (
        <div className={styles.card}>
            <h2 className={styles.title}>Upload History</h2>
            <p className={styles.subtitle}>A log of all file upload and delete activities across the platform.</p>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Action</th>
                            <th>File Name</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyData.map(item => (
                            <tr key={item._id}>
                                <td>{item.userName}</td>
                                <td className={styles.capitalize}>{item.userRole}</td>
                                <td>
                                    <span className={`${styles.action} ${styles[item.action]}`}>
                                        {item.action}
                                    </span>
                                </td>
                                <td>{item.fileName}</td>
                                <td>{new Date(item.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PlatformHistory;
