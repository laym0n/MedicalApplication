import { useCallback } from 'react';
import { ConsultationPayload, P2PConnectionEstablishPayload } from '../types';
import { useConsultationModel } from '@shared/model/consultationmodel';
import { Consultation } from '@shared/db/entity/consultation';
import { TaskQueue } from '@shared/util/TaskQueue';

const useConsultationHandler = (offer: P2PConnectionEstablishPayload | null, promiseQueue: TaskQueue) => {
    const { save } = useConsultationModel();
    const handleReceiveConsultationPayload = useCallback((payload: ConsultationPayload) => {
        const consultation = new Consultation();
        consultation.data = payload.data;
        consultation.consultationId = offer!.consultationId!;
        const handleSaveConsultation = async () => {
            try {
                await save(consultation);
            } catch (e) {
                console.error(e);
            }
        };
        promiseQueue.push(handleSaveConsultation);
    }, [offer, promiseQueue, save]);
    return { handleReceiveConsultationPayload };
};

export default useConsultationHandler;
