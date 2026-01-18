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

export interface TransformationsResponse {
    transformations: TransformationMetadata[];
}
