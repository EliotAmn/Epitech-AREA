import Button from "../component/button";
import { useNavigate } from "react-router-dom";
import CatalogPage from "./CatalogPage";
import { actions, services } from "../data/catalogData";
import { useState } from "react";

export default function Explore() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<"all" | "actions" | "services">("all");

    const itemsToShow = filter === "all" ? [...actions, ...services] : filter === "actions" ? actions : services;

    return (

		<div className="min-h-screen flex flex-col items-center justify-start">
            <h1 className="text-5xl text-black font-bold m-5">Explore</h1>
            <div className="mb-6">
                <Button label="Create my own area" mode="white" onClick={() => navigate("/create")} />
            </div>
            <div className="w-3/4 mx-auto pt-4">
                <div className="flex items-center justify-center gap-20 mb-4">
                    <p
                      className={`cursor-pointer text-2xl font-semibold text-center ${filter === "all" ? "underline" : "text-black"}`}
                      onClick={() => setFilter("all")}
                    >
                      All
                    </p>
                    <p
                      className={`cursor-pointer text-2xl font-semibold text-center ${filter === "actions" ? "underline" : "text-black"}`}
                      onClick={() => setFilter("actions")}
                    >
                      Actions
                    </p>
                    <p
                      className={`cursor-pointer text-2xl font-semibold text-center ${filter === "services" ? "underline" : "text-black"}`}
                      onClick={() => setFilter("services")}
                    >
                      Services
                    </p>
                </div>
            </div>

            <CatalogPage
                items={itemsToShow}
            />
        </div>
    );
}
