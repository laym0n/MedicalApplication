import {ProfileModel} from '@shared/api/types';

export interface P2PConnectionEstablishPayload {
  type: 'offer' | 'answer' | 'candidate';
  sourceSessionId?: string;
  sourceProfile?: ProfileModel;
  destinationSessionId?: string;
  destinationUserId?: string;
  offer?: any;
  answer?: any;
  candidate?: any;
}
