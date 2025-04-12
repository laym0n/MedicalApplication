import Reactotron, { networking, trackGlobalErrors, trackGlobalLogs, devTools } from 'reactotron-react-native';

Reactotron.configure()
  .useReactNative()
  .use(networking())
  .use(trackGlobalErrors())
  .use(trackGlobalLogs())
  .use(devTools())
  .connect();
