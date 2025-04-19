import {createContext, RefObject, useContext } from 'react';
import {
  RTCPeerConnection,
} from 'react-native-webrtc';
import RTCDataChannel from 'react-native-webrtc/lib/typescript/RTCDataChannel';
import {P2PConnectionEstablishPayload} from '../types';

interface WebRTCContextProps {
  webSocketRef: RefObject<WebSocket | undefined>;
  rtcPeerConnectionRef: RefObject<RTCPeerConnection | undefined>;
  dataChannelRef: RefObject<RTCDataChannel | undefined>;
  sendViaWebSocketRef: RefObject<
    ((data: P2PConnectionEstablishPayload) => Promise<void>) | undefined
  >;
  sendViaDataChannelRef: RefObject<((data: any) => Promise<void>) | undefined>;
  lastReceivedOfferRef: RefObject<P2PConnectionEstablishPayload | undefined>;
}

export const WebRTCContext = createContext<WebRTCContextProps | undefined>(undefined);

export const useWebRTCContext = () => {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error(
      'useWebRTCContext must be used within a WebRTCContextProvider',
    );
  }
  return context;
};
