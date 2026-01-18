/**
 * Transformation Registry
 * Provides metadata about available transformations for the frontend.
 */

export interface TransformationMetadata {
  name: string;
  description: string;
  example: string;
  parameters: {
    name: string;
    description: string;
    required: boolean;
  }[];
  inputTypes: string[];
  outputType: string;
}

export const TRANSFORMATION_REGISTRY: TransformationMetadata[] = [
  {
    name: 'split',
    description: 'Sépare une valeur en plusieurs éléments',
    example: 'message | split("DESC")',
    parameters: [
      {
        name: 'separator',
        description: 'Le séparateur à utiliser',
        required: true,
      },
    ],
    inputTypes: ['string', 'array'],
    outputType: 'array',
  },
  {
    name: 'select',
    description: 'Sélectionne un élément par position (à partir de 1)',
    example: 'split("DESC") | select(1)',
    parameters: [
      {
        name: 'index',
        description: "Position de l'élément (commence à 1)",
        required: true,
      },
    ],
    inputTypes: ['array'],
    outputType: 'any',
  },
  {
    name: 'first',
    description: "Sélectionne le premier élément d'un tableau",
    example: 'split(" ") | first',
    parameters: [],
    inputTypes: ['array'],
    outputType: 'any',
  },
  {
    name: 'last',
    description: "Sélectionne le dernier élément d'un tableau",
    example: 'split(" ") | last',
    parameters: [],
    inputTypes: ['array'],
    outputType: 'any',
  },
  {
    name: 'join',
    description: "Joint les éléments d'un tableau avec un séparateur",
    example: 'split(",") | join(" - ")',
    parameters: [
      {
        name: 'separator',
        description: 'Le séparateur à insérer entre les éléments',
        required: false,
      },
    ],
    inputTypes: ['array'],
    outputType: 'string',
  },
  {
    name: 'clean',
    description:
      'Supprime les espaces superflus au début, fin et normalise les espaces internes',
    example: 'message | clean',
    parameters: [],
    inputTypes: ['string'],
    outputType: 'string',
  },
  {
    name: 'replace',
    description: "Remplace toutes les occurrences d'une chaîne par une autre",
    example: 'message | replace("old", "new")',
    parameters: [
      {
        name: 'from',
        description: 'La chaîne à remplacer',
        required: true,
      },
      {
        name: 'to',
        description: 'La chaîne de remplacement',
        required: true,
      },
    ],
    inputTypes: ['string'],
    outputType: 'string',
  },
  {
    name: 'extract',
    description: "Extrait le premier groupe d'une expression régulière",
    example: 'message | extract("([0-9]+)")',
    parameters: [
      {
        name: 'regex',
        description:
          'Expression régulière (premier groupe capturé sera retourné)',
        required: true,
      },
    ],
    inputTypes: ['string'],
    outputType: 'string',
  },
  {
    name: 'lowercase',
    description: 'Convertit le texte en minuscules',
    example: 'message | lowercase',
    parameters: [],
    inputTypes: ['string'],
    outputType: 'string',
  },
  {
    name: 'uppercase',
    description: 'Convertit le texte en majuscules',
    example: 'message | uppercase',
    parameters: [],
    inputTypes: ['string'],
    outputType: 'string',
  },
  {
    name: 'titlecase',
    description: 'Convertit le texte avec une majuscule à chaque mot',
    example: 'message | titlecase',
    parameters: [],
    inputTypes: ['string'],
    outputType: 'string',
  },
  {
    name: 'length',
    description: "Retourne la longueur d'une chaîne ou d'un tableau",
    example: 'message | length',
    parameters: [],
    inputTypes: ['string', 'array'],
    outputType: 'number',
  },
  {
    name: 'contains',
    description: 'Vérifie si la valeur contient une sous-chaîne ou un élément',
    example: 'message | contains("error")',
    parameters: [
      {
        name: 'value',
        description: 'La valeur à rechercher',
        required: true,
      },
    ],
    inputTypes: ['string', 'array'],
    outputType: 'boolean',
  },
  {
    name: 'default',
    description:
      'Retourne une valeur par défaut si la valeur actuelle est vide',
    example: 'message | default("Aucune description")',
    parameters: [
      {
        name: 'fallback',
        description: 'Valeur à utiliser si la valeur est vide',
        required: true,
      },
    ],
    inputTypes: ['any'],
    outputType: 'any',
  },
];

export function getTransformationMetadata(): TransformationMetadata[] {
  return TRANSFORMATION_REGISTRY;
}
