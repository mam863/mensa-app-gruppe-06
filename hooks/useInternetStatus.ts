// hooks/useInternetStatus.ts
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export const useInternetStatus = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });
        return () => unsubscribe();
    }, []);

    return isConnected;
};
