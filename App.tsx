
import React, { useState, useContext } from 'react';
import { SettingsProvider, SettingsContext } from './contexts/SettingsContext';
import FamilyInfo from './views/FamilyInfo';
import PregnancyTracker from './views/PregnancyTracker';
import Settings from './views/Settings';
import Countdown from './views/Countdown';
import Reminders from './views/Reminders';
import Notes from './views/Notes';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import useReminderScheduler from './hooks/useReminderScheduler';
import { AppSettings, ActiveTab } from './types';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tracker');
  const { settings } = useContext(SettingsContext);
  
  useReminderScheduler();

  const renderTab = () => {
    switch (activeTab) {
      case 'family':
        return <FamilyInfo />;
      case 'tracker':
        return <PregnancyTracker />;
      case 'countdown':
        return <Countdown />;
      case 'reminders':
        return <Reminders />;
      case 'settings':
        return <Settings />;
      case 'notes':
        return <Notes />;
      default:
        return <PregnancyTracker />;
    }
  };
  
  const getAppClassName = (settings: AppSettings) => {
    const classNames: string[] = [];
    
    if (settings.theme === 'dark') {
      classNames.push('dark');
    }
    
    switch(settings.fontSize) {
      case 'small': classNames.push('text-sm'); break;
      case 'large': classNames.push('text-lg'); break;
      default: classNames.push('text-base'); break;
    }

    switch(settings.fontFamily) {
      case 'serif': classNames.push('font-serif'); break;
      case 'mono': classNames.push('font-mono'); break;
      case 'times': classNames.push('font-times'); break;
      default: classNames.push('font-sans'); break;
    }

    return classNames.join(' ');
  };

  React.useEffect(() => {
    const html = document.documentElement;
    html.className = getAppClassName(settings);
    
    if (settings.backgroundImage) {
        html.style.backgroundImage = `url(${settings.backgroundImage})`;
        html.style.backgroundSize = 'cover';
        html.style.backgroundPosition = 'center';
        html.style.backgroundAttachment = 'fixed';
        html.style.backgroundColor = ''; // Clear solid color
    } else {
        html.style.backgroundImage = ''; // Clear image
        if (settings.theme === 'dark') {
            html.style.backgroundColor = '#111827';
        } else {
            html.style.backgroundColor = settings.background;
        }
    }
  }, [settings]);

  return (
    <div className="min-h-screen bg-transparent text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="pb-20 pt-16 px-4">
        {renderTab()}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};


const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
};

export default App;
