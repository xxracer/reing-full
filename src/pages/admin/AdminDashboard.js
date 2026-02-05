import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
    } catch (e) {
      console.error("Logout failed", e);
    }
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Admin Panel</h2>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
        <ul>
          <li>
            <NavLink to="/admin/homepage" className={({ isActive }) => isActive ? 'active' : ''}>
              Manage Homepage
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/programs" className={({ isActive }) => isActive ? 'active' : ''}>
              Manage Programs (Images)
            </NavLink>
            <div className="submenu" style={{ marginLeft: '20px', fontSize: '0.9em' }}>
              <NavLink to="/admin/programs/kids" style={{ display: 'block', padding: '5px 0', color: '#ccc', textDecoration: 'none' }}> - Kids Program</NavLink>
              <NavLink to="/admin/programs/homeschool" style={{ display: 'block', padding: '5px 0', color: '#ccc', textDecoration: 'none' }}> - Homeschool Program</NavLink>
              <NavLink to="/admin/programs/adult" style={{ display: 'block', padding: '5px 0', color: '#ccc', textDecoration: 'none' }}> - Adult Program</NavLink>
              <NavLink to="/admin/programs/fundamentals" style={{ display: 'block', padding: '5px 0', color: '#ccc', textDecoration: 'none' }}> - Fundamentals</NavLink>
              <NavLink to="/admin/programs/competition" style={{ display: 'block', padding: '5px 0', color: '#ccc', textDecoration: 'none' }}> - Competition</NavLink>
              <NavLink to="/admin/programs/wrestling" style={{ display: 'block', padding: '5px 0', color: '#ccc', textDecoration: 'none' }}> - Wrestling</NavLink>
              <NavLink to="/admin/programs/private-lessons" style={{ display: 'block', padding: '5px 0', color: '#ccc', textDecoration: 'none' }}> - Private Lessons</NavLink>
            </div>
          </li>
          <li>
            <NavLink to="/admin/about" className={({ isActive }) => isActive ? 'active' : ''}>
              Manage About Us
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/facility" className={({ isActive }) => isActive ? 'active' : ''}>
              Manage Facility
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/schedule" className={({ isActive }) => isActive ? 'active' : ''}>
              Manage Schedule
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/blog" className={({ isActive }) => isActive ? 'active' : ''}>
              Manage Blog
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/instructors" className={({ isActive }) => isActive ? 'active' : ''}>
              Manage Instructors
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/security" className={({ isActive }) => isActive ? 'active' : ''}>
              Change Password
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
