
import React, { useState, ChangeEvent } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Checkup, Vitals, GeneralExam, LabTests, LabTestResult, FileAttachment } from '../types';

const LAB_TEST_DEFINITIONS: Record<string, string> = {
  cbc: 'Tổng phân tích công thức tế bào máu ngoại vi',
  urinalysis: 'Tổng phân tích nước tiểu',
  biochemistry: 'Xét nghiệm sinh hóa máu',
  immunology: 'Xét nghiệm miễn dịch',
  microbiology: 'Xét nghiệm vi sinh',
  abdominalUltrasound: 'Siêu âm ổ bụng',
  fetalUltrasound: 'Siêu âm thai',
};

const isUltrasoundTest = (testKey: string): boolean => {
    return testKey.toLowerCase().includes('ultrasound');
};

const initialVitals: Vitals = { pulse: '', temperature: '', bloodPressure: '', respiratoryRate: '', height: '', weight: '' };
const initialGeneralExam: GeneralExam = { vitals: initialVitals, clinicalFindings: '' };

const getInitialCheckupState = (currentCheckup: Checkup | null): Checkup => ({
  id: currentCheckup?.id || Date.now().toString(),
  date: currentCheckup?.date || '',
  place: currentCheckup?.place || '',
  clinicAddress: currentCheckup?.clinicAddress || '',
  doctor: currentCheckup?.doctor || '',
  generalExam: currentCheckup?.generalExam || initialGeneralExam,
  labTests: currentCheckup?.labTests || {},
  conclusion: currentCheckup?.conclusion || '',
  advice: currentCheckup?.advice || '',
});

const CheckupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (checkup: Checkup) => void;
  currentCheckup: Checkup | null;
  savedClinics: { name: string; address: string }[];
}> = ({ isOpen, onClose, onSave, currentCheckup, savedClinics }) => {
  const [checkup, setCheckup] = useState<Checkup>(getInitialCheckupState(currentCheckup));
  const [selectedTestToAdd, setSelectedTestToAdd] = useState('');

  React.useEffect(() => {
    setCheckup(getInitialCheckupState(currentCheckup));
  }, [currentCheckup, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'place') {
      const selectedClinic = savedClinics.find(c => c.name === value);
      setCheckup(prev => ({
        ...prev,
        place: value,
        clinicAddress: selectedClinic ? selectedClinic.address : prev.clinicAddress,
      }));
    } else {
       setCheckup(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleVitalsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCheckup(prev => ({
      ...prev,
      generalExam: { ...prev.generalExam, vitals: { ...prev.generalExam.vitals, [name]: value } }
    }));
  };
  
  const handleClinicalFindingsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setCheckup(prev => ({ ...prev, generalExam: { ...prev.generalExam, clinicalFindings: value }}));
  }

  const handleLabContentChange = (key: string, content: string) => {
    setCheckup(prev => {
        const currentTest = prev.labTests[key] || { type: 'manual', content: '' };
        return {
            ...prev,
            labTests: { ...prev.labTests, [key]: { ...currentTest, content } }
        };
    });
  };

  const handleLabFilesChange = (key: string, e: ChangeEvent<HTMLInputElement>, isMultiple: boolean) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filePromises = Array.from(files).map(file => {
          return new Promise<FileAttachment>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve({ name: file.name, data: reader.result as string, type: file.type });
              reader.onerror = reject;
              reader.readAsDataURL(file);
          });
      });

      Promise.all(filePromises).then(newAttachments => {
          setCheckup(prev => {
              const currentTest = prev.labTests[key] || { type: 'file', content: '', files: [] };
              const updatedFiles = isMultiple ? [...(currentTest.files || []), ...newAttachments] : newAttachments;
              return {
                  ...prev,
                  labTests: { ...prev.labTests, [key]: { ...currentTest, type: 'file', files: updatedFiles } }
              };
          });
      });
    }
  };
  
  const removeLabFile = (testKey: string, fileIndex: number) => {
      setCheckup(prev => {
          const test = prev.labTests[testKey];
          if (!test || !test.files) return prev;
          const updatedFiles = test.files.filter((_, index) => index !== fileIndex);
          return {
              ...prev,
              labTests: { ...prev.labTests, [testKey]: { ...test, files: updatedFiles } }
          };
      });
  };

  const addLabTest = () => {
    if (selectedTestToAdd && !checkup.labTests[selectedTestToAdd]) {
        const newTest: LabTestResult = isUltrasoundTest(selectedTestToAdd)
            ? { type: 'file', content: '', files: [] }
            : { type: 'manual', content: '' };

        setCheckup(prev => ({
            ...prev,
            labTests: { ...prev.labTests, [selectedTestToAdd]: newTest }
        }));
        setSelectedTestToAdd('');
    }
  };

  const removeLabTest = (keyToRemove: string) => {
    setCheckup(prev => {
        const newLabTests = { ...prev.labTests };
        delete newLabTests[keyToRemove];
        return { ...prev, labTests: newLabTests };
    });
  };

  const handleSave = () => onSave(checkup);
  
  const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <h4 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400 mb-3">{title}</h4>
        {children}
    </div>
  );

  const availableTests = Object.keys(LAB_TEST_DEFINITIONS).filter(key => !checkup.labTests[key]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-2xl max-h-full overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">{currentCheckup ? 'Chỉnh sửa Lần khám' : 'Thêm Lần khám mới'}</h3>
        <div className="space-y-4">
            {/* General Info */}
            <input type="date" name="date" value={checkup.date} onChange={handleInputChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            <input list="clinics-list" type="text" name="place" placeholder="Nơi khám (Phòng khám, Bệnh viện)" value={checkup.place} onChange={handleInputChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            <datalist id="clinics-list">
                {savedClinics.map(clinic => <option key={clinic.name} value={clinic.name} />)}
            </datalist>
            <input type="text" name="clinicAddress" placeholder="Địa chỉ phòng khám" value={checkup.clinicAddress} onChange={handleInputChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            <input type="text" name="doctor" placeholder="Bác sĩ khám" value={checkup.doctor} onChange={handleInputChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />

            {/* General Exam */}
            <Section title="Khám tổng quát">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                    <input type="text" name="pulse" placeholder="Mạch (l/p)" value={checkup.generalExam.vitals.pulse} onChange={handleVitalsChange} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    <input type="text" name="temperature" placeholder="Nhiệt độ (°C)" value={checkup.generalExam.vitals.temperature} onChange={handleVitalsChange} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    <input type="text" name="bloodPressure" placeholder="Huyết áp (mmHg)" value={checkup.generalExam.vitals.bloodPressure} onChange={handleVitalsChange} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    <input type="text" name="respiratoryRate" placeholder="Nhịp thở (l/p)" value={checkup.generalExam.vitals.respiratoryRate} onChange={handleVitalsChange} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    <input type="text" name="height" placeholder="Chiều cao (cm)" value={checkup.generalExam.vitals.height} onChange={handleVitalsChange} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    <input type="text" name="weight" placeholder="Cân nặng (kg)" value={checkup.generalExam.vitals.weight} onChange={handleVitalsChange} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <textarea name="clinicalFindings" placeholder="Nội dung khám / Ghi chú lâm sàng" value={checkup.generalExam.clinicalFindings} onChange={handleClinicalFindingsChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" rows={3}></textarea>
            </Section>

            {/* Lab Tests */}
            <Section title="Xét nghiệm, Cận lâm sàng">
                <div className="space-y-4">
                    {availableTests.length > 0 && (
                        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                            <select value={selectedTestToAdd} onChange={e => setSelectedTestToAdd(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                <option value="">-- Chọn chỉ định --</option>
                                {availableTests.map(key => (
                                    <option key={key} value={key}>{LAB_TEST_DEFINITIONS[key]}</option>
                                ))}
                            </select>
                            <button onClick={addLabTest} type="button" className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 text-sm whitespace-nowrap">Thêm</button>
                        </div>
                    )}
                    {Object.keys(checkup.labTests).map(key => (
                        <div key={key} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <div className="flex justify-between items-center mb-2">
                                <label className="font-medium text-sm">{LAB_TEST_DEFINITIONS[key]}</label>
                                <button onClick={() => removeLabTest(key)} className="text-red-500 hover:text-red-700 text-xl font-bold">&times;</button>
                            </div>
                            {isUltrasoundTest(key) ? (
                                <div className="space-y-3">
                                    <textarea placeholder="Ghi chú kết quả siêu âm..." value={checkup.labTests[key]?.content || ''} onChange={(e) => handleLabContentChange(key, e.target.value)} className="w-full text-sm p-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600" rows={2}></textarea>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {checkup.labTests[key]?.files?.map((file, index) => (
                                            <div key={index} className="relative group">
                                                <img src={file.data} alt={file.name} className="w-full h-16 object-cover rounded-md" />
                                                <button onClick={() => removeLabFile(key, index)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                                            </div>
                                        ))}
                                    </div>
                                    <input type="file" multiple onChange={(e) => handleLabFilesChange(key, e, true)} accept="image/png, image/jpeg" className="w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                </div>
                            ) : (
                                <>
                                    <textarea placeholder="Nhập kết quả thủ công..." value={checkup.labTests[key]?.type === 'manual' ? checkup.labTests[key].content : ''} onChange={(e) => handleLabContentChange(key, e.target.value)} className="w-full text-sm p-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600" rows={2}></textarea>
                                    <div className="text-center my-1 text-xs text-gray-500">HOẶC</div>
                                    <input type="file" onChange={(e) => handleLabFilesChange(key, e, false)} accept=".pdf,.doc,.docx,image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                    {checkup.labTests[key]?.files?.[0] && <div className="text-xs text-green-600 mt-1">Đã tải lên: {checkup.labTests[key].files?.[0].name}</div>}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </Section>
            
            {/* Conclusion & Advice */}
            <Section title="Kết luận & Lời dặn">
                <textarea name="conclusion" placeholder="Kết luận" value={checkup.conclusion} onChange={handleInputChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" rows={3}></textarea>
                <textarea name="advice" placeholder="Lời dặn" value={checkup.advice} onChange={handleInputChange} className="w-full p-2 mt-3 border rounded-md dark:bg-gray-700 dark:border-gray-600" rows={3}></textarea>
            </Section>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400">Hủy</button>
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Lưu</button>
        </div>
      </div>
    </div>
  );
};


const CheckupCard: React.FC<{checkup: Checkup; onEdit: (c: Checkup) => void; onDelete: (id: string) => void;}> = ({ checkup, onEdit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const renderLabResult = (result: LabTestResult) => {
        if (result.type === 'manual') {
            return <p className="text-sm whitespace-pre-wrap">{result.content}</p>
        }
        if (result.type === 'file' && result.files && result.files.length > 0) {
            return (
                <div>
                    {result.content && <p className="text-sm mb-2 whitespace-pre-wrap">{result.content}</p>}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-1">
                        {result.files.map((file, index) => {
                            if (file.type.startsWith('image/')) {
                                return (
                                    <a key={index} href={file.data} target="_blank" rel="noopener noreferrer">
                                        <img src={file.data} alt={file.name} className="w-full h-24 object-cover rounded-md border border-gray-200 dark:border-gray-700 hover:opacity-80 transition-opacity" />
                                    </a>
                                );
                            }
                            return <p key={index} className="text-sm col-span-full">Tệp đính kèm: <span className="font-medium text-indigo-600">{file.name}</span></p>
                        })}
                    </div>
                </div>
            )
        }
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-all duration-300">
            <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div>
                    <h3 className="font-bold text-lg text-indigo-700 dark:text-indigo-400">
                        Ngày {new Date(checkup.date).toLocaleDateString('vi-VN')}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{checkup.place}</p>
                    {checkup.clinicAddress && <p className="text-xs text-gray-400 dark:text-gray-500">{checkup.clinicAddress}</p>}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">BS. {checkup.doctor}</p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 pl-2">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(checkup); }} className="text-sm text-blue-500 hover:underline">Sửa</button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(checkup.id); }} className="text-sm text-red-500 hover:underline">Xóa</button>
                    <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    {/* General Exam */}
                    <div>
                        <h4 className="font-semibold">Khám tổng quát</h4>
                        <div className="text-sm grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 mt-1">
                            <span>Mạch: {checkup.generalExam.vitals.pulse} l/p</span>
                            <span>Nhiệt độ: {checkup.generalExam.vitals.temperature} °C</span>
                            <span>Huyết áp: {checkup.generalExam.vitals.bloodPressure} mmHg</span>
                            <span>Nhịp thở: {checkup.generalExam.vitals.respiratoryRate} l/p</span>
                            <span>Chiều cao: {checkup.generalExam.vitals.height} cm</span>
                            <span>Cân nặng: {checkup.generalExam.vitals.weight} kg</span>
                        </div>
                        <p className="text-sm mt-2"><strong className="font-medium">Nội dung khám / Lâm sàng:</strong> {checkup.generalExam.clinicalFindings}</p>
                    </div>

                    {/* Lab Tests */}
                    {Object.keys(checkup.labTests).length > 0 && (
                        <div>
                            <h4 className="font-semibold">Kết quả Cận lâm sàng</h4>
                            <div className="mt-2 space-y-3">
                                {Object.keys(checkup.labTests).map((key) => {
                                    const result = checkup.labTests[key];
                                    return (
                                    <div key={key}>
                                        <p className="font-medium text-sm">{LAB_TEST_DEFINITIONS[key] || key}</p>
                                        {renderLabResult(result)}
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    
                    {/* Conclusion & Advice */}
                    {checkup.conclusion && <div><h4 className="font-semibold">Kết luận:</h4><p className="text-sm whitespace-pre-wrap">{checkup.conclusion}</p></div>}
                    {checkup.advice && <div><h4 className="font-semibold">Lời dặn:</h4><p className="text-sm whitespace-pre-wrap">{checkup.advice}</p></div>}
                </div>
            )}
        </div>
    )
}


const PregnancyTracker: React.FC = () => {
  const [checkups, setCheckups] = useLocalStorage<Checkup[]>('checkups', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCheckup, setCurrentCheckup] = useState<Checkup | null>(null);
  const [savedClinics, setSavedClinics] = useLocalStorage<{name: string; address: string}[]>('savedClinics', []);

  const handleSaveCheckup = (checkup: Checkup) => {
    const existingIndex = checkups.findIndex(c => c.id === checkup.id);
    if (existingIndex > -1) {
      const updatedCheckups = [...checkups];
      updatedCheckups[existingIndex] = checkup;
      setCheckups(updatedCheckups);
    } else {
      setCheckups([...checkups, checkup]);
    }
    
    if (checkup.place && checkup.clinicAddress) {
      const clinicNameLower = checkup.place.toLowerCase();
      const existingClinic = savedClinics.find(c => c.name.toLowerCase() === clinicNameLower);
      if (!existingClinic) {
        setSavedClinics(prev => [...prev, { name: checkup.place, address: checkup.clinicAddress }]);
      } else if (existingClinic.address !== checkup.clinicAddress) {
        setSavedClinics(prev => prev.map(c => 
            c.name.toLowerCase() === clinicNameLower 
            ? { ...c, address: checkup.clinicAddress } 
            : c
        ));
      }
    }

    setIsModalOpen(false);
  };
  
  const handleEdit = (checkup: Checkup) => {
    setCurrentCheckup(checkup);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setCurrentCheckup(null);
    setIsModalOpen(true);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa lần khám này?')) {
        setCheckups(checkups.filter(c => c.id !== id));
    }
  }
  
  const sortedCheckups = [...checkups].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      
      <div className="space-y-4">
        {sortedCheckups.length > 0 ? (
          sortedCheckups.map(checkup => (
            <CheckupCard key={checkup.id} checkup={checkup} onEdit={handleEdit} onDelete={handleDelete} />
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8">Chưa có lần khám nào. Hãy thêm lần khám đầu tiên của bạn!</p>
        )}
      </div>

      <CheckupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCheckup}
        currentCheckup={currentCheckup}
        savedClinics={savedClinics}
      />
      
      <button
        onClick={handleAddNew}
        aria-label="Thêm lần khám"
        className="fixed z-20 right-4 bottom-24 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
      </button>

    </div>
  );
};

export default PregnancyTracker;
