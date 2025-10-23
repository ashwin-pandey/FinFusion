import React from 'react';
import './AccountCard.css';

interface AccountCardProps {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  icon: React.ReactNode;
  iconColor: string;
  onEdit: (account: any) => void;
  onDelete: (id: string) => void;
  formatCurrency: (amount: number) => string;
}

const AccountCard: React.FC<AccountCardProps> = ({
  id,
  name,
  type,
  balance,
  currency,
  icon,
  iconColor,
  onEdit,
  onDelete,
  formatCurrency
}) => {
  return (
    <div className="account-card">
      <div className="account-header">
        <div className="account-icon" style={{ backgroundColor: iconColor }}>
          {icon}
        </div>
        <div className="account-info">
          <h3 className="account-name">{name}</h3>
          <p className="account-type">{type.replace('_', ' ')}</p>
        </div>
        <div className="account-balance">
          <h2 className="balance-amount">{formatCurrency(balance)}</h2>
          <p className="balance-currency">{currency}</p>
        </div>
      </div>
      <div className="account-actions">
        <button className="action-btn edit-btn" onClick={() => onEdit({ id, name, type, balance, currency })}>
          Edit
        </button>
        <button className="action-btn delete-btn" onClick={() => onDelete(id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default AccountCard;
