import { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const buildInitialState = (fields, initialValues = {}) =>
  Object.fromEntries(fields.map((f) => [f.name, initialValues[f.name] ?? ""]));

/**
 * EntityForm — generic controlled form.
 * Props:
 *   title       string
 *   fields      { name, placeholder, type?, options?, selectPlaceholder?, disabled?, fullWidth? }[]
 *   submitLabel string
 *   validate    (formData: object) => Record<string, string>
 *   onSubmit    async (formData: object) => void   — called with the form values
 *   onSuccess      () => void                         — called after a successful submit
 *   initialValues  Record<string, string>             — optional seed values for edit forms
 */
const EntityForm = ({ title, fields, submitLabel = "Save", validate, onSubmit, onSuccess, initialValues }) => {
  const [formData, setFormData]   = useState(() => buildInitialState(fields, initialValues));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }

      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSubmit) return;

    const validationErrors = typeof validate === "function" ? validate(formData) : {};
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError("");
      setSuccessMsg("");
      return;
    }

    setError("");
    setSuccessMsg("");
    setFieldErrors({});
    setSubmitting(true);

    try {
      await onSubmit(formData);
      setSuccessMsg("Saved successfully!");
      setFormData(buildInitialState(fields));
      onSuccess?.();
    } catch (err) {
      const msg = err?.statusCode === 409
        ? err.message
        : err?.response?.data?.message ||
          err?.message ||
          "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 px-5 pb-3 pt-5">
        <CardTitle className="text-base font-bold text-slate-800">{title}</CardTitle>
      </CardHeader>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.name}
                className={`space-y-1 ${field.fullWidth ? "sm:col-span-2" : ""}`}
              >
                <Label
                  htmlFor={`ef-${field.name}`}
                  className="text-xs text-slate-500"
                >
                  {field.placeholder}
                </Label>
                {field.type === "select" ? (
                  <select
                    id={`ef-${field.name}`}
                    name={field.name}
                    value={formData[field.name] ?? ""}
                    onChange={handleChange}
                    disabled={Boolean(field.disabled)}
                    aria-invalid={Boolean(fieldErrors[field.name])}
                    className={`flex h-10 w-full rounded-lg bg-white px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/30 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${
                      fieldErrors[field.name] ? "border border-red-400" : "border border-slate-200"
                    }`}
                  >
                    <option value="">{field.selectPlaceholder || `Select ${field.placeholder}`}</option>
                    {(field.options || []).map((option) => (
                      <option key={option._id} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={`ef-${field.name}`}
                    name={field.name}
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    value={formData[field.name] ?? ""}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors[field.name])}
                    className={`text-sm focus-visible:ring-blue-400/30 focus-visible:ring-offset-0 ${
                      fieldErrors[field.name] ? "border-red-400" : "border-slate-200"
                    }`}
                  />
                )}
                {fieldErrors[field.name] && (
                  <p className="text-xs text-red-600">{fieldErrors[field.name]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
          {successMsg && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <p className="text-xs text-emerald-600">{successMsg}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || !onSubmit}
            className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200/50 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </span>
            ) : (
              submitLabel
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EntityForm;
