import React from "react";
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react";

export default function AlertBanner({ type = "red", title, children }) {
  const icons = {
    red: <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />,
    yellow: <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />,
    blue: <Info size={18} style={{ flexShrink: 0, marginTop: 2 }} />,
    green: <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 2 }} />,
  };
  return (
    <div className={`alert-box alert-${type}`}>
      {icons[type]}
      <div>
        {title && <div style={{ fontWeight: 700, marginBottom: 2 }}>{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}