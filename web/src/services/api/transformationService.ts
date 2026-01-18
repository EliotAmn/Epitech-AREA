import { apiClient } from "./apiClient";
import type { TransformationsResponse } from "../types/transformationTypes";

class TransformationService {
    static async getTransformations(): Promise<TransformationsResponse> {
        return apiClient.get("/common/transformations");
    }
}

export default TransformationService;
