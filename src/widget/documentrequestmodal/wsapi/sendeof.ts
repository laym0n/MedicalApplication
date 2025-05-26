import { useWebRTCContext } from '@app/context/webrtccontext';
import { useCallback } from 'react';
import { P2pPayload } from '../types';

const useSendEOF = () => {
      const {
            sendViaDataChannelRef,
      } = useWebRTCContext();
      const sendViaP2P = useCallback(
            async () => {
                  const metadataPayload = {
                        type: 'EOF',
                  } as P2pPayload;
                  await sendViaDataChannelRef.current!(metadataPayload);
            },
            [sendViaDataChannelRef],
      );
      return { sendViaP2P };
};

export default useSendEOF;
