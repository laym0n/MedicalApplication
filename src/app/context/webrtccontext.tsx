import {createContext, RefObject, useContext, useRef } from 'react';
import {
  RTCPeerConnection,
} from 'react-native-webrtc';
import RTCDataChannel from 'react-native-webrtc/lib/typescript/RTCDataChannel';
import {P2PConnectionEstablishPayload} from '@widget/documentrequestmodal/types';

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

export const WebRTCContextProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const webSocketRef = useRef<WebSocket | undefined>(undefined);
  const rtcPeerConnectionRef = useRef<RTCPeerConnection | undefined>(undefined);
  const dataChannelRef = useRef<RTCDataChannel | undefined>(undefined);
  const lastReceivedOfferRef = useRef<
    P2PConnectionEstablishPayload | undefined
  >(undefined);

  const sendViaWebSocketRef =
    useRef<(data: P2PConnectionEstablishPayload) => Promise<void>>(undefined);
  const sendViaDataChannelRef = useRef<(data: any) => Promise<void>>(undefined);

  return (
    <WebRTCContext.Provider
      value={{
        webSocketRef,
        sendViaWebSocketRef,
        lastReceivedOfferRef,
        rtcPeerConnectionRef,
        dataChannelRef,
        sendViaDataChannelRef,
      }}>
      {children}
    </WebRTCContext.Provider>
  );
};
