import {useMutation} from '@tanstack/react-query';
import {ConsultationPrescriptionDto} from './types';
import { useAxiosInstance } from '@app/context/httpclient';

interface UpdateConsultationPrescriptionDto {
  consultationId: string;
  prescription: ConsultationPrescriptionDto;
}

export const useUpdateConsultationPrescription = () => {
  const axiosInstance = useAxiosInstance();
  return useMutation<void, Error, UpdateConsultationPrescriptionDto>({
    mutationFn: (params: UpdateConsultationPrescriptionDto) => {
      return axiosInstance.patch(
        `/consultation/${params.consultationId}/prescription`,
        params.prescription,
      );
    },
  });
};
