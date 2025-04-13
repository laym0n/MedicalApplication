import { AxiosContext } from '@app/context/httpclient';
import { AxiosInstance } from 'axios';
import { useContext } from 'react';

export const useAxiosInstance = () => useContext<AxiosInstance>(AxiosContext);
