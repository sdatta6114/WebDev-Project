// File: client/src/components/Sidebar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = ({ user, sidebarOpen, setSidebarOpen, pendingApprovalsCount }) => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const avatarSrc = user.avatarUrl 
        ? `http://localhost:5001/${user.avatarUrl.replace(/\\/g, '/')}` 
        : 'https://i.pravatar.cc/150';

    return (
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
            <div className={styles.header}>
                <h1 className={styles.logo}>AnalytixExcel</h1>
                <button onClick={() => setSidebarOpen(false)} className={styles.closeButton}>&times;</button>
            </div>
            <nav className={styles.nav}>
                <NavLink to="/dashboard" end className={({isActive}) => `${styles.link} ${isActive ? styles.active : ''}`}>Dashboard</NavLink>
                {(user.role === 'admin' || user.role === 'superadmin') && (
                    <NavLink to="/dashboard/admin-panel" className={({isActive}) => `${styles.link} ${isActive ? styles.active : ''}`}>
                        Admin Panel
                        {pendingApprovalsCount > 0 && <span className={styles.notificationBadge}>{pendingApprovalsCount}</span>}
                    </NavLink>
                )}
                <NavLink to="/dashboard/my-files" className={({isActive}) => `${styles.link} ${isActive ? styles.active : ''}`}>My Files</NavLink>
                <NavLink to="/dashboard/platform-history" className={({isActive}) => `${styles.link} ${isActive ? styles.active : ''}`}>Platform History</NavLink>
                <NavLink to="/dashboard/visualizations" className={({isActive}) => `${styles.link} ${isActive ? styles.active : ''}`}>Visualizations</NavLink>
                <NavLink to="/dashboard/settings" className={({isActive}) => `${styles.link} ${isActive ? styles.active : ''}`}>Settings</NavLink>
            </nav>
            <div className={styles.footer}>
                <img src={avatarSrc} alt="User Avatar" className={styles.avatar} />
                <div className={styles.userInfo}>
                    <p className={styles.userName}>{user.name}</p>
                    <p className={styles.userRole}>{user.role}</p>
                </div>
                <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
            </div>
        </aside>
    );
};

export default Sidebar;
