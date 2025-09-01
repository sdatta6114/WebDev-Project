// File: client/src/components/DashboardHome.js
import React from 'react';
import { useDashboard } from '../context/DashboardContext'; // Import the context hook
import styles from './DashboardHome.module.css';

const DashboardHome = () => {
    // Consume data from the context
    const { stats, myRecentFiles } = useDashboard();

    return (
        <div>
            <div className={styles.statsGrid}>
                <div className={styles.card}>
                    <p className={styles.label}>Total Uploaded Files (Lifetime)</p>
                    <p className={styles.value}>{stats.totalUploads}</p>
                </div>
                <div className={styles.card}>
                    <p className={styles.label}>Deleted Files (24h)</p>
                    <p className={styles.value}>{stats.deletedFiles24h}</p>
                </div>
                <div className={styles.card}>
                    <p className={styles.label}>Current Files</p>
                    <p className={styles.value}>{stats.currentFiles}</p>
                </div>
            </div>
            <div className={`${styles.card} ${styles.filesCard}`}>
                <h2 className={styles.title}>Your Recent Files</h2>
                {myRecentFiles.length > 0 ? (
                    <table className={styles.filesTable}>
                        <thead>
                            <tr>
                                <th>File Name</th>
                                <th>Upload Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myRecentFiles.map(file => (
                                <tr key={file._id}>
                                    <td>{file.originalName}</td>
                                    <td>{new Date(file.uploadDate).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>You have not uploaded any files recently.</p>
                )}
            </div>
        </div>
    );
};

export default DashboardHome;
