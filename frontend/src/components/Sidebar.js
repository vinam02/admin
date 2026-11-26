import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="sidebar p-3" style={{ width: '250px' }}>
      <h4 className="text-center mb-4">Menu</h4>
      <ul className="list-unstyled d-flex flex-column gap-3">
        <li><NavLink to="/dashboard" end className="fs-5">Dashboard</NavLink></li>
        <li><NavLink to="/dashboard/items" className="fs-5">Items</NavLink></li>
        <li><NavLink to="/dashboard/party" className="fs-5">Party</NavLink></li>
        {/* <li><NavLink to="/dashboard/purchase" className="fs-5">Purchase</NavLink></li> */}
        <li><NavLink to="/dashboard/purchaselist" className="fs-5">Purchase List</NavLink></li>
        <li><NavLink to="/dashboard/SalesList" className="fs-5">Sales list</NavLink></li>
        <li><NavLink to="/dashboard/stock-report" className="fs-5">Stock Report</NavLink></li>
        <li><NavLink to="/dashboard/settings" className="fs-5">Settings</NavLink></li>
      </ul>
      <br />
      <button
        className="btn btn-danger w-100 mt-3"
        onClick={() => {
          localStorage.removeItem('company');
          window.location.href = '/';
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;