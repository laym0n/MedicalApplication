import { getIceServers } from '@app/constants';
import { useCallback } from 'react';
import { registerGlobals, RTCPeerConnection } from 'react-native-webrtc';
import { useWebRTCContext } from '@app/context/webrtccontext';

registerGlobals();

export const useCloseCommonRtcPeerConnection = () => {
  const { dataChannelRef, rtcPeerConnectionRef } = useWebRTCContext();
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

export const useCreateNewCommonRTCPeerConnection = () => {
  const {
    sendViaWebSocketRef,
    rtcPeerConnectionRef,
    dataChannelRef,
    lastReceivedOfferRef,
  } = useWebRTCContext();
  const closeRTCPeerConnection = useCloseCommonRtcPeerConnection();
  return useCallback(
    async () => {
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
            destinationSessionId: lastReceivedOfferRef.current?.sourceSessionId,
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

      newPeerConnection.addEventListener('datachannel', event => {
        let datachannel = event.channel;
        datachannel.addEventListener('open', openEvent => {
          console.log(`📡 DataChannel открыт ${openEvent}`);
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
    },
    [closeRTCPeerConnection, dataChannelRef, lastReceivedOfferRef, rtcPeerConnectionRef, sendViaWebSocketRef],
  );
};
