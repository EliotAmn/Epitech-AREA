import React from "react";

import { actions, services } from "../data/catalogData";
import type { CatalogItem } from "../data/catalogData";
import CatalogPage from "./CatalogPage";

interface ActionsProps {
    onFinish?: (service: string | null, action: string | null) => void;
}

export default function Actions({ onFinish }: ActionsProps) {
    const [selectedService, setSelectedService] = React.useState<string | null>(
        null
    );
    const [_selectedAction, setSelectedAction] = React.useState<string | null>(
        null
    );

    const handleServiceSelect = (item: CatalogItem) => {
        setSelectedService(item.platform ?? null);
    };

    const handleActionSelect = (item: CatalogItem) => {
        setSelectedAction(item.title ?? null);
        if (onFinish) onFinish(selectedService, item.title ?? null);
    };

    return (
        <div className="justify-center text-center">
            {selectedService === null ? (
                <CatalogPage
                    items={services}
                    description="Choose a service for your action"
                    onSelect={handleServiceSelect}
                />
            ) : (
                <CatalogPage
                    items={actions}
                    description={`Choose an action for ${selectedService}`}
                    onSelect={handleActionSelect}
                />
            )}
        </div>
    );
}
