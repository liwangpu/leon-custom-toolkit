import { createContext } from 'react';

export interface IOfficalUserForm {
  openSignUpForm(): void;
  openLoginForm(): void;
}

export const OfficalUserFormContext = createContext<IOfficalUserForm>(null);
