import Button from "@/component/button";
import GlassCardLayout from "@/component/glassCard";
import OAuthConnectButton from "@/component/OAuthConnectButton";
import { getPlatformIcon } from "@/config/platforms";
import type { CatalogItem } from "@/data/catalogData";

const ConnectCard = ({
    item,
    onConnect,
    onBack,
    onDiscard,
}: {
    item: CatalogItem;
    onConnect: () => void;
    onBack?: () => void;
    onDiscard?: () => void;
}) => {
    const icon = getPlatformIcon(item.platform);
    return (
        <div className="w-full flex-1 flex flex-col">
            <GlassCardLayout color={item.color} onBack={onBack}>
                <div className="flex flex-col w-full max-w-md mx-auto items-center">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-slate-900 leading-tight">
                            Connect your {item.platform} account
                        </h1>
                    </div>
                    <div className="relative mb-8">
                        <div
                            className="absolute inset-0 blur-2xl opacity-30 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        {icon && (
                            <img
                                src={icon}
                                alt={item.platform}
                                className="relative w-32 h-32 object-contain transition-transform hover:scale-110 duration-300"
                            />
                        )}
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-3 w-full max-w-md px-4">
                        {item.oauth_url ? (
                            <OAuthConnectButton
                                platform={item.platform}
                                oauthUrl={item.oauth_url}
                                initialConnected={false}
                                label="Connect"
                                onConnected={(connected) => {
                                    if (connected) onConnect();
                                }}
                                mode="black"
                                className="w-full py-4"
                            />
                        ) : (
                            <Button
                                label="Connect"
                                onClick={onConnect}
                                mode="black"
                                className="w-full py-4"
                            />
                        )}
                        <button
                            onClick={() => onDiscard && onDiscard()}
                            className="text-slate-400 text-xs font-bold uppercase hover:text-slate-600 transition-colors py-2 text-center"
                        >
                            Discard
                        </button>
                    </div>
                </div>
            </GlassCardLayout>
        </div>
    );
};

export default ConnectCard;
