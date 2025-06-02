import axios, {AxiosInstance} from 'axios';
import {createContext, useContext} from 'react';

const baseURL = 'https://ipfs.io/ipfs';
export const web3StorageAxiosInstance = axios.create({
  baseURL,
});
export const Web3StorageContext = createContext<AxiosInstance>(
  web3StorageAxiosInstance,
);
export const useWeb3StorageAxiosInstance = () =>
  useContext<AxiosInstance>(Web3StorageContext);
