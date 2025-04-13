import { wsBaseUrl } from '@app/constants';
import { createContext } from 'react';
import {
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  registerGlobals,
} from 'react-native-webrtc';

const baseURL = wsBaseUrl;
export const webSocket = new WebSocket(baseURL + '/p2p-signaling');

registerGlobals();
let peerConstraints = {
  iceServers: [
    {
      urls: 'stun:stun.relay.metered.ca:80',
    },
    {
      urls: 'turn:global.relay.metered.ca:80',
      username: 'c5fc894f2b801b2a923583a8',
      credential: 'VGQoRi3goCxwt7i6',
    },
    {
      urls: 'turn:global.relay.metered.ca:80?transport=tcp',
      username: 'c5fc894f2b801b2a923583a8',
      credential: 'VGQoRi3goCxwt7i6',
    },
    {
      urls: 'turn:global.relay.metered.ca:443',
      username: 'c5fc894f2b801b2a923583a8',
      credential: 'VGQoRi3goCxwt7i6',
    },
    {
      urls: 'turns:global.relay.metered.ca:443?transport=tcp',
      username: 'c5fc894f2b801b2a923583a8',
      credential: 'VGQoRi3goCxwt7i6',
    },
  ],
};
export const peerConnection = new RTCPeerConnection(peerConstraints);

let sessionConstraints = {};

webSocket.onopen = async () => {
  console.log('open connection');
  // const offerDescription = await peerConnection.createOffer( sessionConstraints );
  // await peerConnection.setLocalDescription( offerDescription );
  // webSocket.send(JSON.stringify({
  //   type: 'offer',
  //   offer: offerDescription,
  // }));
};
webSocket.onerror = e => {
  console.log(e);
};

peerConnection.addEventListener('icecandidate', event => {
  if (event.candidate) {
    console.log('Add received icecandidate');
    webSocket.send(
      JSON.stringify({
        type: 'candidate',
        candidate: event.candidate,
      }),
    );
  }
});
peerConnection.addEventListener('datachannel', event => {
  let datachannel = event.channel;
  datachannel.addEventListener('open', event1 => {
    console.log(`📡 DataChannel открыт ${event1}`);
    datachannel.send('Answer via P2P');
  });
  datachannel.addEventListener('message', event1 => {
    console.log(`📡 DataChannel сообщение ${JSON.stringify(event1)}`);
  });
  datachannel.addEventListener('close', event1 => {
    console.log(`📡 DataChannel закрыт ${JSON.stringify(event1)}`);
  });
});
peerConnection.addEventListener('connectionstatechange', event => {
  console.log('🔄 connection state:', peerConnection.connectionState);
});
peerConnection.addEventListener('iceconnectionstatechange', event => {
  console.log('❄️ ice state:', peerConnection.iceConnectionState);
});

webSocket.onmessage = async message => {
  const data = JSON.parse(message.data);

  console.log(data.type);
  try {
    switch (data.type) {
      case 'offer': {
        const remoteDescription = new RTCSessionDescription(data.offer);
        await peerConnection
          .setRemoteDescription(remoteDescription)
          .catch(console.error);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        webSocket.send(JSON.stringify({type: 'answer', answer}));
        break;
      }

      case 'answer': {
        const remoteDescription = new RTCSessionDescription(data.answer);
        await peerConnection
          .setRemoteDescription(remoteDescription)
          .catch(console.error);
        break;
      }

      case 'candidate': {
        const icecandidate = new RTCIceCandidate(data.candidate);
        await peerConnection
          .addIceCandidate(new RTCIceCandidate(icecandidate))
          .catch(console.error);

        break;
      }
    }
  } catch (e) {
    console.error('Error', e);
  }
};

export const WebSocketContext = createContext<WebSocket>(webSocket);
export const RTCPeerConnectionContext =
  createContext<RTCPeerConnection>(peerConnection);
