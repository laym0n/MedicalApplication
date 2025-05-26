import { useWebRTCContext } from '@app/context/webrtccontext';
import { useCallback } from 'react';
import { DocumentMetaPayload, P2pPayload } from '../types';
import { Document } from '@shared/db/entity/document';

const useSendDocument = () => {
      const {
            sendViaDataChannelRef,
      } = useWebRTCContext();
      const sendViaP2P = useCallback(
            async (pureDocument: string, document: Document) => {
                  const metadataPayload = {
                        type: 'DOCUMENT_META',
                        data: {
                              mime: document.mime,
                              name: document.name,
                        } as DocumentMetaPayload,
                  } as P2pPayload;
                  await sendViaDataChannelRef.current!(metadataPayload);
                  const documentPayload = {
                        type: 'DOCUMENT',
                        data: pureDocument,
                  } as P2pPayload;
                  await sendViaDataChannelRef.current!(documentPayload);
            },
            [sendViaDataChannelRef],
      );
      return {sendViaP2P};
};

export default useSendDocument;
