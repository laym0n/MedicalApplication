import { useAxiosInstance } from '@app/context/httpclient';
import {AuthenticationRequest} from '@shared/api/types';

import {useMutation} from '@tanstack/react-query';

const useSignInCall = () => {
  const axiosInstance = useAxiosInstance();
  return useMutation<void, Error, AuthenticationRequest>({
    mutationKey: ['authentication'],
    mutationFn: async request => {
      return axiosInstance
        .post('/authentication', request)
        .then(response => response.data);
    },
  });
};

export default useSignInCall;
