import React, { lazy, Suspense, useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import core layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GoogleReviewsButton from './components/GoogleReviewsButton';
import ScrollToTop from './components/ScrollToTop';
import PrivateRoute from './components/PrivateRoute';

// Lazy load page components
const HomePage = lazy(() => import('./pages/HomePage'));
const KidsProgram = lazy(() => import('./pages/KidsProgram'));
const HomeschoolProgram = lazy(() => import('./pages/HomeschoolProgram'));
const AdultProgram = lazy(() => import('./pages/AdultProgram'));
const FundamentalsProgram = lazy(() => import('./pages/FundamentalsProgram'));
const CompetitionTraining = lazy(() => import('./pages/CompetitionTraining'));
const WrestlingProgram = lazy(() => import('./pages/WrestlingProgram'));
const PrivateLessons = lazy(() => import('./pages/PrivateLessons'));
const Schedule = lazy(() => import('./pages/Schedule'));
const TrainingSchedule = lazy(() => import('./pages/TrainingSchedule'));
const Instructors = lazy(() => import('./pages/Instructors'));
const OurFacility = lazy(() => import('./pages/OurFacility'));
const AffiliateSchools = lazy(() => import('./pages/AffiliateSchools'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin Pages (Lazy Load)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageHomepage = lazy(() => import('./pages/admin/ManageHomepage'));
const ManagePrograms = lazy(() => import('./pages/admin/ManagePrograms'));
const ManageProgramContent = lazy(() => import('./pages/admin/ManageProgramContent'));
const ManageAbout = lazy(() => import('./pages/admin/ManageAbout'));
const ManageFacility = lazy(() => import('./pages/admin/ManageFacility'));
const ManageSchedule = lazy(() => import('./pages/admin/ManageSchedule'));
const ManageBlog = lazy(() => import('./pages/admin/ManageBlog'));
const UpdateInstructors = lazy(() => import('./pages/admin/UpdateInstructors'));
const ChangePasswordPage = lazy(() => import('./pages/admin/ChangePasswordPage'));

const LoadingFallback = () => <div className="loading-screen" style={{ height: '100vh', backgroundColor: 'var(--bg-primary)' }}></div>;

// This new component handles the layout
const AppLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/check-auth');
        setIsAuthenticated(response.data.isAuthenticated);
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <div className="App">
      <ScrollToTop />
      <Navbar />
      <main>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* ... other public routes ... */}
            <Route path="/kids-program" element={<KidsProgram />} />
            <Route path="/homeschool-program" element={<HomeschoolProgram />} />
            <Route path="/adult-program" element={<AdultProgram />} />
            <Route path="/fundamentals-program" element={<FundamentalsProgram />} />
            <Route path="/competition-training" element={<CompetitionTraining />} />
            <Route path="/wrestling-program" element={<WrestlingProgram />} />
            <Route path="/private-lessons" element={<PrivateLessons />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/training-schedule" element={<TrainingSchedule />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/facility" element={<OurFacility />} />
            <Route path="/affiliate-schools" element={<AffiliateSchools />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPost />} />

            <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

            {/* Redirect /home to / */}
            <Route path="/home" element={<Navigate to="/" replace />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            >
              <Route index element={<ManageHomepage />} />
              <Route path="homepage" element={<ManageHomepage />} />
              <Route path="programs" element={<ManagePrograms />} />
              <Route path="programs/:programId" element={<ManageProgramContent />} />
              <Route path="about" element={<ManageAbout />} />
              <Route path="facility" element={<ManageFacility />} />
              <Route path="instructors" element={<UpdateInstructors />} />
              <Route path="schedule" element={<ManageSchedule />} />
              <Route path="blog" element={<ManageBlog />} />
              <Route path="security" element={<ChangePasswordPage />} />
            </Route>

            {/* Catch-all: 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <GoogleReviewsButton />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;