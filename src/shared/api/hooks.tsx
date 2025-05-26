import {useMutation} from '@tanstack/react-query';
import {
  BlockchainRecord,
  ProfileInfoParams,
  ProfileModel,
  ProfilesSearchRequestDto,
  ProfilesSearchResponseDto,
  UpdateConsultationPrescriptionDto,
} from './types';
import {useAxiosInstance} from '@app/context/httpclient';

export const useGetProfile = (
  setProfile: (profileModel: ProfileModel) => void,
) => {
  const axiosInstance = useAxiosInstance();
  return useMutation<ProfileModel, Error, ProfileInfoParams | void>({
    mutationFn: (params?: ProfileInfoParams | void) => {
      return axiosInstance.get('/profile', {params}).then(res => {
        setProfile(res.data);
        return res.data;
      });
    },
  });
};

export const useSearchProfiles = (
  setProfiles: (response: ProfilesSearchResponseDto) => void,
) => {
  const axiosInstance = useAxiosInstance();
  return useMutation<
    ProfilesSearchResponseDto,
    Error,
    ProfilesSearchRequestDto
  >({
    mutationFn: (request: ProfilesSearchRequestDto) => {
      return axiosInstance.post('/profile/search', request).then(response => {
        setProfiles(response.data);
        return response.data;
      });
    },
  });
};

export const useLogOut = () => {
  const axiosInstance = useAxiosInstance();
  return useMutation({
    mutationFn: () => {
      return axiosInstance.post('/authentication/logout');
    },
  });
};

export const useUpdateConsultationPrescription = () => {
  const axiosInstance = useAxiosInstance();
  return useMutation<
    BlockchainRecord,
    Error,
    UpdateConsultationPrescriptionDto
  >({
    mutationFn: async (params: UpdateConsultationPrescriptionDto) => {
      const response = await axiosInstance.patch<BlockchainRecord>(
        `/consultation/${params.consultationId}/prescription`,
        params.prescription,
      );
      return response.data;
    },
  });
};
