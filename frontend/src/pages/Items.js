import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaPlus, FaBoxOpen, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function Items() {
  const [items, setItems] = useState([]);
  const [formConfigId, setFormConfigId] = useState(null);
  const [formFields, setFormFields] = useState([]); 
  const [draftFields, setDraftFields] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFieldEditMode, setIsFieldEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({});
  
  const [newFieldType, setNewFieldType] = useState("text"); 

  const API = 'http://localhost:5000/api';
  const GRAD_PURPLE = "linear-gradient(135deg,#667eea,#764ba2)";

  const getCompanyId = () => {
    try {
      const c = JSON.parse(localStorage.getItem('company'));
      return c?._id || c?.id || '';
    } catch {
      return localStorage.getItem('company') || '';
    }
  };

  const fetchFormFields = async () => {    
    try {
      const company = getCompanyId();
      const res = await axios.get(`${API}/forms${company ? `?company=${company}` : ''}`);
      const itemForm = res.data.find((f) => f.module === 'Item');
      if (itemForm && itemForm.fields?.length) {
        setFormFields(itemForm.fields);
        setFormConfigId(itemForm._id);
      }
    } catch (e) {
      console.error('Fields load error:', e.message);
    }
  };

  const fetchItems = async () => {
    const res = await axios.get(`${API}/items`);
    setItems(res.data);
  };

  useEffect(() => {
    fetchFormFields();
    fetchItems();

    const onFocus = () => { fetchFormFields(); fetchItems(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, company: getCompanyId() };

    if (isEditMode) {
      await axios.put(`${API}/items/${editId}`, payload);
      alert('Item Updated Successfully!');
    } else {
      await axios.post(`${API}/items`, payload);
      alert('Item Added Successfully!');
    }
    setIsModalOpen(false);
    setIsEditMode(false);
    setIsFieldEditMode(false);
    setEditId(null);
    setFormData({});
    fetchItems();
  };

  const handleEditClick = (item) => {
    setFormData(item);
    setEditId(item._id);
    setIsEditMode(true);
    setIsFieldEditMode(false); 
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await axios.delete(`${API}/items/${id}`);
      fetchItems();
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setIsFieldEditMode(false);
    setFormData({});
    setIsModalOpen(true);
  };

  const startFieldEditing = () => {
    setDraftFields(JSON.parse(JSON.stringify(formFields))); 
    setIsFieldEditMode(true);
  };

  const addField = () => {
    const randomId = Math.random().toString(36).slice(2, 7);
    setDraftFields((p) => [
      ...p,
      {
        type: newFieldType,
        label: "",
        key: `${newFieldType}_${Date.now()}_${randomId}`,
        required: false,
        options: [],
      },
    ]);
  };

  const updateField = (key, patch) =>
    setDraftFields((p) => p.map((f) => (f.key === key ? { ...f, ...patch } : f)));

  const removeField = (key) =>
    setDraftFields((p) => p.filter((f) => f.key !== key));

  const saveFields = async () => {
    if (!formConfigId) return alert("Form config nahi mila!");
    try {
      await axios.put(`${API}/forms/${formConfigId}/fields`, {
        fields: draftFields.map((f) => ({
          ...f,
          label: (f.label || "").trim() || f.type,
        })),
      });
      alert("Fields update ho gayi! ✅");
      setIsFieldEditMode(false);
      fetchFormFields(); 
    } catch (error) {
      alert("Fields save nahi hui!");
    }
  };

  const renderInput = (f) => {
    const commonProps = {
      name: f.key,
      value: formData[f.key] ?? '',
      onChange: handleChange,
      required: f.required,
      className: 'form-control',
      style: { borderRadius: '8px', fontSize: '14px' }
    };

    switch (f.type) {
      case 'dropdown':
        return (
          <select {...commonProps} className="form-select">
            <option value="">Select {f.label}</option>
            {(f.options || []).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="d-flex flex-wrap gap-3 p-2 border rounded" style={{background: '#f8f9fa'}}>
            {(f.options || []).map((o) => (
              <div className="form-check" key={o}>
                <input className="form-check-input" type="radio" name={f.key} id={`${f.key}-${o}`} value={o} checked={formData[f.key] === o} onChange={handleChange}/>
                <label className="form-check-label small" htmlFor={`${f.key}-${o}`}>{o}</label>
              </div>
            ))}
          </div>
        );
      case 'textarea':
      case 'editor':
        return <textarea {...commonProps} rows={3} />;
      case 'number':
        return <input {...commonProps} type="number" />;
      case 'checkbox':
      case 'toggle':
        return (
          <div className="form-check form-switch">
            <input type="checkbox" name={f.key} className="form-check-input" checked={!!formData[f.key]} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.checked })}/>
          </div>
        );
      case 'button':
        return <button type="button" className="btn btn-outline-secondary w-100" style={{borderRadius: '8px'}}>{f.label}</button>;
      default:
        return <input {...commonProps} type="text" />;
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* HEADER SECTION (Dashboard Style) */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div style={{
            width: '50px', height: '50px', borderRadius: '14px',
            background: GRAD_PURPLE, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', boxShadow: '0 4px 12px rgba(118,75,162,0.3)'
          }}>
            <FaBoxOpen />
          </div>
          <h2 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>Item List</h2>
        </div>
        <button className="btn text-white d-flex align-items-center gap-2" onClick={openAddModal}   style={{ background: GRAD_PURPLE, borderRadius: '8px', padding: '10px 20px', fontWeight: '600', border: 'none' }}>          
          <FaPlus /> Add Item
        </button>
      </div>
        
      {/* TABLE SECTION (AllForms Style) */}
      <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: 16 }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 text-center">
            <thead style={{ background: "#f7f7fd" }}>
              <tr className="small text-uppercase" style={{ color: "#6b7280" }}>
                {formFields.map((f) => (
                  <th key={f.key} className="py-3">{f.label}</th>
                ))}
                <th className="py-3" style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={formFields.length + 1} className="text-center text-muted py-4">No items found.</td></tr>
              )}
              {items.map((item) => (
                <tr key={item._id}>
                  {formFields.map((f) => {
                    const val = item[f.key];
                    return (
                      <td key={f.key} className="text-secondary fw-semibold">
                        {typeof val === 'boolean' ? (val ? <FaCheckCircle className="text-success"/> : <FaTimesCircle className="text-danger"/>) : val ?? '-'}
                      </td>
                    );
                  })}
                  <td>
                  <button 
  className="btn btn-sm me-2" 
  style={{ background: '#f3e8ff', color: '#764ba2', border: 'none' }} 
  onClick={() => handleEditClick(item)} 
  title="Update Item"
>
  <FaEdit />
</button>

<button 
  className="btn btn-sm" 
  style={{ background: '#fee2e2', color: '#ef4444', border: 'none' }} 
  onClick={() => handleDeleteClick(item._id)} 
  title="Delete Item"
>
  <FaTrash />
</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL SECTION */}
      {isModalOpen && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: isFieldEditMode ? '700px' : '500px' }}>
            <div className="modal-content border-0" style={{ borderRadius: 16 }}>
              
              <div className="modal-header text-white d-flex justify-content-between align-items-center" style={{ background: GRAD_PURPLE, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                <h5 className="modal-title mb-0 fw-bold">{isEditMode ? 'Update Item' : 'Create Item'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted small fw-semibold"></span>
                  <button type="button" className={`btn btn-sm ${isFieldEditMode ? 'btn-danger' : 'btn-outline-primary'}`} onClick={() => isFieldEditMode ? setIsFieldEditMode(false) : startFieldEditing()} style={{ borderRadius: '6px' }}>
                    {isFieldEditMode ? 'Cancel Edit' : ' Edit Fields'}
                  </button>
                </div>

                {isFieldEditMode ? (
                  <div>                 
                                                        
                    {draftFields.map((f) => (
                      <div key={f.key} className="bg-light p-3 mb-2 rounded border" style={{ borderLeft: '4px solid #764ba2' }}>
                        <div className="d-flex gap-2 align-items-center">
                          <span className="badge bg-secondary">{f.type}</span>
                          <input className="form-control form-control-sm" placeholder="Field label" value={f.label} onChange={(e) => updateField(f.key, { label: e.target.value })} />
                          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeField(f.key)} title="Delete Field">
                            <FaTrash />
                          </button>
                        </div>
                        {(f.type === "dropdown" || f.type === "radio") && (
                          <input className="form-control form-control-sm mt-2" placeholder="Options comma se: A, B, C" value={(f.options || []).join(", ")} onChange={(e) => updateField(f.key, { options: e.target.value.split(',').map(s => s.trim()) })}/>
                        )}
                      </div>
                    ))}

                    <div className="d-flex align-items-center gap-2 mt-3 border-top pt-3">
                      <select className="form-select form-select-sm w-auto" value={newFieldType} onChange={(e) => setNewFieldType(e.target.value)}>
                        <option value="text">Text Input</option>
                        <option value="number">Number Input</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="textarea">Textarea</option>
                        <option value="button">Button</option>
                      </select>
                      <button type="button" className="btn btn-outline-success btn-sm" onClick={addField}>+ Add Field</button>
                      <button type="button" className="btn btn-success btn-sm ms-auto px-4" onClick={saveFields}>Save Fields</button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {formFields.map((f) => (
                      <div className="mb-3" key={f.key}>
                        <label className="form-label small fw-bold text-secondary">
                          {f.label} {f.required && <span className="text-danger">*</span>}
                        </label>
                        {renderInput(f)}
                      </div>
                    ))}

                    <div className="d-flex gap-3 mt-4">
                      <button type="submit" className="btn text-white w-50" style={{ background: GRAD_PURPLE, borderRadius: '8px', fontWeight: '600' }}>
                        {isEditMode ? 'Update Item' : 'Save Item'}
                      </button>
                      <button type="button" className="btn btn-light border w-50" style={{ borderRadius: '8px' }} onClick={() => setIsModalOpen(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Items;