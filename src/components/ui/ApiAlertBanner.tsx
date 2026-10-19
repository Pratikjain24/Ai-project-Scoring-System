import React from 'react';
import { useApiAlert } from '../../context/ApiAlertContext';
import { ApiErrorAlert } from './ApiErrorAlert';

export const ApiAlertBanner: React.FC = () => {
  const { alerts, dismissAlert, retryQuery } = useApiAlert();

  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="sticky top-0 z-50 flex flex-col gap-1 w-full shadow-2xl">
      {alerts.slice(0, 3).map((alert) => (
        <ApiErrorAlert
          key={alert.id}
          error={{
            name: 'ApiError',
            message: alert.message,
            code: alert.code,
            status: alert.status,
            endpoint: alert.endpoint,
            timestamp: alert.timestamp,
          } as any}
          title={alert.title}
          variant="banner"
          onRetry={alert.retry || (alert.queryKey ? () => retryQuery(alert.queryKey) : undefined)}
          onDismiss={() => dismissAlert(alert.id)}
        />
      ))}
    </div>
  );
};
