import { useCallback } from 'react';
import { ConsultationPayload } from '../types';
import { useConsultationModel } from '@shared/model/consultationmodel';
import { Consultation } from '@shared/db/entity/consultation';

const useConsultationHandler = () => {
    const {save} = useConsultationModel();
    const handleReceiveConsultationPayload = useCallback((payload: ConsultationPayload) => {
        const consultation = new Consultation();
        consultation.data = payload.data;
        consultation.consultationId = payload.consultationId;
        save(consultation);
    }, [save]);
    return {handleReceiveConsultationPayload};
};

export default useConsultationHandler;
