import { useBlockChainAxiosInstance } from '@app/context/blockchainclient';
import { useMutation } from '@tanstack/react-query';
import { BackUpRecord } from './types';
import { useWeb3StorageAxiosInstance } from '@app/context/web3storageclient';
import { Buffer } from 'buffer';

export const useGetBackupedRecord = () => {
    const axiosInstance = useBlockChainAxiosInstance();
    return useMutation<BackUpRecord, Error, string>({
        mutationFn: (txId: string) =>
            axiosInstance.get(`/${txId}`).then(res => res.data),
    });
};

export const useGetBackupedFile = () => {
    const axiosInstance = useWeb3StorageAxiosInstance();
    return useMutation<string, Error, string>({
        mutationFn: async (txId: string) => {
            const response = await axiosInstance.get(`/${txId}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 YaBrowser/25.4.0.0 Safari/537.36',
                },
                responseType: 'arraybuffer',
            });
            const encryptedArrayBuffer = response.data;
            return Buffer.from(encryptedArrayBuffer).toString('base64');
        },
    });
};
