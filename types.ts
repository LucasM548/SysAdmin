

export enum View {
  DASHBOARD = 'DASHBOARD',
  CHAPTER = 'CHAPTER',
  CHEATSHEET = 'CHEATSHEET',
}

export interface FileSystemNode {
  type: 'file' | 'directory';
  name: string;
  children?: { [key: string]: FileSystemNode };
  content?: string;
  permissions: string;
  owner: string;
}

export interface TerminalState {
  history: TerminalOutput[];
  cwd: string;
  fileSystem: FileSystemNode;
}

export interface TerminalOutput {
  id: string;
  type: 'command' | 'output' | 'error' | 'success';
  content: string;
  cwd?: string;
}

export interface Exercise {
  id: string;
  question: string;
  hint: string;
  validationType: 'command_success' | 'file_exists' | 'dir_exists' | 'file_content' | 'cwd_check';
  validationValue: string; // The command expected, the file path, or "filename:content_string"
  completed: boolean;
}

export interface LessonSection {
  title: string;
  content: string[];
  code?: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: LessonSection[];
  exercises: Exercise[];
  initialFileSystem: FileSystemNode; // State of FS at start of chapter
}

export interface CommandRef {
  command: string;
  description: string;
  example: string;
}

export interface Question {
  id: string;
  question: string;
  hint?: string;
  answer: string;
}

export interface CourseTopic {
  title: string;
  sections: LessonSection[];
}