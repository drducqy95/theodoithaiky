
import React, { useState, ChangeEvent } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { ParentInfo } from '../types';

const initialParentState: ParentInfo = {
  avatar: '',
  fullName: '', dob: '', gender: '', nationality: '', address: '',
  nationalId: '', healthInsuranceId: '', healthInsuranceExpiry: '',
  phone: '', bloodType: '', medicalHistory: ''
};

const ParentForm: React.FC<{
  parentData: ParentInfo;
  setParentData: (data: ParentInfo) => void;
  title: string;
}> = ({ parentData, setParentData, title }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setParentData({ ...parentData, [name]: value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setParentData({ ...parentData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
      <div className="flex flex-col items-center mb-6">
          <img 
              src={parentData.avatar || `https://ui-avatars.com/api/?name=${parentData.fullName || '?'}&background=random&size=128`}
              alt="Avatar" 
              className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-indigo-200 dark:border-indigo-700"
          />
          <label htmlFor={`avatar-upload-${title}`} className="cursor-pointer text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Thay đổi ảnh đại diện
          </label>
          <input 
              id={`avatar-upload-${title}`} 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="hidden" 
          />
      </div>

      <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400 mb-4 text-center">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(parentData).filter(k => k !== 'avatar').map((key) => {
          const fieldKey = key as keyof Omit<ParentInfo, 'avatar'>;
          const labelMap: Record<keyof Omit<ParentInfo, 'avatar'>, string> = {
            fullName: 'Họ và tên', dob: 'Ngày sinh', gender: 'Giới tính', nationality: 'Quốc tịch',
            address: 'Địa chỉ', nationalId: 'Số CCCD', healthInsuranceId: 'Số thẻ BHYT',
            healthInsuranceExpiry: 'Hạn thẻ BHYT', phone: 'Số điện thoại', bloodType: 'Nhóm máu',
            medicalHistory: 'Tiền sử bệnh'
          };
          
          if (fieldKey === 'gender') {
            return (
               <div key={fieldKey}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{labelMap[fieldKey]}</label>
                <select name={fieldKey} value={parentData[fieldKey]} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
            )
          }

          if (fieldKey === 'medicalHistory') {
            return (
              <div key={fieldKey} className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{labelMap[fieldKey]}</label>
                <textarea name={fieldKey} value={parentData[fieldKey]} onChange={handleChange} rows={3} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            )
          }
          
          return (
            <div key={fieldKey}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{labelMap[fieldKey]}</label>
              <input type={key.includes('dob') || key.includes('Expiry') ? 'date' : 'text'} name={fieldKey} value={parentData[fieldKey]} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FamilyInfo: React.FC = () => {
  const [motherInfo, setMotherInfo] = useLocalStorage<ParentInfo>('motherInfo', initialParentState);
  const [fatherInfo, setFatherInfo] = useLocalStorage<ParentInfo>('fatherInfo', initialParentState);
  const [activeParent, setActiveParent] = useState<'mother' | 'father'>('mother');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    // Data is already saved by useLocalStorage on every change. 
    // This is just for user feedback.
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-center border-b border-gray-300 dark:border-gray-600 mb-4">
        <button onClick={() => setActiveParent('mother')} className={`px-6 py-2 font-medium ${activeParent === 'mother' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>
          Thông tin Mẹ
        </button>
        <button onClick={() => setActiveParent('father')} className={`px-6 py-2 font-medium ${activeParent === 'father' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>
          Thông tin Cha
        </button>
      </div>

      {activeParent === 'mother' ? (
        <ParentForm parentData={motherInfo} setParentData={setMotherInfo} title="Thông tin Mẹ" />
      ) : (
        <ParentForm parentData={fatherInfo} setParentData={setFatherInfo} title="Thông tin Cha" />
      )}
      
      <div className="flex justify-center mt-6">
        <button onClick={handleSave} className="px-8 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors">
          {isSaved ? 'Đã lưu!' : 'Lưu thông tin'}
        </button>
      </div>
    </div>
  );
};

export default FamilyInfo;