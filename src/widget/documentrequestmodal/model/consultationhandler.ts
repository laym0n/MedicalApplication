import { useCallback } from 'react';
import { ConsultationPayload, P2PConnectionEstablishPayload } from '../types';
import { useConsultationModel } from '@shared/model/consultationmodel';
import { Consultation } from '@shared/db/entity/consultation';

const useConsultationHandler = (offer: P2PConnectionEstablishPayload | null) => {
    const {save} = useConsultationModel();
    const handleReceiveConsultationPayload = useCallback((payload: ConsultationPayload) => {
        const consultation = new Consultation();
        consultation.data = payload.data;
        consultation.consultationId = offer!.consultationId!;
        save(consultation);
    }, [offer, save]);
    return {handleReceiveConsultationPayload};
};

export default useConsultationHandler;
