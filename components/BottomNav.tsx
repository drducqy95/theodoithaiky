
import React from 'react';
import { ActiveTab } from '../types';
import { UsersIcon, ClipboardListIcon, CogIcon, HeartIcon, BookOpenIcon } from './icons';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
    }`}
  >
    {icon}
    <span className="text-xs">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg flex justify-around z-10">
      <NavItem
        label="Theo dõi"
        icon={<ClipboardListIcon className="w-6 h-6" />}
        isActive={activeTab === 'tracker'}
        onClick={() => setActiveTab('tracker')}
      />
      <NavItem
        label="Lưu ý"
        icon={<BookOpenIcon className="w-6 h-6" />}
        isActive={activeTab === 'notes'}
        onClick={() => setActiveTab('notes')}
      />
       <NavItem
        label="Đếm ngược"
        icon={<HeartIcon className="w-6 h-6" />}
        isActive={activeTab === 'countdown'}
        onClick={() => setActiveTab('countdown')}
      />
      <NavItem
        label="Gia đình"
        icon={<UsersIcon className="w-6 h-6" />}
        isActive={activeTab === 'family'}
        onClick={() => setActiveTab('family')}
      />
      <NavItem
        label="Cài đặt"
        icon={<CogIcon className="w-6 h-6" />}
        isActive={activeTab === 'settings'}
        onClick={() => setActiveTab('settings')}
      />
    </nav>
  );
};

export default BottomNav;
