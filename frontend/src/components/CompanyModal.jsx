import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Country, State } from 'country-state-city';

function CompanyModal({ mode, company, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    companyName: '', companyContact: '', address: '',
    country: '', state: '', companyId: '', password: ''
  });

  // Country / State ka data
  const [countryCode, setCountryCode] = useState(''); 
  const countries = Country.getAllCountries(); 
  const states = countryCode ? State.getStatesOfCountry(countryCode) : [];

  // Edit mode ke liye purana data form mein bharna
  useEffect(() => {
    if (company) {
      setFormData(company);  
      const c = Country.getAllCountries().find((x) => x.name === company.country);
      setCountryCode(c ? c.isoCode : ''); 
    }
  }, [company]);           

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };    

  // Country badalne par state khali ho jayega
  const handleCountryChange = (e) => {
    const code = e.target.value;
    const c = Country.getCountryByCode(code);
    setCountryCode(code);
    setFormData({ ...formData, country: c ? c.name : '', state: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/api/companies/${company._id}`, formData);
      onSuccess(res.data);
      alert('Company Updated Successfully!');
    } catch (error) {
      alert('Update failed!');
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
      <div className="bg-white p-4 rounded shadow" style={{ width: '100%', maxWidth: '500px' }}>
        <h4 className="mb-3">Update Company Profile</h4>

        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label>Company Name</label>
            <input name="companyName" className="form-control" value={formData.companyName || ''} onChange={handleChange} required />
          </div>
          <div className="mb-2">
            <label>Contact</label>
            <input name="companyContact" className="form-control" value={formData.companyContact || ''} onChange={handleChange} required />
          </div>
          <div className="mb-2">
            <label>Address</label>
            <input name="address" className="form-control" value={formData.address || ''} onChange={handleChange} required />
          </div>

          <div className="mb-2">
            <label>Country</label>
            <select className="form-select" value={countryCode}
              onChange={handleCountryChange} required>
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-2">
            <label>State</label>
            <select name="state" className="form-select" value={formData.state || ''}
              onChange={handleChange} required disabled={!countryCode}>
              <option value="">Select State</option>
              {states.map((s) => (  
                <option key={s.isoCode} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>       

          <div className="mb-2">
            <label>Login ID</label>
            <input name="companyId" className="form-control" value={formData.companyId || ''} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input name="password" type="password" className="form-control" value={formData.password || ''} onChange={handleChange} required />
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary w-50">Update</button>
            <button type="button" className="btn btn-secondary w-50" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompanyModal;