import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import useOAuthPopup from "@/hooks/useOAuthPopup";
import {
    disconnectUserService,
    getUserServiceStatus,
} from "@/services/api/userserviceClient";
import Button from "./button";

type Props = {
    platform: string;
    oauthUrl?: string | null;
    initialConnected?: boolean | null;
    mode?: "white" | "black" | "grey" | "blue";
    className?: string;
    label?: string;
    onConnected?: (connected: boolean) => void;
};

export default function OAuthConnectButton({
    platform,
    oauthUrl,
    initialConnected = null,
    mode,
    className,
    label,
    onConnected,
}: Props) {
    const navigate = useNavigate();
    const { openOAuth } = useOAuthPopup();
    const [connected, setConnected] = useState<boolean | null>(
        initialConnected
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setConnected(initialConnected);
    }, [initialConnected]);

    const handleClick = async () => {
        if (connected) {
            setLoading(true);
            try {
                await disconnectUserService(platform);
                setConnected(false);
                onConnected?.(false);
            } catch (err) {
                console.error("Disconnect failed", err);
            } finally {
                setLoading(false);
            }
            return;
        }

        if (oauthUrl) {
            setLoading(true);
            try {
                await openOAuth(oauthUrl);

                const res = await getUserServiceStatus(platform);
                const isConnected = !!res.connected;
                setConnected(isConnected);
                onConnected?.(isConnected);
            } catch (err) {
                console.error("OAuth flow failed", err);
            } finally {
                setLoading(false);
            }
            return;
        }

        navigate("/create");
    };

    const computedLabel =
        label ?? (connected ? "Disconnect" : `Connect ${platform}`);

    return (
        <Button
            label={
                connected === null
                    ? "Loading..."
                    : loading
                      ? "Please wait..."
                      : computedLabel
            }
            onClick={handleClick}
            disabled={connected === null || loading}
            mode={mode}
            className={className}
        />
    );
}
