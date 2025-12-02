import React from "react";
import CatalogPage from "./CatalogPage";
import { actions } from "../data/catalogData";
import { services } from "../data/catalogData";
import type { CatalogItem } from "../data/catalogData";
import { useNavigate } from "react-router-dom";

interface ActionsProps {
  onFinish?: (service: string | null, action: string | null) => void;
}

export default function Actions({ onFinish }: ActionsProps) {
    const navigate = useNavigate();

    const [selectedService, setSelectedService] = React.useState<string | null>(null);
    const [selectedAction, setSelectedAction] = React.useState<string | null>(null);

    const handleServiceSelect = (item: CatalogItem) => {
        setSelectedService(item.plateforme ?? null);
    };

    const handleActionSelect = (item: CatalogItem) => {
        setSelectedAction(item.titre ?? null);
        if (onFinish)
          onFinish(selectedService, item.titre ?? null);
    }

    return (
    <div className="justify-center text-center">
      {selectedService === null ? (
        <CatalogPage items={services} description="Choose a service for your action" onSelect={handleServiceSelect} />
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
