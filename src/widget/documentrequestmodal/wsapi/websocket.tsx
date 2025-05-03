import {useCallback} from 'react';
import {RTCIceCandidate, RTCPeerConnection} from 'react-native-webrtc';
import {P2PConnectionEstablishPayload} from '../types';
import {useWebRTCContext} from '@app/context/webrtccontext';
import {wsBaseUrl} from '@app/constants';

const baseURL = wsBaseUrl;
const rtcPeerConnectionActiveStates = new Set<string>([
  'new',
  'connected',
  'connecting',
]);

const isActivePeerConnection = (peerConnection?: RTCPeerConnection) =>
  peerConnection &&
  rtcPeerConnectionActiveStates.has(peerConnection.connectionState);

export const useConnectViaWebSocket = (
  onOfferReceived: (payload: P2PConnectionEstablishPayload) => void,
) => {
  const {
    webSocketRef,
    sendViaWebSocketRef,
    lastReceivedOfferRef,
    rtcPeerConnectionRef,
  } = useWebRTCContext();

  const connectViaWebSocket = useCallback(() => {
    if (webSocketRef.current) {
      console.log('Connection already openned');
      return;
    }
    const newWebSocket = new WebSocket(baseURL + '/p2p-signaling');
    newWebSocket.addEventListener('open', () => {
      console.log('open connection');
    });
    newWebSocket.addEventListener('close', () => {
      console.log('close connection');
    });
    newWebSocket.addEventListener('error', e => {
      console.log(e);
    });
    newWebSocket.addEventListener('message', receivedMessage => {
      const data: P2PConnectionEstablishPayload = JSON.parse(
        receivedMessage.data,
      );

      try {
        console.log(data.type);
        switch (data.type) {
          case 'offer_request':
          case 'offer_prescription':
          case 'offer_upload': {
            if (isActivePeerConnection(rtcPeerConnectionRef.current)) {
              console.log('Not exists rtcPeerConnection for offer');
              return;
            }
            onOfferReceived(data);
            lastReceivedOfferRef.current = data;
            break;
          }

          case 'candidate': {
            if (!rtcPeerConnectionRef.current) {
              console.log('Not exists rtcPeerConnection for candidate');
              return;
            }
            const icecandidate = new RTCIceCandidate(data.candidate);
            rtcPeerConnectionRef.current
              .addIceCandidate(new RTCIceCandidate(icecandidate))
              .catch(console.error);
            break;
          }
        }
      } catch (error) {
        console.error('Error', error);
      }
    });
    sendViaWebSocketRef.current = data => {
      return new Promise(resolve => {
        if (newWebSocket.readyState === WebSocket.OPEN) {
          newWebSocket.send(JSON.stringify(data));
          resolve(undefined);
        } else {
          newWebSocket.addEventListener('open', () => {
            newWebSocket.send(JSON.stringify(data));
            resolve(undefined);
          });
        }
      });
    };
    webSocketRef.current = newWebSocket;
  }, [
    lastReceivedOfferRef,
    onOfferReceived,
    rtcPeerConnectionRef,
    sendViaWebSocketRef,
    webSocketRef,
  ]);
  const disconnectViaWebSocket = useCallback(() => {
    const currentWebSocket = webSocketRef.current;
    if (!currentWebSocket) {
      return;
    }
    currentWebSocket.close();
    webSocketRef.current = undefined;
  }, [webSocketRef]);
  return {connectViaWebSocket, disconnectViaWebSocket};
};
