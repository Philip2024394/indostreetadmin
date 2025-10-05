import React from 'react';
import { Partner } from '../../types';
import { ExclamationCircleIcon } from './Icons';

interface MembershipExpiryNotificationProps {
  partner: Partner | null;
  onRenew: () => void;
}

const MembershipExpiryNotification: React.FC<MembershipExpiryNotificationProps> = ({ partner, onRenew }) => {
  if (!partner || !partner.activationExpiry) {
    return null;
  }

  const expiryDate = new Date(partner.activationExpiry);
  const now = new Date();
  const timeDiff = expiryDate.getTime() - now.getTime();
  const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));

  let notification = null;

  if (daysUntilExpiry <= 0) {
    notification = {
      bgColor: 'bg-red-100',
      borderColor: 'border-red-500',
      textColor: 'text-red-800',
      title: 'Membership Expired',
      message: `Your account has expired on ${expiryDate.toLocaleDateString()}. Please renew your membership to continue receiving orders.`,
    };
  } else if (daysUntilExpiry <= 7) {
    notification = {
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-800',
      title: 'Membership Expiring Soon',
      message: `Your account will expire in ${daysUntilExpiry} day(s) on ${expiryDate.toLocaleDateString()}. Renew now to avoid service interruption.`,
    };
  }

  if (!notification) {
    return null;
  }

  return (
    <div className={`${notification.bgColor} border-l-4 ${notification.borderColor} p-4 rounded-md shadow-sm`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationCircleIcon className={`h-5 w-5 ${notification.textColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${notification.textColor}`}>{notification.title}</p>
          <p className={`mt-1 text-sm ${notification.textColor}`}>{notification.message}</p>
          <div className="mt-4">
            <button
              onClick={onRenew}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Renew Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipExpiryNotification;