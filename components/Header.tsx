
import React from 'react';
import { ActiveTab } from '../types';
import { BellIcon, ArrowLeftIcon } from './icons';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabTitles: Record<ActiveTab, string> = {
    family: 'Thông tin Gia đình',
    tracker: 'Theo dõi thai kỳ',
    settings: 'Cài đặt',
    countdown: 'Đếm ngược ngày sinh',
    reminders: 'Lời nhắc & Lịch hẹn',
    notes: 'Lưu ý thai kỳ',
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-indigo-600 dark:bg-indigo-800 text-white p-4 shadow-md z-10 flex items-center justify-center h-16">
      <div className="absolute left-4">
        {activeTab === 'reminders' && (
          <button onClick={() => setActiveTab('tracker')} aria-label="Quay lại">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
        )}
      </div>
      <h1 className="text-xl font-bold">{tabTitles[activeTab]}</h1>
      <div className="absolute right-4">
        {activeTab === 'tracker' && (
          <button onClick={() => setActiveTab('reminders')} aria-label="Mở nhắc nhở">
            <BellIcon className="w-6 h-6" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
