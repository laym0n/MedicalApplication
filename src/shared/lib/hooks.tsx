import { AxiosContext } from '@app/constants';
import { AxiosInstance } from 'axios';
import { useContext } from 'react';

export const useAxiosInstance = () => useContext<AxiosInstance>(AxiosContext);
