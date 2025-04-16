import { getIceServers, wsBaseUrl } from '@app/constants';
import { ProfileModel } from '@shared/api/types';
import {
  createContext,
  RefObject,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {
  registerGlobals,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc';
import RTCDataChannel from 'react-native-webrtc/lib/typescript/RTCDataChannel';
import { P2PConnectionEstablishPayload } from './types';

registerGlobals();
const baseURL = wsBaseUrl;

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

const WebRTCContext = createContext<WebRTCContextProps | undefined>(undefined);

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

const useWebRTCContext = () => {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error(
      'useWebRTCContext must be used within a WebRTCContextProvider',
    );
  }
  return context;
};

const useCreateNewRTCPeerConnection = () => {
  const {
    sendViaWebSocketRef,
    rtcPeerConnectionRef,
    dataChannelRef,
    sendViaDataChannelRef,
  } = useWebRTCContext();
  return useCallback(async () => {
    const peerConstraints = {
      iceServers: await getIceServers(),
    };
    const newPeerConnection = new RTCPeerConnection(peerConstraints);

    newPeerConnection.addEventListener('icecandidate', event => {
      if (event.candidate) {
        console.log('Add received icecandidate');
        sendViaWebSocketRef.current!({
          type: 'candidate',
          candidate: event.candidate,
        });
      }
    });
    newPeerConnection.addEventListener('icegatheringstatechange', () => {
      console.log('ICE Gathering State:', newPeerConnection.iceGatheringState);
    });
    newPeerConnection.addEventListener('datachannel', event => {
      let datachannel = event.channel;
      datachannel.addEventListener('open', event1 => {
        console.log(`📡 DataChannel открыт ${event1}`);
      });
      datachannel.addEventListener('message', event1 => {
        console.log(`📡 DataChannel сообщение ${JSON.stringify(event1)}`);
      });
      datachannel.addEventListener('close', event1 => {
        console.log(`📡 DataChannel закрыт ${JSON.stringify(event1)}`);
      });
    });
    newPeerConnection.addEventListener('connectionstatechange', () => {
      console.log('🔄 connection state:', newPeerConnection.connectionState);
    });
    newPeerConnection.addEventListener('iceconnectionstatechange', () => {
      console.log('❄️ ice state:', newPeerConnection.iceConnectionState);
    });
    rtcPeerConnectionRef.current = newPeerConnection;

    const newDataChannel = newPeerConnection.createDataChannel('meddocs');
    newDataChannel.addEventListener('open', () => {
      console.log('✅ DataChannel открыт');
    });
    newDataChannel.addEventListener('message', event => {
      console.log('📨 Сообщение от пира:', event.data);
    });
    newDataChannel.addEventListener('close', () => {
      console.log('📨 DataChennel закрыт:');
    });
    dataChannelRef.current = newDataChannel;
    sendViaDataChannelRef.current = data => {
      return new Promise<void>(resolve => {
        if (newDataChannel.readyState === 'open') {
          newDataChannel.send(data);
          resolve();
        }
        newDataChannel.addEventListener('open', () => {
          newDataChannel.send(data);
          resolve();
        });
      });
    };
  }, [
    sendViaDataChannelRef,
    sendViaWebSocketRef,
    dataChannelRef,
    rtcPeerConnectionRef,
  ]);
};

const isActivePeerConnection = (peerConnection?: RTCPeerConnection) =>
  peerConnection && peerConnection.connectionState !== 'closed';

const useConnectViaWebSocket = (
  onOfferReceived: (profileModel: ProfileModel) => void,
) => {
  const {
    webSocketRef,
    sendViaWebSocketRef,
    lastReceivedOfferRef,
    rtcPeerConnectionRef,
  } = useWebRTCContext();
  const connectViaWebSocket = useCallback(() => {
    const newWebSocket = new WebSocket(baseURL + '/p2p-signaling');
    newWebSocket.addEventListener('open', () => {
      console.log('open connection');
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
          case 'offer': {
            if (isActivePeerConnection(rtcPeerConnectionRef.current)) {
              console.log('Not exists rtcPeerConnection for offer');
              return;
            }
            onOfferReceived(data.sourceProfile!);
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
  return connectViaWebSocket;
};

export const useSendDataViaP2P = (
  onOfferReceived: (profileModel: ProfileModel) => void,
) => {
  const {
    lastReceivedOfferRef,
    sendViaWebSocketRef,
    sendViaDataChannelRef,
    rtcPeerConnectionRef,
  } = useWebRTCContext();
  const connectViaWebSocket = useConnectViaWebSocket(onOfferReceived);
  const createNewPeerConnection = useCreateNewRTCPeerConnection();

  const sendDataViaP2P = useCallback(
    async (message: any) => {
      await createNewPeerConnection();

      const remoteDescription = new RTCSessionDescription(
        lastReceivedOfferRef.current!.offer,
      );
      rtcPeerConnectionRef.current
        ?.setRemoteDescription(remoteDescription)
        .then(() => rtcPeerConnectionRef.current?.createAnswer())
        .then(answer => {
          rtcPeerConnectionRef.current?.setLocalDescription(answer);
          return answer;
        })
        .then(answer =>
          sendViaWebSocketRef.current!({
            type: 'answer',
            answer,
            destinationSessionId: lastReceivedOfferRef.current!.sourceSessionId,
          }),
        )
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
          sendViaDataChannelRef.current!(message);
        })
        // .then(() => rtcPeerConnectionRef.current?.close())
        .catch(console.error);
    },
    [createNewPeerConnection, lastReceivedOfferRef, rtcPeerConnectionRef, sendViaDataChannelRef, sendViaWebSocketRef],
  );
  return {sendDataViaP2P, connectViaWebSocket};
};
