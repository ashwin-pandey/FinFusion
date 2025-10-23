import React from 'react';
import './StatCard.css';

interface StatCardProps {
  icon: string;
  iconColor: string;
  value: string | number | React.ReactNode;
  label: string;
  subtitle?: string;
  valueColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconColor,
  value,
  label,
  subtitle,
  valueColor
}) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: iconColor }}>
        {icon}
      </div>
      <div className="stat-content">
        <h2 className="stat-value" style={{ color: valueColor }}>
          {value}
        </h2>
        <p className="stat-label">{label}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
