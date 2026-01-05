
export enum Branch {
  CSE = 'CSE',
  IT = 'IT',
  ETNT = 'ETNT',
  Electrical = 'Electrical',
  Mechanical = 'Mechanical',
  Mining = 'Mining',
  Civil = 'Civil'
}

export enum Step {
  INTERROGATION = 'INTERROGATION',
  DATA_DEMAND = 'DATA_DEMAND',
  TACTICAL_CHOICE = 'TACTICAL_CHOICE',
  QUIZ_PHASE = 'QUIZ_PHASE',
  ILLUMINATION_PHASE = 'ILLUMINATION_PHASE',
  FINALE = 'FINALE'
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface FileData {
  inlineData?: {
    data: string;
    mimeType: string;
  };
  text?: string;
}

export interface UserContext {
  semester: string;
  branch: Branch;
  fileData: FileData | null;
  fileName: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
