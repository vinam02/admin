import React, { useState, useEffect } from "react";

export default function DynamicFormRenderer({
  fields = [],
  initialValues = {},
  onSubmit,
  submitting = false,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues(initialValues || {});
    setErrors({});
  }, [fields, initialValues]);

  // Value set karne ka function (Number/Boolean conversion ke saath)
  const setValue = (key, val, type) => {
    let finalVal = val;
    if (type === "number") {
      finalVal = val === "" ? "" : Number(val);
    }
    setValues((p) => ({ ...p, [key]: finalVal }));
  };

  const validate = () => {
    const errs = {};
    fields.forEach((f) => {
      if (f.type === "button") return;
      const v = values[f.key];
      const empty =
        v === undefined || v === "" || v === null || (Array.isArray(v) && v.length === 0);
      if (f.required && empty) errs[f.key] = "This field is required";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.(values);
  };

  const renderField = (f) => {
    const err = !!errors[f.key];
    
    const commonInput = {
      className: `form-control form-control-lg ${err ? "is-invalid" : ""}`,
      style: { fontSize: '14px', borderRadius: '8px', height: '48px' },
      value: values[f.key] ?? "",
      onChange: (e) => setValue(f.key, e.target.value, f.type),
      placeholder: `Enter ${f.label || 'value'}...`,
    };

    switch (f.type) {
      case "text":
        return <input type="text" {...commonInput} />;

      case "number":
        return (
          <div className="input-group">
            <span className="input-group-text bg-light fw-bold text-secondary" style={{ borderRadius: '8px 0 0 8px', borderRight: 'none' }}>₹</span>
            <input 
              type="number" 
              {...commonInput} 
              style={{ ...commonInput.style, borderRadius: '0 8px 8px 0' }} 
              onChange={(e) => setValue(f.key, e.target.value, "number")}
            />
          </div>
        );

      case "textarea":
        return <textarea rows={3} {...commonInput} style={{ ...commonInput.style, height: 'auto' }} />;

      case "editor":
        return <textarea rows={5} {...commonInput} style={{ ...commonInput.style, height: 'auto' }} />;

      case "dropdown":
        return (
          <select
            className={`form-select form-select-lg ${err ? "is-invalid" : ""}`}
            style={{ fontSize: '14px', borderRadius: '8px', height: '48px' }}
            value={values[f.key] ?? ""}
            onChange={(e) => setValue(f.key, e.target.value, f.type)}
          >
            <option value="">-- Select Option --</option>
            {(f.options || []).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="d-flex flex-wrap gap-3 p-2 bg-light rounded" style={{ border: '1px solid #e2e8f0', minHeight: '48px', alignItems: 'center' }}>
            {(f.options || []).map((o) => (
              <div className="form-check" key={o}>
                <input
                  className="form-check-input"
                  type="radio"
                  name={f.key}
                  id={`${f.key}-${o}`}
                  checked={values[f.key] === o}
                  onChange={() => setValue(f.key, o, f.type)}
                />
                <label className="form-check-label ms-1" style={{fontSize: '14px', cursor: 'pointer'}} htmlFor={`${f.key}-${o}`}>
                  {o}
                </label>
              </div>
            ))}
          </div>
        );

      case "checkbox":
      case "toggle":
        return (
          <div 
            className="form-control form-control-lg d-flex align-items-center px-3" 
            style={{ cursor: 'pointer', fontSize: '14px', borderRadius: '8px', height: '48px', backgroundColor: '#f8f9fa' }}
            onClick={() => setValue(f.key, !values[f.key], f.type)}
          >
            <div className="form-check form-switch mb-0 d-flex align-items-center w-100">
              <input
                className="form-check-input mb-0"
                type="checkbox"
                role="switch"
                style={{ width: '2.5em', height: '1.25em', cursor: 'pointer', marginTop: '0', flexShrink: 0 }}
                id={f.key}
                checked={!!values[f.key]}
                onChange={(e) => {
                  e.stopPropagation();
                  setValue(f.key, e.target.checked, f.type);
                }}
              />
              <label className="form-check-label ms-3 fw-semibold" style={{ cursor: 'pointer', color: '#4a5568', marginTop: '2px' }} htmlFor={f.key}>
                {values[f.key] ? "Active" : "Inactive"}
              </label>
            </div>
          </div>
        );

      case "button":
        return (
          <button type="button" className="btn btn-outline-secondary w-100" style={{borderRadius: '8px', height: '48px'}}>
            {f.label}
          </button>
        );

      case "media":
        return (
          <input
            type="file"
            className={`form-control form-control-lg ${err ? "is-invalid" : ""}`}
            style={{ fontSize: '14px', borderRadius: '8px', height: '48px' }}
            onChange={(e) => setValue(f.key, e.target.files?.[0]?.name || "", f.type)}
          />
        );

      default:
        return <input {...commonInput} />;
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="p-2">
      <div className="row g-4">
        {fields.map((f) => (
          <div className="col-12 col-md-6" key={f.key}>
            <div className="h-100 d-flex flex-column">
              
              <label className="form-label fw-bold mb-2" style={{ color: "#4a5568", fontSize: "13px", visibility: ["checkbox", "toggle", "button"].includes(f.type) ? "hidden" : "visible" }}>
                {f.label || "Label"} {f.required && <span className="text-danger ms-1">*</span>}
              </label>

              <div className="flex-grow-1">
                {renderField(f)}
              </div>

              {errors[f.key] && (
                <div className="text-danger small mt-1 fw-semibold">
                  <i className="bi bi-exclamation-circle me-1"></i> {errors[f.key]}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
                                
      <div className="d-flex justify-content-end mt-5 pt-3 border-top">
        <button
          type="submit"
          className="btn btn-primary px-5 py-2"
          style={{ 
            background: "linear-gradient(135deg,#667eea,#764ba2)", 
            border: "none", 
            borderRadius: "8px", 
            fontWeight: "600",
            height: '48px'
          }}
          disabled={submitting}
        >
          {submitting ? "Saving Data..." : "Submit Data"}
        </button>
      </div>
    </form>
  );
}