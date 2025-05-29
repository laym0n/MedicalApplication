import {useMutation} from '@tanstack/react-query';
import {
  BackUpResult,
  ProfileInfoParams,
  ProfileModel,
  ProfilesSearchRequestDto,
  ProfilesSearchResponseDto,
  BackUpRecord,
  ConsultationModel,
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

export const useBackUpRecord = () => {
  const axiosInstance = useAxiosInstance();
  return useMutation<
    BackUpResult,
    Error,
    BackUpRecord
  >({
    mutationFn: async (params: BackUpRecord) => {
      const response = await axiosInstance.post<BackUpResult>(
        '/backup/record',
        params,
      );
      return response.data;
    },
  });
};

export const useBackUpFile = () => {
  const axiosInstance = useAxiosInstance();

  return useMutation<BackUpResult, Error, { base64: string; fileName: string; mimeType: string }>({
    mutationFn: async ({ base64, fileName, mimeType }) => {
      const formData = new FormData();
      formData.append('file', {
        uri: `data:${mimeType};base64,${base64}`,
        name: fileName,
        type: mimeType,
      } as any);

      const response = await axiosInstance.post<BackUpResult>(
        '/backup/file',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    },
  });
};

export const useGetConsultation = () => {
  const axiosInstance = useAxiosInstance();
  return useMutation<ConsultationModel, Error, string>({
    mutationFn: (id: string) => {
      return axiosInstance.get(`/consultation/${id}`).then((response) => response.data);
    },
  });
};
