import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Country, State } from 'country-state-city';

function Company() {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const emptyForm = {
    companyName: '', companyContact: '', address: '',
    country: '', state: '', companyId: '', password: ''
  };
  const [formData, setFormData] = useState(emptyForm);

  // Country / State ka data
  const [countryCode, setCountryCode] = useState('');
  const countries = Country.getAllCountries();
  const states = countryCode ? State.getStatesOfCountry(countryCode) : [];

  // ============ COMPANY CHECK ============
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/companies');
        if (res.data.length > 0) {
          setCompany(res.data[0]);   // Company hai → card dikhega
        }
      } catch (err) { console.log(err); }
      setLoading(false);
    };
    fetchCompany();
  }, []);

  // ============ HANDLERS ============
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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:5000/api/companies/register',
        formData
      );
      setCompany(res.data);   // card dikhega
      alert('Company Created Successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Creation failed!');
    }
  };

  // Card click → Dashboard
  const handleSelectCompany = () => {
    localStorage.setItem('company', JSON.stringify(company));
    navigate('/dashboard');
  };

  // ============ LOADING ============
  if (loading) return <h4 className="text-center mt-5">Loading...</h4>;

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">

      {/* CASE 1: Company NAHI hai → Create Form */}
      {!company && (
        <div className="card p-4 shadow-sm" style={{ width: '100%', maxWidth: '500px' }}>
          <h3 className="text-center mb-3">Create Company Profile</h3>
          <p className="text-center text-muted small mb-3">
            Pehli baar aaye ho? Company details bharo.
          </p>

          <form onSubmit={handleCreate}>
            <div className="mb-2">
              <label className="form-label">Company Name</label>
              <input name="companyName" className="form-control"
                value={formData.companyName} onChange={handleChange} required />
            </div>
            <div className="mb-2">
              <label className="form-label">Contact</label>
              <input name="companyContact" className="form-control"
                value={formData.companyContact} onChange={handleChange} required />
            </div>
            <div className="mb-2">
              <label className="form-label">Address</label>
              <input name="address" className="form-control"
                value={formData.address} onChange={handleChange} required />
            </div>

            <div className="mb-2">
              <label className="form-label">Country</label>
              <select className="form-select" value={countryCode}
                onChange={handleCountryChange} required>
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="form-label">State</label>
              <select name="state" className="form-select" value={formData.state}
                onChange={handleChange} required disabled={!countryCode}>
                <option value="">Select State</option>
                {states.map((s) => (            
                  <option key={s.isoCode} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="form-label">Login ID</label>
              <input name="companyId" className="form-control"
                value={formData.companyId} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-control"
                value={formData.password} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-success w-100">Create Company</button>
          </form>
        </div>
      )}

      {/* CASE 2: Company HAI → Company Card */}
      {company && (
        <div className="text-center">
          <div
            className="card p-4 shadow"
            onClick={handleSelectCompany}
            style={{ cursor: 'pointer', width: '100%', maxWidth: '400px' }}
          >
            <h3 className="text-primary mb-3">{company.companyName}</h3>
            <p className="mb-1"><b>Number:</b> {company.companyContact}</p>
            <p className="mb-1"><b>Country:</b> {company.country}</p>
            <p className="mb-1"><b>State:</b> {company.state}</p>

            <button className="btn btn-primary mt-3 w-100">Open →</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Company;