import {useAxiosInstance} from '@shared/lib/hooks';
import {useMutation} from '@tanstack/react-query';
import {ConsultationPrescriptionDto} from './types';

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
