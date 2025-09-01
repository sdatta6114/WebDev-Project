// File: client/src/pages/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from './LoginPage.module.css';

const LoginPage = ({ register }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Hook for navigation

    const { name, email, password, role } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setMessage('');
        const url = register ? '/api/auth/register' : '/api/auth/login';
        try {
            const res = await axios.post(`http://localhost:5001${url}`, formData);
            if (register) {
                setMessage('Registration successful! Please log in.');
                navigate('/login');
            } else {
                localStorage.setItem('token', res.data.token);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred.');
        }
    };

    // Function to handle closing the page
    const handleClose = () => {
        navigate('/'); // Navigate back to the landing page
    };

    return (
        <div className="view-container">
            <div className={styles.card}>
                {/* --- ADDED CLOSE BUTTON --- */}
                <button onClick={handleClose} className={styles.closeButton}>&times;</button>
                
                <h2 className={styles.title}>
                    {register ? 'Create Account' : 'Welcome Back'}
                </h2>
                <form onSubmit={onSubmit} className={styles.form}>
                    {register && (
                        <input type="text" name="name" value={name} onChange={onChange} placeholder="Full Name" required className={styles.input} />
                    )}
                    <input type="email" name="email" value={email} onChange={onChange} placeholder="Email Address" required className={styles.input} />
                    <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" required className={styles.input} />
                    {register && (
                        <select name="role" value={role} onChange={onChange} className={styles.input}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                        </select>
                    )}
                    {error && <p className={styles.errorText}>{error}</p>}
                    {message && <p className={styles.successText}>{message}</p>}
                    <button type="submit" className={styles.button}>
                        {register ? 'Register' : 'Log In'}
                    </button>
                </form>
                <p className={styles.footerText}>
                    {register ? 'Already have an account?' : "Don't have an account?"}
                    <Link to={register ? '/login' : '/register'} className={styles.link}>
                        {register ? 'Log In' : 'Sign Up'}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
