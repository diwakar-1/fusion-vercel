import React from 'react';
import { StudentOsProvider, useStudentOs } from './context/StudentOsContext';
import { MeshBackground } from './components/common/MeshBackground';
import { GlassNavbar } from './components/navigation/GlassNavbar';
import { GlassDock } from './components/navigation/GlassDock';
import { EntryCodeGate } from './components/auth/EntryCodeGate';
import { ProfileModal } from './components/common/ProfileModal';
import { DashboardOverview } from './components/features/DashboardOverview';
import { FriendsStudyRoom } from './components/features/FriendsStudyRoom';
import { StudyTracker } from './components/features/StudyTracker';
import { CoursePlaylists } from './components/features/CoursePlaylists';
import { CollegeTimetable } from './components/features/CollegeTimetable';
import { DsaTracker } from './components/features/DsaTracker';
import { LeetCodeHub } from './components/features/LeetCodeHub';
import { MlRoadmap } from './components/features/MlRoadmap';
import { NotesKnowledgeBase } from './components/features/NotesKnowledgeBase';
import { HabitsAndGoals } from './components/features/HabitsAndGoals';
import { AnalyticsHeatmap } from './components/features/AnalyticsHeatmap';
import { AiChatAssistantModal } from './components/features/AiChatAssistantModal';
import { StreakTaskReminderToast } from './components/common/StreakTaskReminderToast';

const StudentOsApp: React.FC = () => {
  const { activeModule, isAuthenticated, isProfileModalOpen, setIsProfileModalOpen } = useStudentOs();

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
        <MeshBackground />
        <EntryCodeGate />
      </div>
    );
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'partner':
        return <FriendsStudyRoom />;
      case 'study':
        return <StudyTracker />;
      case 'courses':
        return <CoursePlaylists />;
      case 'timetable':
        return <CollegeTimetable />;
      case 'dsa':
        return <DsaTracker />;
      case 'leetcode':
        return <LeetCodeHub />;
      case 'ml':
        return <MlRoadmap />;
      case 'notes':
        return <NotesKnowledgeBase />;
      case 'habits':
        return <HabitsAndGoals />;
      case 'analytics':
        return <AnalyticsHeatmap />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Ambient Mesh Background Canvas */}
      <MeshBackground />

      {/* Navigation Bar */}
      <GlassNavbar />

      {/* Main Container */}
      <main className="responsive-main-container">
        {renderModule()}
      </main>

      {/* Floating Glass Navigation Dock */}
      <GlassDock />

      {/* Global AI Copilot Modal Drawer */}
      <AiChatAssistantModal />

      {/* User Profile Avatar Customizer Modal */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

      {/* Floating 30-Min Streak & Task Reminder Banner */}
      <StreakTaskReminderToast />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <StudentOsProvider>
      <StudentOsApp />
    </StudentOsProvider>
  );
};

export default App;
