import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Card({ children, title, subtitle, className = '' }: CardProps) {
  return (
    <div className={`card-modern ${className}`}>
      {(title || subtitle) && (
        <div className="card-header-modern">
          {title && <h3 className="card-title-modern">{title}</h3>}
          {subtitle && <p className="card-subtitle-modern">{subtitle}</p>}
        </div>
      )}
      <div className="card-content-modern">{children}</div>
    </div>
  );
}
