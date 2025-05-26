import { useCallback } from 'react';
import { P2pPayload } from '../types';
import { useWebRTCContext } from '@app/context/webrtccontext';

const useAddUploadHandlersP2P = (onReceivePayload: (payload: P2pPayload) => void) => {
  const {
    rtcPeerConnectionRef,
  } = useWebRTCContext();
  return useCallback(() => {
    const rtcPeerConnection = rtcPeerConnectionRef.current;
    if (!rtcPeerConnection) {
      return;
    }
    rtcPeerConnection.addEventListener('datachannel', (event) => {
      const datachannel = event.channel;
      let receivedChunks: string[] = [];
      datachannel.addEventListener('message', (messageReceivedEvent) => {
        const data = messageReceivedEvent.data as string;
        if (data === 'EOF') {
          console.log('📥 Получен EOF');
          const fullPayloadString = receivedChunks.join('');
          receivedChunks = [];
          const payload: P2pPayload = JSON.parse(fullPayloadString) as P2pPayload;
          onReceivePayload(payload);
          return;
        }
        console.log('Получен chunk');
        receivedChunks.push(data);
      });
    });
  }, [onReceivePayload, rtcPeerConnectionRef]);
};

export default useAddUploadHandlersP2P;
