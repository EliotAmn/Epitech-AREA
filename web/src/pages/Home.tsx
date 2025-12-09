import { useContext, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import Button from "../component/button";
import Widget from "../component/widget";

import "../styles/responsiveGrids.css";

import { ThemeContext } from "../context/theme";
import { actions } from "../data/catalogData";

function Home() {
    const navigate = useNavigate();
    const { setTheme, resetTheme } = useContext(ThemeContext);

    useEffect(() => {
        setTheme("dark");
        return () => resetTheme();
    }, [setTheme, resetTheme]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-start">
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

            <div className="responsiveGrid">
                {actions.map((act) => (
                    <Widget
                        key={act.id}
                        title={act.title}
                        platform={act.platform}
                        color={act.color}
                        onClick={() =>
                            navigate(`/widget/${act.id}`, {
                                state: { title: act.title, color: act.color },
                            })
                        }
                    />
                ))}
            </div>
        </div>
    );
}

export default Home;
