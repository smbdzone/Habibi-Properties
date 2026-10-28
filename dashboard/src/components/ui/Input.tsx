import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#002F45] mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 border text-gray-900 border-gray-300 rounded-lg bg-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#002F45]/30 focus:border-[#002F45] hover:border-[#002F45] ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

