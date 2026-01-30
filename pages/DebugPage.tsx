import React, { useEffect, useState } from 'react';

interface DebugPageProps {
  lang: 'en' | 'ar';
}

const DebugPage: React.FC<DebugPageProps> = ({ lang }) => {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // SECURITY: Check sessionStorage first for token
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const info = {
      timestamp: new Date().toISOString(),
      sessionStorage_token: sessionStorage.getItem('token') ? 'EXISTS' : 'MISSING',
      localStorage_token: localStorage.getItem('token') ? 'EXISTS' : 'MISSING',
      token: token ? 'EXISTS' : 'MISSING',
      tokenLength: token?.length || 0,
      user: null as any,
      userRole: null as any,
      errorLog: [] as any[],
    };

    try {
      const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
      if (userStr) {
        info.user = JSON.parse(userStr);
        info.userRole = info.user?.role;
      }
    } catch (e) {
      info.user = 'PARSE_ERROR';
    }

    try {
      info.errorLog = JSON.parse(localStorage.getItem('error_log') || '[]');
    } catch (e) {
      info.errorLog = [];
    }

    setDebugInfo(info);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-bold mb-6">
        {lang === 'ar' ? 'صفحة التشخيص' : 'Debug Page'}
      </h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Auth Status</h2>
        <div className="space-y-2 font-mono text-sm">
          <p><strong>Token:</strong> {debugInfo.token} ({debugInfo.tokenLength} chars)</p>
          <p><strong>User Role:</strong> {debugInfo.userRole || 'N/A'}</p>
          <p><strong>User Email:</strong> {debugInfo.user?.email || 'N/A'}</p>
          <p><strong>User Name:</strong> {debugInfo.user?.name || 'N/A'}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Full User Object</h2>
        <pre className="bg-slate-100 p-4 rounded overflow-auto text-xs">
          {JSON.stringify(debugInfo.user, null, 2)}
        </pre>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Error Log ({debugInfo.errorLog?.length || 0} entries)</h2>
        <div className="space-y-2">
          {debugInfo.errorLog?.map((log: any, i: number) => (
            <div key={i} className="bg-red-50 p-3 rounded text-xs">
              <p><strong>{log.timestamp}</strong> - {log.type}</p>
              <pre className="mt-1 text-red-700">{log.details}</pre>
            </div>
          ))}
          {debugInfo.errorLog?.length === 0 && (
            <p className="text-green-600">No errors logged</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => localStorage.removeItem('error_log')}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Error Log
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default DebugPage;
