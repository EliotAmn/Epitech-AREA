import type { TransformationsResponse } from "../types/transformationTypes";
import { apiClient } from "./apiClient";

class TransformationService {
    static async getTransformations(): Promise<TransformationsResponse> {
        return apiClient.get("/common/transformations");
    }
}

export default TransformationService;
