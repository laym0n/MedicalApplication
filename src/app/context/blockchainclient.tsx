import axios, {AxiosInstance} from 'axios';
import {createContext, useContext} from 'react';

const baseURL = 'https://devnet.bundlr.network';
export const blockChainAxiosInstance = axios.create({
  baseURL,
});
export const BlockChainAxiosContext = createContext<AxiosInstance>(
  blockChainAxiosInstance,
);
export const useBlockChainAxiosInstance = () =>
  useContext<AxiosInstance>(BlockChainAxiosContext);
