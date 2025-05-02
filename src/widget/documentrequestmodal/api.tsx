import {useMutation} from '@tanstack/react-query';
import {BlockchainRecord, ConsultationPrescriptionDto} from './types';
import {useAxiosInstance} from '@app/context/httpclient';

interface UpdateConsultationPrescriptionDto {
  consultationId: string;
  prescription: ConsultationPrescriptionDto;
}

export const useUpdateConsultationPrescription = () => {
  const axiosInstance = useAxiosInstance();
  return useMutation<
    BlockchainRecord,
    Error,
    UpdateConsultationPrescriptionDto
  >({
    mutationFn: (params: UpdateConsultationPrescriptionDto) => {
      return axiosInstance
        .patch<BlockchainRecord>(
          `/consultation/${params.consultationId}/prescription`,
          params.prescription,
        )
        .then(response => response.data);
    },
  });
};
