import {ProfileModel} from '@shared/api/types';

export interface P2PConnectionEstablishPayload {
  type: 'offer_request' | 'offer_upload' | 'answer' | 'candidate';
  sourceSessionId?: string;
  sourceProfile?: ProfileModel;
  destinationSessionId?: string;
  destinationUserId?: string;
  offer?: any;
  answer?: any;
  candidate?: any;
}

export interface DocumentMetadata {
  mime: string;
  name: string;
}
