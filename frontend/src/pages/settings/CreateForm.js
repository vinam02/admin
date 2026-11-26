import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaFont, FaHashtag, FaRegDotCircle, FaAlignLeft, FaCaretSquareDown,
  FaMousePointer, FaCheckSquare, FaEdit, FaToggleOn, FaPlus, 
} from 'react-icons/fa';

const API = 'http://localhost:5000/api/forms';
const GRAD = 'linear-gradient(135deg,#667eea,#764ba2)';

const ALL_FIELDS = [
  { type: 'text', label: 'Text Input', icon: <FaFont /> },
  { type: 'number', label: 'Number Input', icon: <FaHashtag /> },
  { type: 'radio', label: 'Radio', icon: <FaRegDotCircle /> },
  { type: 'textarea', label: 'Textarea', icon: <FaAlignLeft /> },
  { type: 'dropdown', label: 'Dropdown', icon: <FaCaretSquareDown /> },
  { type: 'button', label: 'Button', icon: <FaMousePointer /> },                           
  { type: 'checkbox', label: 'Checkbox', icon: <FaCheckSquare /> },
  { type: 'editor', label: 'Text Editor', icon: <FaEdit /> },
  { type: 'toggle', label: 'Toggle Button', icon: <FaToggleOn /> },

];

const ICON = Object.fromEntries(ALL_FIELDS.map((f) => [f.type, f.icon]));
// 👇 MODULE_DEFAULT_FIELDS me Party add karein
const MODULE_DEFAULT_FIELDS = {
  Item: [
    { type: 'text',   label: 'Item Name', key: 'itemName', required: true,  options: [] },
    { type: 'text',   label: 'Item Code', key: 'itemCode', required: true,  options: [] },
    { type: 'text',   label: 'HSN Code',  key: 'hsnCode', required: true,  options: [] },
    { type: 'dropdown', label: 'UOM', key: 'uom', required: true, options: ['pc', 'Nos', 'Kg', 'Lit', 'Box'] },
    { type: 'dropdown', label: 'Tax', key: 'tax', required: true, options: ['0%', '5%', '12%', '18%', '28%'] },
    { type: 'number', label: 'P.Price', key: 'pPrice', required: true, options: [] },
    { type: 'number', label: 'S.Price', key: 'sPrice', required: true, options: [] },
    { type: 'number', label: 'MRP', key: 'mrp', required: true, options: [] },
    { type: 'number', label: 'Opening Stock', key: 'openingStock', required: true, options: [] },
  ],
  // 👇 Party ke default fields (Party.js se match karte hue)
  Party: [
    { type: 'text', label: 'Party Name', key: 'partyName', required: true, options: [] },
    { type: 'text', label: 'Party Number', key: 'partyNumber', required: true, options: [] },
    { type: 'dropdown', label: 'Group', key: 'group', required: true, options: ['Sundry Creditor', 'Sundry Debtor'] },
    { type: 'text', label: 'State', key: 'state', required: true, options: [] },
    { type: 'textarea', label: 'Address', key: 'address', required: true, options: [] },
    
  ],

};  
    
const buildFields = (moduleName) =>
  (MODULE_DEFAULT_FIELDS[moduleName] || []).map((f) => ({
    type: f.type,
    typeName: f.type,
    key: f.key, // 👈 Yahan key set ki
    label: f.label,
    required: f.required,
    options: f.options || [],
  }));

const getCompanyId = () => {
  try {
    const c = JSON.parse(localStorage.getItem('company'));
    return c?._id || c?.id || '';
  } catch {
    return localStorage.getItem('company') || '';
  }
};

const iconBox = {
  width: 32, height: 32, borderRadius: 8, background: GRAD, color: '#fff',
  fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center',
  justifyContent: 'center', flexShrink: 0,
};

