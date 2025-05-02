import {useBlockChainAxiosInstance} from '@app/context/blockchainclient';
import {ConsultationPrescriptionDto} from '@shared/api/types';
import {useMutation} from '@tanstack/react-query';

export const useGetConsultation = () => {
  const axiosInstance = useBlockChainAxiosInstance();
  return useMutation<ConsultationPrescriptionDto, Error, string>({
    mutationFn: (txId: string) =>
      axiosInstance.get(`/${txId}`).then(res => res.data),
  });
};
