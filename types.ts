
export interface ParentInfo {
  avatar?: string; // Base64 string
  fullName: string;
  dob: string;
  gender: 'Nam' | 'Nữ' | '';
  nationality: string;
  address: string;
  nationalId: string;
  healthInsuranceId: string;
  healthInsuranceExpiry: string;
  phone: string;
  bloodType: string;
  medicalHistory: string;
}

export interface Vitals {
  pulse: string; // Mạch
  temperature: string; // Nhiệt độ
  bloodPressure: string; // Huyết áp
  respiratoryRate: string; // Nhịp thở
  height: string; // Chiều cao
  weight: string; // Cân nặng
}

export interface GeneralExam {
  vitals: Vitals;
  clinicalFindings: string; // Lâm sàng
}

export interface FileAttachment {
  name: string;
  data: string; // Base64 data
  type: string; // Mime type
}

export interface LabTestResult {
  type: 'manual' | 'file';
  content: string; // Manual text content OR a summary for file attachments
  files?: FileAttachment[]; // Array of attached files for 'file' type
}


// Keys are identifiers for lab tests, e.g., 'cbc', 'urinalysis'
export type LabTests = Record<string, LabTestResult>;


export interface Checkup {
  id: string;
  date: string;
  place: string; // Nơi khám
  clinicAddress: string; // Địa chỉ phòng khám
  doctor: string; // Bác sĩ khám
  generalExam: GeneralExam;
  labTests: LabTests;
  conclusion: string; // Kết luận
  advice: string; // Lời dặn
}

export interface AppSettings {
  theme: 'light' | 'dark';
  fontFamily: 'sans' | 'serif' | 'mono' | 'times';
  fontSize: 'small' | 'medium' | 'large';
  background: string;
  backgroundImage?: string; // Base64 string
}

export interface CountdownData {
  edd: string | null; // Estimated Due Date
  method: 'lmp' | 'crl' | 'direct' | null;
  inputs: {
    lmp?: string;
    cycleLength?: number;
    crl?: number;
    crlDate?: string;
  };
}

export interface Reminder {
  id: string;
  title: string;
  dateTime: string; // ISO string
  triggered: boolean;
  clinicName?: string;
  clinicAddress?: string;
  doctor?: string;
  content?: string;
}


export type ActiveTab = 'family' | 'tracker' | 'settings' | 'countdown' | 'reminders' | 'notes';