export default function CreateForm() {
  const [module, setModule] = useState('Item');
  const [fields, setFields] = useState(() => buildFields('Item'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Naya field add karne ka function
  const addField = (f) => {
    const randomId = Math.random().toString(36).slice(2, 7);
    setFields((p) => [
      ...p,        
      {
        type: f.type,
        typeName: f.label,
        key: `${f.type}_${Date.now()}_${randomId}`, // Naye field ki key random hogi
        label: '',
        required: false,
        options: [],
      },
    ]);         
  };           

  const update = (key, patch) => 
    setFields((p) => p.map((f) => (f.key === key ? { ...f, ...patch } : f)));

  const remove = (key) => setFields((p) => p.filter((f) => f.key !== key));

  const handleModuleChange = (e) => {
    const newModule = e.target.value;
    setModule(newModule);
    setFields(buildFields(newModule)); 
  };

  const save = async () => {
    setError('');
    if (!fields.length) return setError('Kam se kam ek field add karo');

    const payload = {
      module,
      company: getCompanyId(),
      fields: fields.map(({ typeName, ...f }) => ({ ...f, label: f.label.trim() || typeName })),
    };

    try {
      setSaving(true);
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), 
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Save failed');

      setFields(buildFields(module));
      navigate('/dashboard/settings/all-forms');
    } catch (e) {
      setError(e.message || 'Server se connection nahi ho paa raha.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold m-0" style={{ color: '#2c3e50' }}>Create Form</h5>
       <select
  className="form-select w-auto shadow-sm border-0"
  value={module}
  onChange={handleModuleChange}
>
<option>Item</option>
<option>Party</option>

</select>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="row g-4">
        <div className="col-12 col-md-4 col-lg-3">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 16, background: '#f7f8fc' }}>
            <div className="card-body">
              <h6 className="fw-bold mb-3" style={{ color: '#2c3e50' }}>All Fields</h6>  
              <div className="d-grid gap-2">
                {ALL_FIELDS.map((f) => (
                  <button
                    key={f.type}
                    type="button"
                    className="btn bg-white border-0 shadow-sm d-flex align-items-center gap-2 text-start py-2"
                    style={{ borderRadius: 10 }}
                    onClick={() => addField(f)}
                  >
                    <span style={iconBox}>{f.icon}</span>
                    <span className="flex-grow-1 small fw-semibold" style={{ color: '#2c3e50' }}>
                      {f.label}
                    </span>
                    <FaPlus size={12} style={{ color: '#764ba2' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-8 col-lg-9">
          <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: 16 }}>
            <div
              className="d-flex justify-content-between align-items-center px-4 py-3 text-white"
              style={{ background: GRAD }}
            >
              <h6 className="m-0 fw-bold">{module} Form</h6>
              <span className="badge rounded-pill bg-light text-dark">{fields.length} fields</span>
            </div>

            <div className="card-body p-4">
              {fields.length === 0 ? (
                <div
                  className="text-center text-muted py-5 px-3"
                  style={{ border: '2px dashed #cfd3ee', borderRadius: 12, background: '#f7f7fd' }}
                >
                  Select a field from "All Fields" to add it to this form.
                </div>
              ) : (
                <div className="row">
                  {fields.map((f) => (
                    <div className="col-12 col-md-6 mb-3" key={f.key}>
                      <div
                        className="bg-white shadow-sm p-3 h-100"
                        style={{ borderRadius: 12, borderLeft: '4px solid #764ba2' }}
                      >
                        <div className="d-flex flex-wrap gap-2 align-items-center">
                          <span style={iconBox}>{ICON[f.type]}</span>
                          <span className="badge bg-light text-dark border">{f.typeName || f.type}</span>
                          <input
                            className="form-control form-control-sm w-auto flex-grow-1"
                            placeholder="Field label (e.g. Item Name)"
                            value={f.label}
                            onChange={(e) => update(f.key, { label: e.target.value })}
                          />
                        </div>
                        
                        <div className="d-flex align-items-center mt-2 gap-2">
                          <div className="form-check mb-0">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`req-${f.key}`}
                              checked={f.required}
                              onChange={(e) => update(f.key, { required: e.target.checked })}
                            />
                            <label className="form-check-label small" htmlFor={`req-${f.key}`}>
                              Required
                            </label>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger ms-auto"
                            onClick={() => remove(f.key)}
                          >
                            ✕
                          </button>
                        </div>

                        {(f.type === 'dropdown' || f.type === 'radio') && (
                          <input
                            className="form-control form-control-sm mt-2"
                            placeholder="Options comma se likho: A, B, C"
                            value={(f.options || []).join(', ')}
                            onChange={(e) => {
                              const rawVal = e.target.value;
                              const newOptions = rawVal.split(',').map((s) => s.trimStart());
                              update(f.key, { options: newOptions });
                            }}
                            onBlur={(e) => {
                              const newOptions = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                              update(f.key, { options: newOptions });
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-3 text-end border-top bg-white">
              <button
                type="button"
                className="btn text-white px-4"
                style={{ background: GRAD, border: 'none', borderRadius: 8 }}
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}