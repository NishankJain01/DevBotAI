export type Role = 'user' | 'model';

export interface Message {
  id: string;
  role: Role;
  content: string;
  text?: string;
  timestamp: Date;
}

export interface UserProgress {
  completedTopicIds: string[];
}

export interface Skill {
  id: string;
  name: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
