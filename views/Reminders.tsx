
import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Reminder } from '../types';

type ReminderFormData = Omit<Reminder, 'id' | 'triggered'>;

const ReminderModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: ReminderFormData) => void;
  savedClinics: { name: string; address: string }[];
}> = ({ isOpen, onClose, onSave, savedClinics }) => {
  const [formData, setFormData] = useState<ReminderFormData>({
      title: '',
      dateTime: '',
      clinicName: '',
      clinicAddress: '',
      doctor: '',
      content: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'clinicName') {
        const selectedClinic = savedClinics.find(c => c.name === value);
        setFormData(prev => ({
            ...prev,
            clinicName: value,
            clinicAddress: selectedClinic ? selectedClinic.address : '',
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const currentDateTime = formData.dateTime ? new Date(formData.dateTime) : new Date();
      if (name === 'date') {
          const [year, month, day] = value.split('-').map(Number);
          currentDateTime.setFullYear(year, month - 1, day);
      } else if (name === 'time') {
          const [hours, minutes] = value.split(':').map(Number);
          currentDateTime.setHours(hours, minutes);
      }
      setFormData(prev => ({...prev, dateTime: currentDateTime.toISOString()}));
  }

  const handleSave = () => {
    if (!formData.title || !formData.dateTime) {
      alert('Vui lòng nhập tiêu đề, ngày và giờ.');
      return;
    }
    onSave(formData);
    onClose();
    // Reset form
    setFormData({ title: '', dateTime: '', clinicName: '', clinicAddress: '', doctor: '', content: '' });
  };
  
  const today = new Date().toISOString().split('T')[0];
  const dateValue = formData.dateTime ? formData.dateTime.split('T')[0] : '';
  const timeValue = formData.dateTime ? formData.dateTime.split('T')[1]?.substring(0,5) : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md max-h-full overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Thêm lời nhắc mới</h3>
        <div className="space-y-4">
          <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Tiêu đề (VD: Khám thai định kỳ)" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
          <div className="grid grid-cols-2 gap-4">
            <input type="date" name="date" value={dateValue} min={today} onChange={handleDateTimeChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            <input type="time" name="time" value={timeValue} onChange={handleDateTimeChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <input list="clinics-list" type="text" name="clinicName" value={formData.clinicName} onChange={handleInputChange} placeholder="Tên phòng khám" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
          <datalist id="clinics-list">
            {savedClinics.map(clinic => <option key={clinic.name} value={clinic.name} />)}
          </datalist>
          <input type="text" name="clinicAddress" value={formData.clinicAddress} onChange={handleInputChange} placeholder="Địa chỉ phòng khám" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
          <input type="text" name="doctor" value={formData.doctor} onChange={handleInputChange} placeholder="Bác sĩ khám" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
          <textarea name="content" value={formData.content} onChange={handleInputChange} placeholder="Nội dung/Ghi chú (VD: Siêu âm 4D)" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" rows={3}></textarea>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400">Hủy</button>
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Lưu</button>
        </div>
      </div>
    </div>
  );
};

const ReminderCard: React.FC<{
  reminder: Reminder;
  onDelete: (id: string) => void;
}> = ({ reminder, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-all duration-300">
      <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div>
          <p className="font-semibold text-indigo-700 dark:text-indigo-400">{reminder.title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            {new Date(reminder.dateTime).toLocaleString('vi-VN', {
              weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
          {reminder.clinicName && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{reminder.clinicName}</p>}
          {reminder.doctor && <p className="text-sm text-gray-500 dark:text-gray-400">BS. {reminder.doctor}</p>}
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0 pl-2">
            <button onClick={(e) => { e.stopPropagation(); onDelete(reminder.id); }} className="text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
            <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </div>
      {(isExpanded && (reminder.content || reminder.clinicAddress)) && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
           {reminder.clinicAddress && <p className="text-xs text-gray-500">Địa chỉ: {reminder.clinicAddress}</p>}
           {reminder.content && <div>
                <h4 className="font-semibold text-sm">Nội dung:</h4>
                <p className="text-sm whitespace-pre-wrap">{reminder.content}</p>
            </div>}
        </div>
      )}
    </div>
  );
};


const Reminders: React.FC = () => {
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('reminders', []);
  const [savedClinics] = useLocalStorage<{name: string; address: string}[]>('savedClinics', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'denied') {
          alert('Bạn đã từ chối quyền nhận thông báo. Vui lòng bật thủ công trong cài đặt trình duyệt để sử dụng tính năng này.');
        }
      });
    }
  }, []);

  const handleSaveReminder = (formData: ReminderFormData) => {
    const reminder: Reminder = {
      ...formData,
      id: Date.now().toString(),
      triggered: false
    };
    setReminders([...reminders, reminder]);
  };

  const handleDeleteReminder = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa lời nhắc này?')) {
      setReminders(reminders.filter(r => r.id !== id));
    }
  };
  
  const upcomingReminders = reminders
    .filter(r => new Date(r.dateTime) > new Date())
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());


  return (
    <div className="space-y-4">
      {upcomingReminders.length > 0 ? (
        upcomingReminders.map(reminder => (
          <ReminderCard key={reminder.id} reminder={reminder} onDelete={handleDeleteReminder} />
        ))
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">Chưa có lời nhắc nào sắp tới.</p>
      )}

      <ReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveReminder}
        savedClinics={savedClinics}
      />
      
      <button
        onClick={() => setIsModalOpen(true)}
        aria-label="Thêm lời nhắc"
        className="fixed z-20 right-4 bottom-24 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
      </button>
    </div>
  );
};

export default Reminders;
