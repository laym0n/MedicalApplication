import { useWebRTCContext } from '@app/context/webrtccontext';
import { useCallback } from 'react';
import { P2pPayload, PatientProfilePayload } from '../types';
import { PatientProfile } from '@shared/db/entity/patientprofile';

const useSendPatientProfile = () => {
      const {
            sendViaDataChannelRef,
      } = useWebRTCContext();
      const sendViaP2P = useCallback(
            async (patientProfile: PatientProfile) => {
                  const metadataPayload = {
                        type: 'PATIENT_PROFILE',
                        data: {
                              gender: patientProfile.gender,
                              birthDate: patientProfile.birthDate,
                              socialStatus: patientProfile.socialStatus,
                              disabilityGroup: patientProfile.disabilityGroup,
                              chronicConditions: patientProfile.chronicConditions,
                              medications: patientProfile.medications,
                              allergies: patientProfile.allergies,
                              lifestyleNotes: patientProfile.lifestyleNotes,
                        } as PatientProfilePayload,
                  } as P2pPayload;
                  await sendViaDataChannelRef.current!(metadataPayload);
            },
            [sendViaDataChannelRef],
      );
      return { sendViaP2P };
};

export default useSendPatientProfile;
