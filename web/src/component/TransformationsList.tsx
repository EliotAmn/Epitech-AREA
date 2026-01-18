import { useEffect, useState } from "react";

import { Zap } from "lucide-react";

import transformationService from "@/services/api/transformationService";
import type { TransformationMetadata } from "@/services/types/transformationTypes";

export default function TransformationsList() {
    const [transformations, setTransformations] = useState<
        TransformationMetadata[]
    >([]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const data = await transformationService.getTransformations();
                if (!mounted) return;
                setTransformations(data.transformations);
            } catch (err) {
                console.error("Failed to load transformations:", err);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="w-full">
            <h5 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Zap size={14} />
                Transformations
            </h5>
            <div className="bg-white/80 border border-white/30 rounded-xl p-3 shadow-sm max-h-96 overflow-y-auto">
                <div className="space-y-3 text-xs">
                    {transformations.map((transform) => (
                        <div
                            key={transform.name}
                            className="border-b border-gray-100 last:border-0 pb-3 last:pb-0"
                        >
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <code className="font-mono font-semibold text-blue-700 text-xs">
                                    {transform.name}
                                    {transform.parameters.length > 0 &&
                                        `(${transform.parameters.map((p) => p.name).join(", ")})`}
                                </code>
                                <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                    {transform.inputTypes.join(" | ")} →{" "}
                                    {transform.outputType}
                                </span>
                            </div>
                            <p className="text-gray-600 mb-2 text-xs">
                                {transform.description}
                            </p>
                            {transform.parameters.length > 0 && (
                                <div className="mb-2">
                                    <p className="text-[10px] font-semibold text-gray-700 mb-1">
                                        Paramètres:
                                    </p>
                                    <ul className="space-y-1 ml-2">
                                        {transform.parameters.map((param) => (
                                            <li
                                                key={param.name}
                                                className="text-[10px] text-gray-600"
                                            >
                                                <code className="font-mono font-semibold">
                                                    {param.name}
                                                </code>
                                                {param.required && (
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                )}
                                                : {param.description}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="bg-gray-50 p-2 rounded border border-gray-200">
                                <p className="text-[10px] font-semibold text-gray-700 mb-1">
                                    Exemple:
                                </p>
                                <code className="text-[10px] text-gray-800 font-mono break-all">
                                    {"{{" + transform.example + "}}"}
                                </code>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
