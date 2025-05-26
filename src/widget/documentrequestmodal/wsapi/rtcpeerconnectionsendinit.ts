import { useCallback } from 'react';
import { P2pPayload } from '../types';
import { useWebRTCContext } from '@app/context/webrtccontext';

export const useAddSendHandlersRTCPeerConnection = () => {
  const {
    dataChannelRef,
    sendViaDataChannelRef,
  } = useWebRTCContext();
  return useCallback(
    () => {
      const dataChannel = dataChannelRef.current;
      if (!dataChannel) {
        return;
      }
      const sendBatch = (data: string) => {
        const dataString = data;
        return new Promise<void>(resolve => {
          if (dataChannel.readyState === 'open') {
            dataChannel.send(dataString);
            resolve();
          }
          dataChannel.addEventListener('open', () => {
            dataChannel.send(dataString);
            resolve();
          });
        });
      };
      sendViaDataChannelRef.current = async (data: P2pPayload) => {
        const dataString = JSON.stringify(data);
        const chunkSize = 16 * 1024 * 10;
        for (let offset = 0; offset < dataString.length; offset += chunkSize) {
          const chunk = dataString.slice(
            offset,
            Math.min(offset + chunkSize, dataString.length),
          );
          await sendBatch(chunk);
        }
        await sendBatch('EOF');
      };
    },
    [dataChannelRef, sendViaDataChannelRef],
  );
};
