
import React, { useContext, useState } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import { AppSettings, ParentInfo, CountdownData } from '../types';
import { exportToPdf } from '../services/exportService';
import useLocalStorage from '../hooks/useLocalStorage';

// Define a valid initial state for ParentInfo to satisfy the type requirements of useLocalStorage.
const initialParentState: ParentInfo = {
  fullName: '', dob: '', gender: '', nationality: '', address: '',
  nationalId: '', healthInsuranceId: '', healthInsuranceExpiry: '',
  phone: '', bloodType: '', medicalHistory: ''
};

const initialCountdownData: CountdownData = {
  edd: null,
  method: null,
  inputs: {
    lmp: '',
    cycleLength: 28,
    crl: undefined,
    crlDate: ''
  }
};

const AccordionItem: React.FC<{
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
  isLast?: boolean;
}> = ({ title, children, isOpen, onClick, isLast = false }) => {
  return (
    <div className={`${!isLast ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center text-left py-4"
      >
        <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">{title}</h3>
        <span className={`transform transition-transform duration-300 text-gray-500 dark:text-gray-400 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="pb-4">
          {children}
        </div>
      </div>
    </div>
  );
};


const Settings: React.FC = () => {
  const { settings, setSettings } = useContext(SettingsContext);
  const [isExporting, setIsExporting] = React.useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  // We need to read the data directly for export, not through the hook's state
  const [motherInfo] = useLocalStorage<ParentInfo>('motherInfo', initialParentState);
  const [fatherInfo] = useLocalStorage<ParentInfo>('fatherInfo', initialParentState);
  const [checkups] = useLocalStorage('checkups', []);
  const [countdownData] = useLocalStorage<CountdownData>('countdownData', initialCountdownData);

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({ ...prev, [name]: isChecked ? 'dark' : 'light' }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({
      ...prev,
      background: e.target.value,
      backgroundImage: undefined, // Remove image when color is chosen
    }));
  };

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size < 2 * 1024 * 1024) { // Limit file size to 2MB
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({
          ...prev,
          backgroundImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert('Vui lòng chọn ảnh có dung lượng nhỏ hơn 2MB.');
    }
  };

  const handleRemoveBackgroundImage = () => {
    setSettings(prev => ({
      ...prev,
      backgroundImage: undefined,
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToPdf({ motherInfo, fatherInfo, checkups, countdownData });
    } catch (err) {
      console.error("Failed to export PDF:", err);
      alert("Đã xảy ra lỗi khi xuất file PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const backgroundColors = [
    { name: 'Xám nhạt', value: '#f3f4f6' },
    { name: 'Trắng', value: '#ffffff' },
    { name: 'Xanh bạc hà', value: '#f0fdf4' },
    { name: 'Hồng phấn', value: '#fdf2f8' },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md px-6">
        <AccordionItem
          title="Giao diện hiển thị"
          isOpen={openSection === 'display'}
          onClick={() => toggleSection('display')}
        >
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <label htmlFor="theme" className="font-medium">Chế độ tối</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="theme" name="theme" checked={settings.theme === 'dark'} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div>
              <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Font chữ</label>
              <select id="fontFamily" name="fontFamily" value={settings.fontFamily} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="sans">Inter</option>
                <option value="serif">Merriweather (Serif)</option>
                <option value="times">Times New Roman (Mặc định)</option>
                <option value="mono">Inconsolata (Mono)</option>
              </select>
            </div>

            <div>
              <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cỡ chữ</label>
              <select id="fontSize" name="fontSize" value={settings.fontSize} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="small">Nhỏ (Mặc định)</option>
                <option value="medium">Vừa</option>
                <option value="large">Lớn</option>
              </select>
            </div>

            <div>
              <label htmlFor="background" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Màu nền (Chế độ sáng)</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Chọn màu sẽ xóa ảnh nền hiện tại.</p>
              <select id="background" name="background" value={settings.background} onChange={handleBackgroundColorChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500">
                {backgroundColors.map(color => (
                  <option key={color.value} value={color.value}>{color.name}</option>
                ))}
              </select>
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ảnh nền (Chế độ sáng)</label>
              {settings.backgroundImage ? (
                <div className="mt-2 flex items-center justify-between">
                  <img src={settings.backgroundImage} alt="Xem trước ảnh nền" className="w-16 h-10 object-cover rounded border border-gray-300 dark:border-gray-600" />
                  <button onClick={handleRemoveBackgroundImage} className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600">Xóa ảnh</button>
                </div>
              ) : (
                <div className="mt-2">
                  <label htmlFor="bg-upload" className="cursor-pointer w-full flex justify-center px-4 py-2 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md text-sm text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition-colors">
                    Tải lên ảnh
                  </label>
                  <input id="bg-upload" type="file" accept="image/*" className="hidden" onChange={handleBackgroundImageChange} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dung lượng tối đa 2MB.</p>
                </div>
              )}
            </div>
          </div>
        </AccordionItem>

        <AccordionItem
          title="Xuất dữ liệu"
          isOpen={openSection === 'export'}
          onClick={() => toggleSection('export')}
          isLast={true}
        >
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 pt-2">Tổng hợp toàn bộ thông tin gia đình và các lần khám thai thành một file PDF để lưu trữ hoặc chia sẻ.</p>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isExporting ? 'Đang xử lý...' : 'Xuất file PDF'}
          </button>
        </AccordionItem>
      </div>
    </div>
  );
};

export default Settings;
