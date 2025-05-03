import {useCallback} from 'react';
import {RTCSessionDescription} from 'react-native-webrtc';
import {DocumentMetadata, P2PConnectionEstablishPayload} from '../types';
import {useWebRTCContext} from '@app/context/webrtccontext';
import {useConnectViaWebSocket} from './websocket';
import {
  useCloseRtcPeerConnection,
  useCreateNewRTCPeerConnection,
} from './rtcpeerconnection';
import {Document} from '@shared/db/entity/document';
import {base64ToUint8Array} from './utils';

export const useP2PConnection = (
  onOfferReceived: (payload: P2PConnectionEstablishPayload) => void,
) => {
  const {
    lastReceivedOfferRef,
    sendViaWebSocketRef,
    sendViaDataChannelRef,
    rtcPeerConnectionRef,
  } = useWebRTCContext();
  const {connectViaWebSocket, disconnectViaWebSocket} = useConnectViaWebSocket(onOfferReceived);
  const createNewPeerConnection = useCreateNewRTCPeerConnection();
  const closeP2PConnection = useCloseRtcPeerConnection();

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

  const sendDocumentViaP2P = useCallback(
    (pureDocument: string, document: Document) => {
      return sendAnswer()
        .then(() => {
          return new Promise<void>(resolve => {
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
        })
        .then(() => {
          return sendViaDataChannelRef.current!(
            JSON.stringify({
              mime: document.mime,
              name: document.name,
            } as DocumentMetadata),
          );
        })
        .then(async () => {
          const chunkSize = 16 * 1024 * 10;
          const buffer = base64ToUint8Array(pureDocument);
          for (let offset = 0; offset < buffer.length; offset += chunkSize) {
            const chunk = buffer.slice(
              offset,
              Math.min(offset + chunkSize, buffer.length),
            );
            await sendViaDataChannelRef.current!(chunk);
          }
          await sendViaDataChannelRef.current!('EOF');
        })
        .catch(console.error);
    },
    [rtcPeerConnectionRef, sendAnswer, sendViaDataChannelRef],
  );
  const sendReadyToReceiveFile = useCallback(() => {
    return sendAnswer();
  }, [sendAnswer]);
  const sendReadyToReceivePrescription = useCallback(() => {
    return sendAnswer();
  }, [sendAnswer]);
  return {
    connectViaWebSocket,
    disconnectViaWebSocket,
    createNewPeerConnection,
    sendDocumentViaP2P,
    sendReadyToReceiveFile,
    closeP2PConnection,
    sendReadyToReceivePrescription,
  };
};
