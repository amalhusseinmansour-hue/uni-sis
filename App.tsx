
import React, { useState, useEffect, useRef } from 'react';

// Version check - if you see this in console, the new code is running
console.log('🚀 App.tsx v5.0 - Enhanced debugging + protected role switch');

// Error log storage helper
const logError = (type: string, details: any) => {
  try {
    const logs = JSON.parse(localStorage.getItem('error_log') || '[]');
    logs.push({
      timestamp: new Date().toISOString(),
      type,
      details: typeof details === 'object' ? JSON.stringify(details) : String(details),
    });
    // Keep only last 50 errors
    localStorage.setItem('error_log', JSON.stringify(logs.slice(-50)));
  } catch (e) {
    // Ignore storage errors
  }
};

// Clear old error logs on load (keep for debugging)
console.log('[App] Previous errors:', JSON.parse(localStorage.getItem('error_log') || '[]'));

// Global error handler to catch any unhandled errors
window.onerror = function(message, source, lineno, colno, error) {
  console.error('🔴 [Global Error]', { message, source, lineno, colno, error });
  logError('window.onerror', { message, source, lineno, colno, errorMessage: error?.message });
  // Don't let errors cause logout
  return true; // Prevents default error handling
};

window.onunhandledrejection = function(event) {
  console.error('🔴 [Unhandled Promise Rejection]', event.reason);
  logError('unhandledrejection', { reason: event.reason?.message || String(event.reason) });
  event.preventDefault(); // Prevents default handling
};
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Academic from './pages/Academic';
import Admissions from './pages/Admissions';
import Lecturer from './pages/Lecturer';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Reports from './pages/Reports';
import ExamsPage from './pages/ExamsPage';
import AttendancePage from './pages/AttendancePage';
import SchedulePage from './pages/SchedulePage';
import SupportPage from './pages/SupportPage';
import StudentRequestsPage from './pages/StudentRequestsPage';
import CourseRegistration from './pages/CourseRegistration';
import IDCardPage from './pages/IDCardPage';
import TranscriptPage from './pages/TranscriptPage';
import AdvisingPage from './pages/AdvisingPage';
import CertificatesPage from './pages/CertificatesPage';
import AcademicWarningsPage from './pages/AcademicWarningsPage';
import DebugPage from './pages/DebugPage';
import SimpleStudentDashboard from './pages/SimpleStudentDashboard';
import SplashScreen from './components/SplashScreen';
import ErrorBoundary from './components/ErrorBoundary';
// Admin Pages
import {
  TableBuilder,
  FormBuilder,
  ReportBuilder,
  SystemSettings,
  MenuDashboardManager,
  UserManagement,
  BrandingSettings,
  RolesPermissions,
} from './pages/admin';
import AiAssistant from './components/AiAssistant';
import PWAInstallPrompt from './components/PWAInstallPrompt';
// Mock data removed - using real API data only
import { UserRole } from './types';
import { authAPI } from './api';
import { preferencesAPI } from './api/preferences';
import { ConfigProvider } from './context/ConfigContext';
import { BrandingProvider } from './context/BrandingContext';

// Helper to get user profile data from API response
const getUserProfileData = (user: any) => {
  return {
    ...user,
    name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User',
    nameEn: user?.name_en || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    nameAr: user?.name_ar || `${user?.firstNameAr || ''} ${user?.lastNameAr || ''}`.trim(),
    studentId: user?.student_id || user?.id || 'N/A',
    role: user?.role,
  };
};

// Track App mounts globally
let appMountCount = 0;

