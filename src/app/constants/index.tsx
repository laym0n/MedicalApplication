export const host = '10.0.2.2:8081';
export const httpBaseUrl = 'http://' + host;
export const wsBaseUrl = 'ws://' + host;

export const getIceServers = async () => {
  return [
    { urls: 'stun:stun.relay.metered.ca:80' },
    {
      urls: 'turn:global.relay.metered.ca:80',
      username: 'ec095886c39c330ab75bf964',
      credential: 'lIOvm8gCrpZYhHJR',
    },
    {
      urls: 'turn:global.relay.metered.ca:80?transport=tcp',
      username: 'ec095886c39c330ab75bf964',
      credential: 'lIOvm8gCrpZYhHJR',
    },
    {
      urls: 'turn:global.relay.metered.ca:443',
      username: 'ec095886c39c330ab75bf964',
      credential: 'lIOvm8gCrpZYhHJR',
    },
    {
      urls: 'turns:global.relay.metered.ca:443?transport=tcp',
      username: 'ec095886c39c330ab75bf964',
      credential: 'lIOvm8gCrpZYhHJR',
    },
  ];
};
