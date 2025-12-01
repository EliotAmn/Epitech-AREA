import React from 'react';
import CatalogPage from './CatalogPage';
import { reactions } from '../data/catalogData';
import { services } from '../data/catalogData';
import type { CatalogItem } from "../data/catalogData";

interface ReactionsProps {
  onFinish?: (service: string | null, reaction: string | null) => void;
}

export default function Reactions({ onFinish }: ReactionsProps) {
    const [selectedService, setSelectedService] = React.useState<string | null>(null);
    const [selectedReaction, setSelecteReaction] = React.useState<string | null>(null);

    const handleServiceSelect = (item: CatalogItem) => {
        setSelectedService(item.plateforme ?? null);
    };

    const handleReactionSelect = (item: CatalogItem) => {
        const reaction = item.titre ?? null;
        setSelecteReaction(reaction);
        if (onFinish) onFinish(selectedService, reaction);
    }

    return (
    <div className="justify-center text-center">
      {selectedService === null ? (
        <CatalogPage items={services} description="Choose a service for your reaction" onSelect={handleServiceSelect} />
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
