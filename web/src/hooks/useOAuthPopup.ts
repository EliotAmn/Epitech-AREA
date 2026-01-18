import { useEffect, useRef } from "react";

export type OAuthPopupOptions = {
    width?: number;
    height?: number;
    name?: string;
    pollingInterval?: number;
    left?: number;
    top?: number;
};

export default function useOAuthPopup() {
    const timersRef = useRef<number[]>([]);

    useEffect(() => {
        return () => {
            timersRef.current.forEach((t) => window.clearInterval(t));
            timersRef.current = [];
        };
    }, []);

    const openOAuth = (oauthUrl: string, opts?: OAuthPopupOptions) =>
        new Promise<void>((resolve, reject) => {
            const width = opts?.width ?? 600;
            const height = opts?.height ?? 700;
            const left =
                opts?.left ?? window.screenX + (window.outerWidth - width) / 2;
            const top =
                opts?.top ?? window.screenY + (window.outerHeight - height) / 2;
            const name = opts?.name ?? "OAuthPopup";

            const oauthWindow = window.open(
                oauthUrl,
                name,
                `width=${width},height=${height},left=${left},top=${top}`
            );

            if (!oauthWindow) {
                reject(new Error("Failed to open OAuth window"));
                return;
            }

            const pollingInterval = opts?.pollingInterval ?? 500;

            const messageHandler = (ev: MessageEvent) => {
                try {
                    if (ev.origin !== window.origin) return;
                } catch {
                    // ignore cross-origin access errors
                    return;
                }

                const data = ev.data;
                if (data && data.type === "oauth:service_connected") {
                    window.removeEventListener("message", messageHandler);
                    if (!oauthWindow.closed) {
                        try {
                            oauthWindow.close();
                        } catch {
                            // ignore
                        }
                    }
                    resolve();
                }
            };

            window.addEventListener("message", messageHandler);

            const timer = window.setInterval(() => {
                try {
                    if (oauthWindow.closed) {
                        window.clearInterval(timer);
                        timersRef.current = timersRef.current.filter(
                            (t) => t !== timer
                        );
                        window.removeEventListener("message", messageHandler);
                        resolve();
                    }
                } catch {
                    // ignore cross-origin access errors while window is open
                }
            }, pollingInterval);

            timersRef.current.push(timer);
        });

    return { openOAuth };
}
