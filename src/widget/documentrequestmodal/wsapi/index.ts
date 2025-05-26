import { useCallback } from 'react';
import { RTCSessionDescription } from 'react-native-webrtc';
import { P2PConnectionEstablishPayload, P2pPayload } from '../types';
import { useWebRTCContext } from '@app/context/webrtccontext';
import { useConnectViaWebSocket } from './websocket';
import {
  useCloseCommonRtcPeerConnection,
  useCreateNewCommonRTCPeerConnection,
} from './rtcpeerconnectioncommon';
import useSendConsultation from './sendconsultation';
import useSendDocument from './senddocument';
import useSendPatientProfile from './sendpatientprofile';
import { useAddSendHandlersRTCPeerConnection } from './rtcpeerconnectionsendinit';
import useSendEOF from './sendeof';
import useAddUploadHandlersP2P from './rtcpeerconnectionuploadinit';

export const useP2PConnection = (
  onOfferReceived: (payload: P2PConnectionEstablishPayload) => void,
  onP2pPayloadReceived: (payload: P2pPayload) => void,
) => {
  const {
    lastReceivedOfferRef,
    sendViaWebSocketRef,
    rtcPeerConnectionRef,
  } = useWebRTCContext();
  const { connectViaWebSocket, disconnectViaWebSocket } = useConnectViaWebSocket(onOfferReceived);
  const createNewCommonPeerConnection = useCreateNewCommonRTCPeerConnection();
  const addSendHandlerForP2P = useAddSendHandlersRTCPeerConnection();
  const addUploadHandlerForP2P = useAddUploadHandlersP2P(onP2pPayloadReceived);

  const createNewPeerConnection = useCallback(async () => {
    await createNewCommonPeerConnection();
    addSendHandlerForP2P();
    addUploadHandlerForP2P();
  }, [addSendHandlerForP2P, createNewCommonPeerConnection, addUploadHandlerForP2P]);
  const closeCommonP2PConnection = useCloseCommonRtcPeerConnection();

  const sendAnswer = useCallback(() => {
    const remoteDescription = new RTCSessionDescription(
      lastReceivedOfferRef.current!.offer,
    );
    return rtcPeerConnectionRef
      .current!.setRemoteDescription(remoteDescription)
      .then(() => rtcPeerConnectionRef.current?.createAnswer())
      .then(async answer => {
        await rtcPeerConnectionRef.current?.setLocalDescription(answer);
        await sendViaWebSocketRef.current!({
          type: 'answer',
          answer,
          destinationSessionId: lastReceivedOfferRef.current!.sourceSessionId,
        });
      })
      .catch(console.error);
  }, [lastReceivedOfferRef, rtcPeerConnectionRef, sendViaWebSocketRef]);

  const sendReadyToReceiveConsultationResult = useCallback(() => {
    return sendAnswer();
  }, [sendAnswer]);
  const sendReadyToSendData = useCallback(async () => {
    await sendAnswer();
    await new Promise<void>(resolve => {
      if (
        rtcPeerConnectionRef.current?.iceGatheringState === 'complete'
      ) {
        resolve();
      } else {
        const checkState = () => {
          if (
            rtcPeerConnectionRef.current?.iceGatheringState === 'complete'
          ) {
            rtcPeerConnectionRef.current?.removeEventListener(
              'icegatheringstatechange',
              checkState,
            );
            resolve();
          }
        };
        rtcPeerConnectionRef.current?.addEventListener(
          'icegatheringstatechange',
          checkState,
        );
      }
    });
  }, [rtcPeerConnectionRef, sendAnswer]);

  const { sendViaP2P: sendConsultationViaP2p } = useSendConsultation();
  const { sendViaP2P: sendDocumentViaP2p } = useSendDocument();
  const { sendViaP2P: sendPatientProfileViaP2p } = useSendPatientProfile();
  const { sendViaP2P: sendEOFViaP2P } = useSendEOF();
  return {
    connectViaWebSocket,
    disconnectViaWebSocket,
    createNewPeerConnection,
    closeP2PConnection: closeCommonP2PConnection,
    sendReadyToSendData,
    sendReadyToReceiveConsultationResult,
    sendConsultationViaP2p,
    sendDocumentViaP2p,
    sendPatientProfileViaP2p,
    sendEOFViaP2P,
  };
};
