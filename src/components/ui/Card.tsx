import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className = '', title, subtitle }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-[var(--border)] overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)]">
          {title && <h3 className="text-xl font-bold text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-blue-100 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
