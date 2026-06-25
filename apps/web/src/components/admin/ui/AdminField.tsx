import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type BaseProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function AdminField({ label, hint, children }: BaseProps) {
  return (
    <div className="admin-field">
      <label className="admin-field-label">{label}</label>
      {children}
      {hint && <p className="admin-field-hint">{hint}</p>}
    </div>
  );
}

export function AdminInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string },
) {
  const { label, hint, className = "", ...rest } = props;
  return (
    <AdminField label={label} hint={hint}>
      <input className={`admin-input ${className}`} {...rest} />
    </AdminField>
  );
}

export function AdminTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    hint?: string;
  },
) {
  const { label, hint, className = "", ...rest } = props;
  return (
    <AdminField label={label} hint={hint}>
      <textarea className={`admin-textarea ${className}`} {...rest} />
    </AdminField>
  );
}

export function AdminSelect(
  props: SelectHTMLAttributes<HTMLSelectElement> & {
    label: string;
    hint?: string;
    children: ReactNode;
  },
) {
  const { label, hint, className = "", children, ...rest } = props;
  return (
    <AdminField label={label} hint={hint}>
      <select className={`admin-select ${className}`} {...rest}>
        {children}
      </select>
    </AdminField>
  );
}

export function AdminCheckbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="admin-checkbox">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="admin-checkbox-input"
      />
      <span className="admin-checkbox-box" />
      <span className="admin-checkbox-label">{label}</span>
    </label>
  );
}