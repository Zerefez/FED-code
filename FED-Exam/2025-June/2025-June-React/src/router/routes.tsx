import { CreateExamPage, ExamsPage, HistoryPage, HomePage, StartExamPage } from '@/pages';
import { RouteObject } from 'react-router-dom';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/exams',
    element: <ExamsPage />,
  },
  {
    path: '/create-exam',
    element: <CreateExamPage />,
  },
  {
    path: '/start-exam',
    element: <StartExamPage />,
  },
  {
    path: '/start-exam/:examId',
    element: <StartExamPage />,
  },
  {
    path: '/history',
    element: <HistoryPage />,
  },
];

export interface NavigationItem {
  path: string;
  label: string;
  isExact?: boolean;
}

export const navigationItems: NavigationItem[] = [
  { path: '/', label: 'Hjem', isExact: true },
  { path: '/exams', label: 'Se Alle Eksamener' },
  { path: '/create-exam', label: 'Opret Eksamen' },
  { path: '/start-exam', label: 'Start Eksamen' },
  { path: '/history', label: 'Se Historik' },
]; 