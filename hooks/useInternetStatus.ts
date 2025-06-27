import { useEffect, useState } from 'react';
import * as Network from 'expo-network';

export const useInternetStatus = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);

    useEffect(() => {
        let isMounted = true;

        const checkConnection = async () => {
            try {
                const networkState = await Network.getNetworkStateAsync();
                const reachable = networkState.isInternetReachable ?? networkState.isConnected ?? false;
                if (isMounted) {
                    setIsConnected(reachable);
                }
            } catch (error) {
                if (isMounted) {
                    setIsConnected(false);
                }
            }
        };

        checkConnection();

        const interval = setInterval(checkConnection, 5000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    return isConnected;
};
