
import React from 'react';
import { Branch } from './types';

export const BRANCHES = Object.values(Branch);
export const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export const LIGHT_THEME = {
  background: 'bg-[#050505]',
  primary: 'bg-red-900',
  secondary: 'bg-zinc-900',
  accent: 'text-red-500',
  border: 'border-zinc-800',
  hover: 'hover:bg-red-800',
};

export const Icons = {
  Feather: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-feather"><path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/></svg>
  ),
  Apple: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-red-600"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/><path d="M12 5C12.5 5 13 5.5 13 6V7C13 7.5 12.5 8 12 8C11.5 8 11 7.5 11 7V6C11 5.5 11.5 5 12 5Z" fill="#000"/></svg>
  )
};
