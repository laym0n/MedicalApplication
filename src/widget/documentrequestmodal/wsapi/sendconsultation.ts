import { useWebRTCContext } from '@app/context/webrtccontext';
import { useCallback } from 'react';
import { ConsultationPayload, P2pPayload } from '../types';
import { Consultation } from '@shared/db/entity/consultation';

const useSendConsultation = () => {
      const {
            sendViaDataChannelRef,
      } = useWebRTCContext();
      const sendViaP2P = useCallback(
            async (consultation: Consultation) => {
                  const consultationPayload = {
                        type: 'CONSULTATION',
                        data: {
                              data: consultation.data,
                        } as ConsultationPayload,
                  } as P2pPayload;
                  await sendViaDataChannelRef.current!(consultationPayload);
            },
            [sendViaDataChannelRef],
      );
      return { sendViaP2P };
};

export default useSendConsultation;
