import { components } from '@shared/api/schema';
import {ProfileModel} from '@shared/api/types';

export interface P2PConnectionEstablishPayload {
  type: 'offer_request' | 'offer_upload' | 'offer_prescription' | 'answer' | 'candidate';
  sourceSessionId?: string;
  sourceProfile?: ProfileModel;
  destinationSessionId?: string;
  destinationUserId?: string;
  offer?: any;
  answer?: any;
  candidate?: any;
}

export interface PrescriptionPayload {
  consultationId: string;
  prescription: string;
}

export interface DocumentMetadata {
  mime: string;
  name: string;
}

export type ConsultationPrescriptionDto = components['schemas']['ConsultationPrescriptionDto'];
