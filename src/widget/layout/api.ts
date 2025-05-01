import { useAxiosInstance } from '@app/context/httpclient';
import { useMutation } from '@tanstack/react-query';

const useSignOutCall = () => {
    const axiosInstance = useAxiosInstance();
    return useMutation<void, Error, void>({
        mutationKey: ['logout'],
        mutationFn: () => {
            return axiosInstance
                .post('/authentication/logout');
        },
    });
};

export default useSignOutCall;
