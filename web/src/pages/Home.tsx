import { useContext, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
    fetchCatalogFromAbout,
    sortCatalogItemsByLabel,
} from "@/services/aboutParser";
import Button from "../component/button";
import Widget from "../component/widget";
import { ThemeContext } from "../context/theme";

function Home() {
    const navigate = useNavigate();
    const { setTheme, resetTheme } = useContext(ThemeContext);
    const [reactions, setReactions] = useState<
        {
            id: string;
            title: string;
            label: string;
            platform: string;
            color?: string;
            path?: string;
        }[]
    >([]);

    useEffect(() => {
        setTheme("dark");
        return () => resetTheme();
    }, [setTheme, resetTheme]);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            const parsed = await fetchCatalogFromAbout();
            if (mounted)
                setReactions(sortCatalogItemsByLabel(parsed.reactions));
        };

        load();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-start overflow-auto">
            <div className="flex flex-col items-center justify-center w-full gap-10 md:h-[530px] bg-[#242424] pb-8 px-4">
                <p className="text-center text-[#ffffff] text-3xl sm:text-4xl md:text-[75px] font-bold leading-tight">
                    Automate. Save time.
                    <br />
                    Get more done.
                </p>
                <Button
                    className="font-bold text-2xl py-8"
                    label="Start now"
                    mode="white"
                    onClick={() => navigate("/signup")}
                />
            </div>
            <h2 className="text-center text-2xl sm:text-3xl md:text-[45px] font-bold mt-8">
                Get started with any Applet
            </h2>

            <div className="responsiveGrid p-20">
                {reactions.map((act) => (
                    <Widget
                        key={act.id}
                        title={act.label}
                        platform={act.platform}
                        color={act.color}
                        onClick={() =>
                            navigate(
                                act.path ??
                                    `/reaction/${encodeURIComponent(act.id)}`,
                                {
                                    state: {
                                        title: act.label,
                                        color: act.color,
                                    },
                                }
                            )
                        }
                    />
                ))}
            </div>
        </div>
    );
}

export default Home;
