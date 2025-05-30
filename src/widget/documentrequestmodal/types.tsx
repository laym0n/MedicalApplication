import {ProfileModel} from '@shared/api/types';
import { Gender } from '@shared/db/entity/enum';

export type P2PConnectionEstablishPayloadType = 'offer_request' | 'offer_upload' | 'answer' | 'candidate';

export interface P2PConnectionEstablishPayload {
  type: P2PConnectionEstablishPayloadType;
  sourceSessionId?: string;
  sourceProfile?: ProfileModel;
  destinationSessionId?: string;
  destinationUserId?: string;
  offer?: any;
  answer?: any;
  candidate?: any;
  consultationId?: string;
}

export interface ConsultationPayload {
  data: string;
}

export interface DocumentMetaPayload {
  mime: string;
  name: string;
}

export interface PatientProfilePayload {
  gender?: Gender;
  birthDate?: string;
  socialStatus?: string;
  disabilityGroup?: string;
  chronicConditions?: string;
  medications?: string;
  allergies?: string;
  lifestyleNotes?: string;
}

export type P2pPayloadType = 'PATIENT_PROFILE' | 'DOCUMENT' | 'DOCUMENT_META' | 'CONSULTATION' | 'EOF';

export interface P2pPayload {
  type: P2pPayloadType;
  data: ConsultationPayload | PatientProfilePayload | DocumentMetaPayload | string;
}

