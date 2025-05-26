import { useCallback } from 'react';
import { P2pPayload, P2pPayloadType } from '../types';

const useP2PPayloadHandler = (payloadType: P2pPayloadType, dataHandler: (data: any) => void) => {
    const p2pPayloadHandler = useCallback((payload: P2pPayload) => {
        if (!payload || payload.type !== payloadType) {
            return;
        }
        dataHandler(payload.data);
    }, [dataHandler, payloadType]);

    return p2pPayloadHandler;
};

export default useP2PPayloadHandler;
