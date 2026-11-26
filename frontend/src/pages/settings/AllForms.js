import React, { useEffect, useState } from "react";
import DynamicFormRenderer from "../../components/DynamicFormRenderer";
import { FaEye, FaTrash } from 'react-icons/fa';

const API = "http://localhost:5000/api/forms";

const GRAD_PURPLE = "linear-gradient(135deg,#667eea,#764ba2)";
const MODULE_GRAD = {
  Item: GRAD_PURPLE,
  Party: "linear-gradient(135deg,#f093fb,#f5576c)",
};

const getCompanyId = () => {
  try {
    const c = JSON.parse(localStorage.getItem("company"));
    return c?._id || c?.id || "";
  } catch {
    return localStorage.getItem("company") || "";
  }
};

export default function AllForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [previewForm, setPreviewForm] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [draftFields, setDraftFields] = useState([]);
  const [draftModule, setDraftModule] = useState("Item");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filledValues, setFilledValues] = useState({});

  const [newFieldType, setNewFieldType] = useState("text");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const company = getCompanyId();
      const res = await fetch(
        `${API}${company ? `?company=${encodeURIComponent(company)}` : ""}`
      );
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        throw new Error(data.message || "Forms load nahi huye");
      }
      setForms(data);
    } catch (e) {
      setForms([]);
      setError(e.message || "Server se connect nahi ho paa raha.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    if (!window.confirm("Is form ko delete karna hai?")) return;
    try {
      await fetch(`${API}/${id}`, { method: "DELETE" });
      load();
    } catch {
      setError("Delete nahi ho paaya.");
    }
  };

  const openPreview = (f) => {
    setPreviewForm(f);
    setEditMode(false);
    setDraftFields(JSON.parse(JSON.stringify(f.fields || [])));
    setDraftModule(f.module);
    setNewFieldType("text");

    if (f.submissions && f.submissions.length > 0) {
      const lastSubmission = f.submissions[f.submissions.length - 1];
      setFilledValues(lastSubmission.data || {});
    } else {
      setFilledValues({});
    }
  };

  const closeModal = () => {
    if (saving || submitting) return;
    setPreviewForm(null);
    setEditMode(false);
  };

  const updateField = (key, patch) =>
    setDraftFields((p) => p.map((f) => (f.key === key ? { ...f, ...patch } : f)));

  const removeField = (key) =>
    setDraftFields((p) => p.filter((f) => f.key !== key));

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

  const saveUpdate = async () => {
    if (!draftFields.length) return alert("Kam se kam ek field chahiye");
    setSaving(true);
    try {
      const res = await fetch(`${API}/${previewForm._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: draftModule,
          fields: draftFields.map((f) => ({
            ...f,
            label: (f.label || "").trim() || f.type,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Update failed");

      alert("Form update ho gaya ✅");
      closeModal();
      load();
    } catch (e) {
      alert(e.message || "Update nahi ho paaya");
    } finally {
      setSaving(false);
    }
  };

  const submitFormData = async (values) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/${previewForm._id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: values }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Submit failed");

      setFilledValues(values);
      alert("Form submit ho gaya!");
      closeModal();
      load();
    } catch (e) {
      alert(e.message || "Submit nahi ho paaya");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: 16 }}>
        <div className="px-4 py-3 bg-white border-bottom d-flex justify-content-between align-items-center">
          <h6 className="fw-bold m-0" style={{ color: "#2c3e50" }}>All Forms</h6>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ background: "#f7f7fd" }}>
              <tr className="small text-uppercase" style={{ color: "#6b7280" }}>
                <th className="ps-4" style={{ width: 60 }}>#</th>
                <th>Form</th>
                <th>Fields</th>
                <th>Created</th>
                <th style={{ width: 220 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan="5" className="text-center text-muted py-4">Loading...</td></tr>
              )}
              {!loading && forms.length === 0 && !error && (
                <tr><td colSpan="5" className="text-center text-muted py-4">Abhi koi form nahi hai.</td></tr>
              )}
              {forms.map((f, i) => (
                <tr key={f._id}>
                  <td className="ps-4 text-muted">{i + 1}</td>
                  <td>
                    <span
                      className="badge text-white px-3 py-2"
                      style={{ background: MODULE_GRAD[f.module] || GRAD_PURPLE, borderRadius: 20 }}
                    >
                      {f.module} Form
                    </span>
                  </td>
                  <td>{f.fields.length} fields</td>
                  <td className="text-muted">{new Date(f.createdAt).toLocaleDateString()}</td>
                  <td>
                   <button
  className="btn btn-sm me-2 d-inline-flex align-items-center gap-1"
  style={{ color: "#764ba2", border: "1px solid #764ba2" }}
  onClick={() => openPreview(f)}
>
  <FaEye /> View
</button>

<button 
  className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1" 
  onClick={() => del(f._id)}
>
  <FaTrash /> Delete
</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {previewForm && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,.5)" }}
          tabIndex="-1"
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0" style={{ borderRadius: 16 }}>
              <div
                className="modal-header text-white d-flex justify-content-between align-items-center"
                style={{ background: MODULE_GRAD[previewForm.module] || GRAD_PURPLE }}
              >
                <h5 className="modal-title mb-0">
                  {previewForm.module} Form {editMode ? "— Edit" : ""}
                </h5>
                <div className="d-flex gap-2 align-items-center">
                  <button
                    type="button"
                    className="btn btn-sm btn-light fw-semibold"
                    onClick={() => setEditMode((v) => !v)}
                    disabled={saving || submitting}
                  >
                    {editMode ? "Cancel Edit" : "Edit Form"}
                  </button>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeModal}
                  />
                </div>
              </div>

              <div className="modal-body p-4">
                {editMode ? (
                  <div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Module</label>
                      <select
                        className="form-select"
                        value={draftModule}
                        onChange={(e) => setDraftModule(e.target.value)}
                      >
                        <option>Item</option>
                        <option>Party</option>
                      </select>
                    </div>

                    {draftFields.map((f) => (
                      <div
                        key={f.key}
                        className="bg-white shadow-sm p-3 mb-3"
                        style={{ borderRadius: 12, borderLeft: "4px solid #764ba2" }}
                      >
                        <div className="d-flex flex-wrap gap-2 align-items-center">
                          <span className="badge bg-light text-dark border">{f.type}</span>
                          <input
                            className="form-control form-control-sm flex-grow-1"
                            placeholder="Field label"
                            value={f.label}
                            onChange={(e) => updateField(f.key, { label: e.target.value })}
                          />
                          <div className="form-check mb-0">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`req-${f.key}`}
                              checked={!!f.required}
                              onChange={(e) => updateField(f.key, { required: e.target.checked })}
                            />
                            <label className="form-check-label small" htmlFor={`req-${f.key}`}>
                              Required
                            </label>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeField(f.key)}
                          >
                            ✕
                          </button>
                        </div>

                        {(f.type === "dropdown" || f.type === "radio") && (
                          <input
                            className="form-control form-control-sm mt-2"
                            placeholder="Options comma se: A, B, C"
                            value={(f.options || []).join(", ")}
                            onChange={(e) => {
                              const rawVal = e.target.value;
                              const newOptions = rawVal.split(',').map((s) => s.trimStart());
                              updateField(f.key, { options: newOptions });
                            }}
                            onBlur={(e) => {
                              const newOptions = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                              updateField(f.key, { options: newOptions });
                            }}
                          />
                        )}
                      </div>
                    ))}

                    <div className="d-flex align-items-center gap-2 mt-4">
                      <select
                        className="form-select form-select-sm w-auto"
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value)}
                      >
                        {[
                          { type: "text", label: "Text Input" },
                          { type: "number", label: "Number Input" },
                          { type: "radio", label: "Radio" },
                          { type: "textarea", label: "Textarea" },
                          { type: "dropdown", label: "Dropdown" },
                          { type: "button", label: "Button" },
                          { type: "checkbox", label: "Checkbox" },
                          { type: "editor", label: "Text Editor" },
                          { type: "toggle", label: "Toggle Button" },
                        ].map(ft => (
                          <option key={ft.type} value={ft.type}>{ft.label}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={addField}
                      >
                        + Add Field
                      </button>
                    </div>

                    <div className="text-end mt-4 border-top pt-3">
                      <button
                        type="button"
                        className="btn btn-success px-4"
                        onClick={saveUpdate}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save Update"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {previewForm.fields.length === 0 ? (
                      <div className="text-muted text-center py-4">
                        Is form me koi field nahi hai.
                      </div>
                    ) : (
                      <DynamicFormRenderer
                        fields={previewForm.fields}
                        initialValues={filledValues}
                        submitting={submitting}
                        onSubmit={submitFormData}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}