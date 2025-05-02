import type {components, operations} from './schema';

export type AuthenticationRequest =
  components['schemas']['AuthenticationRequest'];

export type ProfileInfoParams =
  operations['getProfileInfo']['parameters']['query'];
export type ProfileModel = components['schemas']['ProfileModel'];

export type ProfilesSearchRequestDto =
  components['schemas']['ModelsRequestDtoProfileFiltersDto'];
export type ProfilesSearchResponseDto =
  components['schemas']['ModelsResponseDtoProfileModel'];

export type ConsultationModel = components['schemas']['ConsultationModel'];

export type ConsultationPrescriptionDto = components['schemas']['ConsultationPrescriptionDto'];
export type UpdateConsultationPrescriptionDto = {
  consultationId: string;
  prescription: ConsultationPrescriptionDto;
};
