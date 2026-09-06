import React from 'react';
import { useTranslation } from 'react-i18next';

function ErrorFallback() {
  const { t } = useTranslation('common');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: '#ef4444' }}>
          {t('error_boundary.title')}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '24px' }}>
          {t('error_boundary.message')}
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            backgroundColor: '#0f172a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {t('error_boundary.return_button', { defaultValue: t('actions.return_to_dashboard') })}
        </button>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
