import {getIceServers} from '@app/constants';
import {useCallback} from 'react';
import {registerGlobals, RTCPeerConnection} from 'react-native-webrtc';
import {DocumentMetadata} from '../types';
import {Document} from '@shared/db/entity/document';
import {useWebRTCContext} from './context';
import {uint8ArrayToBase64} from './utils';

registerGlobals();

export const useCloseRtcPeerConnection = () => {
  const {dataChannelRef, rtcPeerConnectionRef} = useWebRTCContext();
  const closeRtcPeerConnection = useCallback(() => {
    if (dataChannelRef.current) {
      if (
        dataChannelRef.current.readyState === 'open' ||
        dataChannelRef.current.readyState === 'connecting'
      ) {
        dataChannelRef.current.close();
      }
      dataChannelRef.current = undefined;
    }

    if (rtcPeerConnectionRef.current) {
      rtcPeerConnectionRef.current.getSenders().forEach(sender => {
        if (sender.track) {
          sender.track.stop();
        }
      });

      rtcPeerConnectionRef.current.close();
      rtcPeerConnectionRef.current = undefined;
    }
  }, [dataChannelRef, rtcPeerConnectionRef]);
  return closeRtcPeerConnection;
};

export const useCreateNewRTCPeerConnection = () => {
  const {
    sendViaWebSocketRef,
    rtcPeerConnectionRef,
    dataChannelRef,
    sendViaDataChannelRef,
  } = useWebRTCContext();
  const closeRTCPeerConnection = useCloseRtcPeerConnection();
  return useCallback(
    async (
      onFileReceive?: (args: {pureFile: string; document: Document}) => void,
    ) => {
      const peerConstraints = {
        iceServers: await getIceServers(),
      };
      const newPeerConnection = new RTCPeerConnection(peerConstraints);

      newPeerConnection.addEventListener('icegatheringstatechange', () => {
        console.log(
          'ICE Gathering State:',
          newPeerConnection.iceGatheringState,
        );
      });
      newPeerConnection.addEventListener('connectionstatechange', () => {
        console.log('🔄 connection state:', newPeerConnection.connectionState);
      });
      newPeerConnection.addEventListener('icecandidate', event => {
        if (event.candidate) {
          console.log('Add received icecandidate');
          sendViaWebSocketRef.current!({
            type: 'candidate',
            candidate: event.candidate,
          });
        }
      });
      newPeerConnection.addEventListener('iceconnectionstatechange', () => {
        console.log('❄️ ice state:', newPeerConnection.iceConnectionState);
        if (
          newPeerConnection.iceConnectionState === 'disconnected' ||
          newPeerConnection.iceConnectionState === 'failed' ||
          newPeerConnection.iceConnectionState === 'closed'
        ) {
          console.log('Соединение разорвано');
          closeRTCPeerConnection();
        }
      });

      let receivedChunks: Uint8Array[] = [];
      let receivedMeta: DocumentMetadata | null = null;
      newPeerConnection.addEventListener('datachannel', event => {
        let datachannel = event.channel;
        datachannel.addEventListener('open', openEvent => {
          console.log(`📡 DataChannel открыт ${openEvent}`);
        });
        datachannel.addEventListener('message', messageReceivedEvent => {
          const data = messageReceivedEvent.data;
          if (typeof data === 'string') {
            if (data === 'EOF') {
              console.log('📥 Получен EOF');
              const pureFile = uint8ArrayToBase64(receivedChunks);
              const document = new Document();
              document.name = receivedMeta!.name!;
              document.mime = receivedMeta!.mime!;
              onFileReceive!({pureFile, document});
              receivedChunks = [];
              receivedMeta = null;
              return;
            }
            receivedMeta = JSON.parse(data) as DocumentMetadata;
            console.log('📥 Метаданные:', receivedMeta);
          } else if (data instanceof ArrayBuffer) {
            console.log('Receive chunk');
            receivedChunks.push(new Uint8Array(data));
          } else {
            console.warn('⚠️ Неизвестный тип данных:', data);
          }
        });
        datachannel.addEventListener('close', closeEvent => {
          console.log(`📡 DataChannel закрыт ${JSON.stringify(closeEvent)}`);
        });
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
    },
    [
      closeRTCPeerConnection,
      dataChannelRef,
      rtcPeerConnectionRef,
      sendViaDataChannelRef,
      sendViaWebSocketRef,
    ],
  );
};
