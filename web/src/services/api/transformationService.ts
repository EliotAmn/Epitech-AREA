import { apiClient } from "./apiClient";
import type { TransformationsResponse } from "../types/transformationTypes";

class TransformationService {
    async getTransformations(): Promise<TransformationsResponse> {
        return apiClient.get("/common/transformations");
    }
}

export default new TransformationService();
