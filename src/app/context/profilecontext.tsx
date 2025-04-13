import { ProfileModel } from '@shared/api/types';
import { createContext } from 'react';

export const CurrentUserProfileContext = createContext<ProfileModel | null>(null);
