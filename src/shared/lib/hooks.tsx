import { AxiosContext } from '@app/context/httpclient';
import { CurrentUserProfileContext } from '@app/context/profilecontext';
import { ProfileModel } from '@shared/api/types';
import { AxiosInstance } from 'axios';
import { useContext } from 'react';

export const useAxiosInstance = () => useContext<AxiosInstance>(AxiosContext);
export const useCurrentUserProfileContext = () => useContext<ProfileModel | null>(CurrentUserProfileContext);
