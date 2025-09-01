// File: client/src/components/MyFiles.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './MyFiles.module.css';

const MyFiles = () => {
    const [myFiles, setMyFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchMyFiles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5001/api/files', {
                headers: { 'x-auth-token': token }
            });
            setMyFiles(res.data);
        } catch (err) {
            console.error("Failed to fetch user files.", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyFiles();
    }, []);

    const handleDeleteFile = async (fileId) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5001/api/files/${fileId}`, {
                    headers: { 'x-auth-token': token }
                });
                fetchMyFiles(); // Refresh the list after deletion
            } catch (err) {
                alert('Failed to delete file.');
            }
        }
    };

    const handleAnalyzeFile = (file) => {
        // Navigate to the visualizations page and pass the file object in the state
        navigate('/dashboard/visualizations', { state: { fileToLoad: file } });
    };

    if (loading) {
        return <div className={styles.card}><p>Loading your files...</p></div>;
    }

    return (
        <div className={styles.card}>
            <h2 className={styles.title}>My Uploaded Files</h2>
            <p className={styles.subtitle}>Manage your personal files. Click on a file to analyze it.</p>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>File Name</th>
                            <th>Upload Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myFiles.length > 0 ? myFiles.map(file => (
                            <tr key={file._id}>
                                <td 
                                    className={styles.fileNameCell} 
                                    onClick={() => handleAnalyzeFile(file)}
                                >
                                    {file.originalName}
                                </td>
                                <td>{new Date(file.uploadDate).toLocaleString()}</td>
                                <td>
                                    <button onClick={() => handleDeleteFile(file._id)} className={styles.deleteButton}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="3" className={styles.noFiles}>You have not uploaded any files.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyFiles;
