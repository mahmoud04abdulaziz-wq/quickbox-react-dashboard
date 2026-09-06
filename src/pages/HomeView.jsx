import React from 'react';
import { useTranslation } from 'react-i18next';

function HomeView() {
  const { t } = useTranslation('common');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '600px', color: '#94a3b8' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'normal', marginBottom: '8px' }}>{t('home.title')}</h1>
      <p style={{ fontSize: '14px' }}>{t('home.clear_message')}</p>
    </div>
  );
}

export default HomeView;
