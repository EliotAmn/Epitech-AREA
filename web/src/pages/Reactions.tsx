import React from "react";

import { reactions, services } from "../data/catalogData";
import type { CatalogItem } from "../data/catalogData";
import CatalogPage from "./CatalogPage";

interface ReactionsProps {
    onFinish?: (service: string | null, reaction: string | null) => void;
}

export default function Reactions({ onFinish }: ReactionsProps) {
    const [selectedService, setSelectedService] = React.useState<string | null>(
        null
    );
    const [_selectedReaction, setSelecteReaction] = React.useState<
        string | null
    >(null);

    const handleServiceSelect = (item: CatalogItem) => {
        setSelectedService(item.platform ?? null);
    };

    const handleReactionSelect = (item: CatalogItem) => {
        const reaction = item.title ?? null;
        setSelecteReaction(reaction);
        if (onFinish) onFinish(selectedService, reaction);
    };

    return (
        <div className="justify-center text-center">
            {selectedService === null ? (
                <CatalogPage
                    items={services}
                    description="Choose a service for your reaction"
                    onSelect={handleServiceSelect}
                />
            ) : (
                <CatalogPage
                    items={reactions}
                    description={`Choose a reaction for ${selectedService}`}
                    onSelect={handleReactionSelect}
                />
            )}
        </div>
    );
}
