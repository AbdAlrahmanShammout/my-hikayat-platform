declare module '@react-native-community/netinfo' {
  export type NetInfoState = {
    readonly isConnected: boolean | null;
    readonly isInternetReachable?: boolean | null;
  };
  export function fetch(): Promise<NetInfoState>;
  export function addEventListener(listener: (state: NetInfoState) => void): () => void;
}
