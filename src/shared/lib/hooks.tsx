import { AxiosContext } from '@app/constants/client';
import { AxiosInstance } from 'axios';
import { useContext } from 'react';

export const useAxiosInstance = () => useContext<AxiosInstance>(AxiosContext);
