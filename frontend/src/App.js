import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Company from './pages/Company';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import Party from './pages/Party';
import './App.css';
import Purchase from './pages/Purchase';
import PurchaseList from './pages/PurchaseList';
import StockReport from './pages/StockReport';
import Sales from './pages/Sales';
import SalesList from './pages/SalesList';
import StockDetail from './pages/StockDetail';
import DashboardHome from './pages/DashboardHome';
import Settings from './pages/Setting';
import CreateForm from './pages/settings/CreateForm';
import AllForms from './pages/settings/AllForms';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/company" element={<Company />} />

        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="items" element={<Items />} />
          <Route path="party" element={<Party />} />
          <Route path="purchase" element={<Purchase />} />
          <Route path="purchaselist" element={<PurchaseList />} />
          <Route path="stock-report" element={<StockReport />} />
          <Route path="sales" element={<Sales />} />
          <Route path="SalesList" element={<SalesList />} />
          <Route path="stock/:id" element={<StockDetail />} />

          {/* Settings */}
          <Route path="settings" element={<Settings />}>
            <Route index element={<Navigate to="create-form" replace />} />
            <Route path="create-form" element={<CreateForm />} />
            <Route path="all-forms" element={<AllForms />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;