
import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { CountdownData } from '../types';

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

const Countdown: React.FC = () => {
  const [countdownData, setCountdownData] = useLocalStorage<CountdownData>('countdownData', initialCountdownData);
  const [activeCalculator, setActiveCalculator] = useState<'lmp' | 'crl' | 'direct' | null>(null);
  
  // State for form inputs
  const [lmp, setLmp] = useState(countdownData.inputs.lmp || '');
  const [cycleLength, setCycleLength] = useState(countdownData.inputs.cycleLength || 28);
  // FIX: Ensure 'crl' state is always a string to prevent type errors with parseFloat.
  const [crl, setCrl] = useState(countdownData.inputs.crl?.toString() || '');
  const [crlDate, setCrlDate] = useState(countdownData.inputs.crlDate || '');
  const [directEdd, setDirectEdd] = useState('');

  const calculateFetalAgeAndCountdown = (edd: string | null) => {
    if (!edd) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eddDate = new Date(edd);
    eddDate.setHours(0, 0, 0, 0);

    const oneDay = 1000 * 60 * 60 * 24;
    const remainingDays = Math.round((eddDate.getTime() - today.getTime()) / oneDay);
    
    if (remainingDays < -42) return { weeks: 40, days: 0, remainingDays: 0, isOverdue: true, overdueDays: Math.abs(remainingDays) }; // Cap at 40+ weeks post-due
    
    const totalDays = 280 - remainingDays;
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    return { weeks, days, remainingDays, isOverdue: remainingDays < 0, overdueDays: Math.abs(remainingDays) };
  };
  
  const pregnancyProgress = useMemo(() => calculateFetalAgeAndCountdown(countdownData.edd), [countdownData.edd]);

  const handleCalculateLMP = () => {
    const lmpDate = new Date(lmp);
    const cycleAdjustment = (cycleLength || 28) - 28;
    lmpDate.setDate(lmpDate.getDate() + 280 + cycleAdjustment);
    const newEdd = lmpDate.toISOString().split('T')[0];
    setCountdownData({
      edd: newEdd,
      method: 'lmp',
      inputs: { lmp, cycleLength }
    });
    setActiveCalculator(null);
  };
  
  const handleCalculateCRL = () => {
    const crlValue = parseFloat(crl);
    if (isNaN(crlValue) || !crlDate) return;
    // Hadlock formula approximation: Gestational Age (days) = (CRL * 0.9) + 40
    // Simplified for this app: GA (weeks) = CRL (cm) + 6.5
    // A simpler but common method: GA in days = CRL(mm) + 42
    const gestationalAgeDays = crlValue + 42;
    const ultrasoundDate = new Date(crlDate);
    const remainingPregnancyDays = 280 - gestationalAgeDays;
    ultrasoundDate.setDate(ultrasoundDate.getDate() + remainingPregnancyDays);
    const newEdd = ultrasoundDate.toISOString().split('T')[0];
    setCountdownData({
      edd: newEdd,
      method: 'crl',
      inputs: { crl: crlValue, crlDate }
    });
    setActiveCalculator(null);
  };

  const handleSaveDirectEDD = () => {
    if (!directEdd) return;
    setCountdownData({
      edd: directEdd,
      method: 'direct',
      inputs: {}
    });
    setActiveCalculator(null);
  }

  const handleReset = () => {
    setCountdownData(initialCountdownData);
    setActiveCalculator(null);
  }
  
  const CalculatorUI = () => (
     <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-center mb-4">Chọn công cụ tính ngày dự sinh</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={() => setActiveCalculator('lmp')} className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-md text-indigo-700 dark:text-indigo-300">Chu kỳ kinh cuối</button>
            <button onClick={() => setActiveCalculator('crl')} className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-md text-indigo-700 dark:text-indigo-300">Chỉ số CRL</button>
            <button onClick={() => setActiveCalculator('direct')} className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-md text-indigo-700 dark:text-indigo-300">Nhập trực tiếp</button>
          </div>
        </div>

        {activeCalculator === 'lmp' && (
          <div className="p-4 border-t dark:border-gray-700 space-y-3">
            <h4 className="font-semibold">Tính theo Chu kỳ kinh cuối (LMP)</h4>
            <div>
                <label className="block text-sm font-medium">Ngày đầu tiên của chu kỳ cuối</label>
                <input type="date" value={lmp} onChange={e => setLmp(e.target.value)} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
                <label className="block text-sm font-medium">Độ dài chu kỳ kinh (ngày)</label>
                <input type="number" value={cycleLength} onChange={e => setCycleLength(parseInt(e.target.value))} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <button onClick={handleCalculateLMP} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Tính toán</button>
          </div>
        )}
        
        {activeCalculator === 'crl' && (
          <div className="p-4 border-t dark:border-gray-700 space-y-3">
            <h4 className="font-semibold">Tính theo Chỉ số CRL (3 tháng đầu)</h4>
            <div>
                <label className="block text-sm font-medium">Chỉ số CRL (mm)</label>
                <input type="number" step="0.1" value={crl} onChange={e => setCrl(e.target.value)} placeholder="VD: 55" className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
                <label className="block text-sm font-medium">Ngày siêu âm</label>
                <input type="date" value={crlDate} onChange={e => setCrlDate(e.target.value)} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <button onClick={handleCalculateCRL} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Tính toán</button>
          </div>
        )}

        {activeCalculator === 'direct' && (
          <div className="p-4 border-t dark:border-gray-700 space-y-3">
            <h4 className="font-semibold">Nhập ngày dự sinh trực tiếp</h4>
            <div>
                <label className="block text-sm font-medium">Ngày dự sinh</label>
                <input type="date" value={directEdd} onChange={e => setDirectEdd(e.target.value)} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <button onClick={handleSaveDirectEDD} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Lưu</button>
          </div>
        )}
      </div>
  );
  
  const DisplayUI = () => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center space-y-4">
        <div>
            <p className="text-gray-500 dark:text-gray-400">Ngày dự sinh của bạn là</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{new Date(countdownData.edd!).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div className="py-4">
            {pregnancyProgress && !pregnancyProgress.isOverdue && (
                <>
                    <p className="text-xl">Còn lại</p>
                    <p className="text-6xl font-bold text-indigo-700 dark:text-indigo-300 my-2">{pregnancyProgress.remainingDays}</p>
                    <p className="text-xl">ngày</p>
                </>
            )}
            {pregnancyProgress && pregnancyProgress.isOverdue && (
                <>
                    <p className="text-xl">Mẹ đã quá ngày dự sinh</p>
                    <p className="text-6xl font-bold text-red-500 dark:text-red-400 my-2">{pregnancyProgress.overdueDays}</p>
                    <p className="text-xl">ngày</p>
                </>
            )}
        </div>

        <div className="p-3 bg-indigo-50 dark:bg-gray-700/50 rounded-md">
            <p className="font-medium">Tuổi thai hiện tại</p>
            <p className="text-lg font-semibold">{pregnancyProgress?.weeks} tuần {pregnancyProgress?.days} ngày</p>
        </div>

        <button onClick={handleReset} className="text-sm text-gray-500 hover:underline pt-2">Tính lại / Chỉnh sửa</button>
    </div>
  );

  return (
    <div>
      {countdownData.edd ? <DisplayUI /> : <CalculatorUI />}
    </div>
  );
};

export default Countdown;
