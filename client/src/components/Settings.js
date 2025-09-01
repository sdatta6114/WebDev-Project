// File: client/src/components/Settings.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';

const Settings = ({ onProfileUpdate }) => {
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [message, setMessage] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('https://i.pravatar.cc/150');
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5001/api/auth/me', {
                    headers: { 'x-auth-token': token }
                });
                setFormData({ name: res.data.name, email: res.data.email });
                if (res.data.avatarUrl) {
                    setAvatarPreview(`http://localhost:5001/${res.data.avatarUrl.replace(/\\/g, '/')}`);
                }
            } catch (err) {
                console.error("Failed to fetch user data", err);
            }
        };
        fetchUserData();
    }, []);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            await axios.patch('http://localhost:5001/api/users/me', { name: formData.name }, {
                headers: { 'x-auth-token': token }
            });

            if (avatarFile) {
                const avatarFormData = new FormData();
                avatarFormData.append('avatar', avatarFile);
                await axios.post('http://localhost:5001/api/users/avatar', avatarFormData, {
                    headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token }
                });
            }
            
            setMessage('Profile updated successfully!');
            if (onProfileUpdate) {
                onProfileUpdate();
            }
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to update profile. Please try again.');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleDeactivate = async () => {
        if (window.confirm('Are you sure you want to deactivate your account? You can reactivate it by logging in again.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.patch('http://localhost:5001/api/auth/deactivate', {}, {
                    headers: { 'x-auth-token': token }
                });
                localStorage.removeItem('token');
                navigate('/login');
            } catch (err) {
                alert('Failed to deactivate account.');
            }
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete('http://localhost:5001/api/auth/delete', {
                    headers: { 'x-auth-token': token }
                });
                localStorage.removeItem('token');
                navigate('/login');
            } catch (err) {
                alert('Failed to delete account.');
            }
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Settings</h2>

            <div className={styles.card}>
                <h3 className={styles.subtitle}>Profile Information</h3>
                <form onSubmit={onSubmit} className={styles.form}>
                    <div className={styles.avatarSection}>
                        <img src={avatarPreview} alt="User Avatar" className={styles.avatar} />
                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} accept="image/*" />
                        <button type="button" onClick={() => fileInputRef.current.click()} className={styles.uploadButton}>Change Picture</button>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={onChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" value={formData.email} disabled />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="bio">Short Bio</label>
                        <textarea id="bio" rows="3" placeholder="Tell us a bit about yourself"></textarea>
                    </div>
                    <button type="submit" className={styles.saveButton}>Save Changes</button>
                    {message && <p className={styles.message}>{message}</p>}
                </form>
            </div>

            <div className={styles.card}>
                <h3 className={styles.subtitle}>Account Actions</h3>
                <div className={styles.actionButtons}>
                    <button onClick={handleDeactivate} className={`${styles.actionButton} ${styles.deactivateButton}`}>
                        Deactivate Account
                    </button>
                    <button onClick={handleDelete} className={`${styles.actionButton} ${styles.deleteButton}`}>
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
