import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
  textClassName?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  containerClassName = "",
  textClassName = "",
  className = "",
  ...props
}) => {
  return (
    <label
      className={`flex items-center gap-2 cursor-pointer text-[#01364C] ${containerClassName}`}
    >
      <input
        type="checkbox"
        className={`w-4 h-4 border-2 border-[#002F45] rounded-sm accent-[#002F45] focus:ring-[#002F45]/30 focus:outline-none transition-colors ${className}`}
        {...props}
      />
      {label && (
        <span className={`text-sm ${textClassName}`}>{label}</span>
      )}
    </label>
  );
};