const App: React.FC = () => {
  appMountCount++;
  console.log(`[App] 🔵 Component mounting/rendering - Mount count: ${appMountCount}`);

  // Log render on first mount
  useEffect(() => {
    logError('app_mounted', { mountCount: appMountCount });
    console.log(`[App] 🟢 Component MOUNTED - count: ${appMountCount}`);

    return () => {
      console.log(`[App] 🔴 Component UNMOUNTING!`);
      logError('app_unmounted', { mountCount: appMountCount });
    };
  }, []);

  // Ref to track if we're in the middle of a role switch (prevents race conditions)
  const isRoleSwitchingRef = useRef(false);

  // Ref to store the latest auth state (for recovery)
  const authStateRef = useRef<{ isAuthenticated: boolean; user: any }>({
    isAuthenticated: false,
    user: null,
  });

  // Initialize language - default to 'ar' (Arabic) for RTL
  const [lang, setLang] = useState<'en' | 'ar'>(() => {
    // Force reset to Arabic (RTL) - remove this after first deploy
    const rtlReset = localStorage.getItem('rtl_reset_v1');
    if (!rtlReset) {
      localStorage.setItem('app_language', 'ar');
      localStorage.setItem('rtl_reset_v1', 'true');
      // Set document direction immediately
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
      return 'ar';
    }

    const savedLang = localStorage.getItem('app_language');
    const finalLang = savedLang === 'en' ? 'en' : 'ar';
    // Set document direction immediately during initialization
    document.documentElement.dir = finalLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = finalLang;
    return finalLang;
  });
  const [showSplash, setShowSplash] = useState(true);

  // Initialize auth state from localStorage immediately to prevent logout on re-mount
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const hasAuth = !!(token && userStr);
    console.log('[App] Initial auth state from localStorage:', hasAuth);
    return hasAuth;
  });

  const [currentUser, setCurrentUser] = useState<any>(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('[App] Initial user from localStorage:', user?.email, 'role:', user?.role);
        // Pre-sync the ref (will be fully synced in useEffect)
        authStateRef.current = { isAuthenticated: true, user };
        return user;
      } catch (e) {
        console.error('[App] Failed to parse initial user:', e);
        return null;
      }
    }
    return null;
  });

  // Handle language change with persistence (localStorage + database)
  const handleSetLang = async (newLang: 'en' | 'ar') => {
    setLang(newLang);
    localStorage.setItem('app_language', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;

    // Save to database if authenticated
    if (isAuthenticated) {
      try {
        await preferencesAPI.updateSingle('language', newLang);
        console.log('[App] Language preference saved to DB:', newLang);
      } catch (error) {
        console.error('[App] Failed to save language preference:', error);
      }
    }
  };

  // Set document direction based on language
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Verify auth state on mount (backup check)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    console.log('[App] Mount check - token exists:', !!token, ', user exists:', !!userStr, ', isAuthenticated:', isAuthenticated);

    // If localStorage has auth but state doesn't, restore it
    if (token && userStr && !isAuthenticated) {
      try {
        const user = JSON.parse(userStr);
        console.log('[App] Restoring missing auth state:', user.email);
        setCurrentUser(user);
        setIsAuthenticated(true);
        // Update refs
        authStateRef.current = { isAuthenticated: true, user };
      } catch (error) {
        console.error('[App] Failed to restore auth:', error);
      }
    } else if (token && userStr && isAuthenticated && currentUser) {
      // Sync refs with current state
      authStateRef.current = { isAuthenticated: true, user: currentUser };
    }
  }, []);

  // Handle Splash Screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (user: any) => {
    console.log('[App] ✅ handleLogin called for:', user?.email);
    setCurrentUser(user);
    setIsAuthenticated(true);

    // Update refs
    authStateRef.current = { isAuthenticated: true, user };

    // Load user preferences from database
    try {
      const prefs = await preferencesAPI.get();
      console.log('[App] Loaded preferences from DB:', prefs);

      // Apply language preference
      if (prefs.language) {
        setLang(prefs.language);
        localStorage.setItem('app_language', prefs.language);
        document.documentElement.dir = prefs.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = prefs.language;
      }

      // Store preferences in localStorage as cache
      localStorage.setItem('user_preferences', JSON.stringify(prefs));
    } catch (error) {
      console.error('[App] Failed to load preferences:', error);
      // Use localStorage cache if API fails
    }
  };

  // PROTECTED: Logout with stack trace and intentionality check
  const handleLogout = () => {
    console.log('[App] 🚪 handleLogout called!');
    console.trace('[App] 📍 Logout stack trace:');

    // Log the call stack to identify unintended logouts
    const stack = new Error().stack;
    console.log('[App] Full stack:', stack);

    // Check if this is being called from the logout button (intentional)
    const isFromButton = stack?.includes('onClick') || stack?.includes('Sidebar');

    if (!isFromButton) {
      console.warn('[App] ⚠️ Logout called from unexpected source! Ignoring...');
      console.warn('[App] Stack:', stack);
      // Don't actually logout if it wasn't from the button
      return;
    }

    console.log('[App] ✅ Intentional logout confirmed');
    logError('intentional_logout', { timestamp: new Date().toISOString() });
    authAPI.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // For demo: allow role switching (remove in production)
  // PROTECTED: Role switch with multiple safeguards
  const setUserRole = (role: UserRole) => {
    try {
      console.log('[App] 🔄 setUserRole called with:', role);
      logError('role_switch_started', { newRole: role, currentRole: currentUser?.role });

      // Prevent concurrent role switches
      if (isRoleSwitchingRef.current) {
        console.warn('[App] ⚠️ Role switch already in progress, ignoring...');
        return;
      }

      isRoleSwitchingRef.current = true;

      console.log('[App] Current user before switch:', currentUser?.email, 'role:', currentUser?.role);

      // Safety check 1: Ensure we have a current user (try ref first, then state, then localStorage)
      let userToSwitch = currentUser || authStateRef.current.user;

      if (!userToSwitch) {
        console.warn('[App] ⚠️ No currentUser in state, trying localStorage...');
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            userToSwitch = JSON.parse(userStr);
            console.log('[App] 🔧 Recovered user from localStorage:', userToSwitch?.email);
          } catch (e) {
            console.error('[App] ❌ Failed to parse user from localStorage:', e);
            isRoleSwitchingRef.current = false;
            return;
          }
        } else {
          console.error('[App] ❌ No user found anywhere! Aborting role switch.');
          isRoleSwitchingRef.current = false;
          return;
        }
      }

      // Safety check 2: Ensure role is valid
      if (!role || !Object.values(UserRole).includes(role)) {
        console.error('[App] ❌ Invalid role:', role);
        isRoleSwitchingRef.current = false;
        return;
      }

      // Safety check 3: Don't switch to same role
      if (userToSwitch.role === role) {
        console.log('[App] ⚠️ Same role, skipping switch');
        isRoleSwitchingRef.current = false;
        return;
      }

      console.log('[App] ✅ Switching role from', userToSwitch.role, 'to', role);

      // Create updated user with new role
      const updatedUser = { ...userToSwitch, role };

      // Update localStorage FIRST to ensure persistence
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('[App] 💾 Updated localStorage');

      // Update refs BEFORE state to ensure consistency
      authStateRef.current = { isAuthenticated: true, user: updatedUser };

      // Then update React state
      setCurrentUser(updatedUser);
      setIsAuthenticated(true); // Ensure auth stays true
      console.log('[App] ✅ Role switched successfully to:', role);

      // Reset switching flag after a delay
      setTimeout(() => {
        isRoleSwitchingRef.current = false;
        console.log('[App] 🔓 Role switch lock released');
      }, 500);

    } catch (error) {
      console.error('[App] ❌ Error during role switch:', error);
      isRoleSwitchingRef.current = false;
      // Don't let errors during role switch cause logout
    }
  };

  // Data context for AI - will be populated from API
  const contextData = {
    student: currentUser,
    courses: [],
    finance: []
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  // PROTECTED: Enhanced auth check with localStorage recovery
  // This prevents accidental logout during role switch or component errors
  if (!isAuthenticated || !currentUser) {
    // During role switch, don't show login - show loading instead
    if (isRoleSwitchingRef.current) {
      console.log('[App] 🔄 Role switch in progress, showing loading...');
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-500">{lang === 'ar' ? 'جاري تبديل الدور...' : 'Switching role...'}</p>
          </div>
        </div>
      );
    }

    console.log('[App] ⚠️ Auth check failed - isAuthenticated:', isAuthenticated, ', currentUser:', !!currentUser);
    logError('auth_check_failed', {
      isAuthenticated,
      hasCurrentUser: !!currentUser,
      localStorage_token: !!localStorage.getItem('token'),
      localStorage_user: !!localStorage.getItem('user'),
      isRoleSwitching: isRoleSwitchingRef.current,
    });

    // RECOVERY ATTEMPT: Check if localStorage has valid auth data
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    console.log('[App] 🔍 Recovery check - token exists:', !!token, ', user exists:', !!userStr);

    if (token && userStr) {
      try {
        const recoveredUser = JSON.parse(userStr);
        console.log('[App] 🔧 RECOVERING auth state from localStorage:', recoveredUser?.email);

        // Schedule state recovery on next tick to avoid render issues
        setTimeout(() => {
          setCurrentUser(recoveredUser);
          setIsAuthenticated(true);
          console.log('[App] ✅ Auth state recovered successfully!');
        }, 0);

        // Show loading during recovery instead of login
        return (
          <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-slate-500">{lang === 'ar' ? 'جاري استعادة الجلسة...' : 'Restoring session...'}</p>
            </div>
          </div>
        );
      } catch (e) {
        console.error('[App] ❌ Failed to recover auth from localStorage:', e);
      }
    }

    // No valid localStorage data - show login
    console.log('[App] 📋 No valid auth data found, showing Login page');
    return (
      <BrandingProvider>
        <Login
          onLogin={handleLogin}
          lang={lang}
          setLang={handleSetLang}
        />
      </BrandingProvider>
    );
  }

  return (
    <ErrorBoundary>
      <BrandingProvider>
        <ConfigProvider role={currentUser.role}>
          <HashRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout
                lang={lang}
                setLang={handleSetLang}
                user={currentUser}
                onLogout={handleLogout}
              />
            }
          >
          <Route
            index
            element={
              <Dashboard
                lang={lang}
                role={currentUser.role}
                student={currentUser}
              />
            }
          />
          <Route
            path="academic"
            element={
              currentUser.role === UserRole.STUDENT
              ? <Academic lang={lang} />
              : <Navigate to="/" />
            }
          />
          <Route
            path="finance"
            element={
              <Finance
                lang={lang}
                role={currentUser.role}
                student={currentUser.role === UserRole.STUDENT ? currentUser : undefined}
              />
            }
          />
          <Route
             path="admissions"
             element={
               (currentUser.role === UserRole.ADMIN)
               ? <Admissions lang={lang} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="lecturer"
             element={
               (currentUser.role === UserRole.LECTURER)
               ? <Lecturer lang={lang} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="settings"
             element={
               <Settings
                  lang={lang}
                  setLang={handleSetLang}
                  user={currentUser}
               />
             }
          />
          <Route
             path="profile"
             element={
               <Profile
                  lang={lang}
                  student={getUserProfileData(currentUser)}
               />
             }
          />
          <Route
             path="debug"
             element={<DebugPage lang={lang} />}
          />
          <Route
             path="reports"
             element={
               (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.FINANCE)
               ? <Reports lang={lang} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="exams"
             element={
               (currentUser.role === UserRole.STUDENT || currentUser.role === UserRole.LECTURER)
               ? <ExamsPage lang={lang} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="attendance"
             element={
               (currentUser.role === UserRole.STUDENT || currentUser.role === UserRole.LECTURER)
               ? <AttendancePage lang={lang} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="schedule"
             element={<SchedulePage lang={lang} />}
          />
          <Route
             path="support"
             element={<SupportPage lang={lang} />}
          />
          <Route
             path="requests"
             element={
               (currentUser.role === UserRole.STUDENT)
               ? <StudentRequestsPage lang={lang} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="registration"
             element={
               (currentUser.role === UserRole.STUDENT)
               ? <CourseRegistration lang={lang} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="id-card"
             element={
               (currentUser.role === UserRole.STUDENT)
               ? <IDCardPage lang={lang} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="transcript"
             element={
               (currentUser.role === UserRole.STUDENT)
               ? <TranscriptPage lang={lang} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="advising"
             element={
               (currentUser.role === UserRole.STUDENT)
               ? <AdvisingPage lang={lang} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="certificates"
             element={
               (currentUser.role === UserRole.STUDENT)
               ? <CertificatesPage lang={lang} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="academic-status"
             element={
               (currentUser.role === UserRole.STUDENT)
               ? <AcademicWarningsPage lang={lang} />
               : <Navigate to="/" />
             }
          />
          {/* Login redirect - in case user lands on /login while authenticated */}
          <Route path="login" element={<Navigate to="/" replace />} />
          {/* Admin Routes */}
          <Route
             path="admin/tables"
             element={
               (currentUser.role === UserRole.ADMIN)
               ? <TableBuilder lang={lang} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="admin/forms"
             element={
               (currentUser.role === UserRole.ADMIN)
               ? <FormBuilder lang={lang} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="admin/reports"
             element={
               (currentUser.role === UserRole.ADMIN)
               ? <ReportBuilder lang={lang} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="admin/settings"
             element={
               (currentUser.role === UserRole.ADMIN)
               ? <SystemSettings lang={lang} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="admin/menus"
             element={
               (currentUser.role === UserRole.ADMIN)
               ? <MenuDashboardManager lang={lang} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="admin/users"
             element={
               (currentUser.role === UserRole.ADMIN)
               ? <UserManagement lang={lang} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="admin/branding"
             element={
               (currentUser.role === UserRole.ADMIN)
               ? <BrandingSettings lang={lang} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="admin/roles"
             element={
               (currentUser.role === UserRole.ADMIN)
               ? <RolesPermissions lang={lang} />
               : <Navigate to="/" />
             }
          />
        </Route>
        </Routes>

        {/* AI Assistant is available globally */}
        <AiAssistant lang={lang} contextData={contextData} />

        {/* PWA Install Prompt */}
        <PWAInstallPrompt lang={lang} />
          </HashRouter>
        </ConfigProvider>
      </BrandingProvider>
    </ErrorBoundary>
  );
};

export default App;
