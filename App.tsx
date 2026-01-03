
import React, { useState, useEffect } from 'react';
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
import LMSPage from './pages/LMSPage';
import SplashScreen from './components/SplashScreen';
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
import { MOCK_STUDENT, MOCK_COURSES, MOCK_FINANCIALS, MOCK_ANNOUNCEMENTS, MOCK_APPLICATIONS } from './constants';
import { UserRole } from './types';
import { authAPI } from './api';
import { ConfigProvider } from './context/ConfigContext';

// Helper to get complete student data for profile
const getStudentProfileData = (user: any) => {
  if (user?.role === 'student') {
    // Merge mock student data with logged in user
    return {
      ...MOCK_STUDENT,
      ...user,
      name: `${user.firstName} ${user.lastName}`,
      nameEn: `${user.firstName} ${user.lastName}`,
      nameAr: user.firstNameAr ? `${user.firstNameAr} ${user.lastNameAr}` : `${user.firstName} ${user.lastName}`,
    };
  }
  // For non-students, create a basic profile
  return {
    ...MOCK_STUDENT,
    ...user,
    name: `${user?.firstName || 'User'} ${user?.lastName || ''}`,
    nameEn: `${user?.firstName || 'User'} ${user?.lastName || ''}`,
    nameAr: `${user?.firstName || 'User'} ${user?.lastName || ''}`,
    studentId: user?.id || 'N/A',
    role: user?.role,
  };
};

const App: React.FC = () => {
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Handle language change with persistence
  const handleSetLang = (newLang: 'en' | 'ar') => {
    setLang(newLang);
    localStorage.setItem('app_language', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  // Set document direction based on language
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Handle Splash Screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authAPI.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // For demo: allow role switching (remove in production)
  const setUserRole = (role: UserRole) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
    }
  };

  // Data context for AI
  const contextData = {
    student: currentUser,
    courses: MOCK_COURSES,
    finance: MOCK_FINANCIALS
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <Login
        onLogin={handleLogin}
        lang={lang}
        setLang={handleSetLang}
      />
    );
  }

  return (
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
                setUserRole={setUserRole}
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
                courses={MOCK_COURSES}
                announcements={MOCK_ANNOUNCEMENTS}
                applications={MOCK_APPLICATIONS}
              />
            }
          />
          <Route
            path="academic"
            element={
              currentUser.role === UserRole.STUDENT
              ? <Academic lang={lang} courses={MOCK_COURSES} />
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
                financials={MOCK_FINANCIALS}
              />
            }
          />
          <Route
             path="admissions"
             element={
               (currentUser.role === UserRole.ADMIN)
               ? <Admissions lang={lang} applications={MOCK_APPLICATIONS} />
               : <Navigate to="/" />
             }
          />
          <Route
             path="lecturer"
             element={
               (currentUser.role === UserRole.LECTURER)
               ? <Lecturer lang={lang} courses={MOCK_COURSES} />
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
                  student={getStudentProfileData(currentUser)}
               />
             }
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
          <Route
             path="lms"
             element={
               (currentUser.role === UserRole.STUDENT)
               ? <LMSPage lang={lang} />
               : <Navigate to="/" />
             }
          />
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
  );
};

export default App;
