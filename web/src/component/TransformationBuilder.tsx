import { Info, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import transformationService from "@/services/api/transformationService";
import type { TransformationMetadata } from "@/services/types/transformationTypes";

interface TransformationBuilderProps {
    availableVariables: string[];
    value?: string;
    onChange: (expression: string) => void;
    label?: string;
}

export default function TransformationBuilder({
    availableVariables,
    value = "",
    onChange,
    label = "Transformation Pipeline",
}: TransformationBuilderProps) {
    const [transformations, setTransformations] = useState<
        TransformationMetadata[]
    >([]);
    const [selectedTransform, setSelectedTransform] =
        useState<TransformationMetadata | null>(null);
    const [showHelp, setShowHelp] = useState(false);

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
        <div className="space-y-3">
            {/* Input field for pipeline expression */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Ex: variable | split(&quot;:&quot;) | select(1) | clean"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Utilisez le séparateur | pour chaîner les transformations
                </p>
            </div>

            {/* Toggle help section */}
            <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
                <Info size={16} />
                {showHelp
                    ? "Masquer les transformations disponibles"
                    : "Voir les transformations disponibles"}
            </button>

            {/* Help section */}
            {showHelp && (
                <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                    {/* Available variables */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Variables disponibles
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {availableVariables.length === 0 ? (
                                <p className="text-xs text-gray-500">
                                    Aucune variable disponible
                                </p>
                            ) : (
                                availableVariables.map((varName) => (
                                    <button
                                        key={varName}
                                        type="button"
                                        onClick={() =>
                                            onChange(
                                                value
                                                    ? `${value} | ${varName}`
                                                    : varName
                                            )
                                        }
                                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono hover:bg-blue-200"
                                    >
                                        {varName}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Available transformations */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Zap size={16} />
                            Transformations disponibles
                        </h4>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {transformations.map((transform) => (
                                <div
                                    key={transform.name}
                                    className="bg-white rounded-lg border border-gray-200 p-3 hover:border-blue-300 cursor-pointer transition-colors"
                                    onClick={() =>
                                        setSelectedTransform(
                                            selectedTransform?.name ===
                                                transform.name
                                                ? null
                                                : transform
                                        )
                                    }
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm font-semibold text-gray-800">
                                                    {transform.name}
                                                    {transform.parameters
                                                        .length > 0 &&
                                                        `(${transform.parameters.map((p) => p.name).join(", ")})`}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {transform.inputTypes.join(
                                                        " | "
                                                    )}{" "}
                                                    → {transform.outputType}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {transform.description}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const funcCall =
                                                    transform.parameters
                                                        .length > 0
                                                        ? `${transform.name}()`
                                                        : transform.name;
                                                onChange(
                                                    value
                                                        ? `${value} | ${funcCall}`
                                                        : funcCall
                                                );
                                            }}
                                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Ajouter
                                        </button>
                                    </div>

                                    {/* Expanded details */}
                                    {selectedTransform?.name ===
                                        transform.name && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                                            {transform.parameters.length >
                                                0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-700 mb-1">
                                                        Paramètres:
                                                    </p>
                                                    <ul className="space-y-1">
                                                        {transform.parameters.map(
                                                            (param) => (
                                                                <li
                                                                    key={
                                                                        param.name
                                                                    }
                                                                    className="text-xs text-gray-600"
                                                                >
                                                                    <span className="font-mono font-semibold">
                                                                        {
                                                                            param.name
                                                                        }
                                                                    </span>
                                                                    {param.required && (
                                                                        <span className="text-red-500">
                                                                            *
                                                                        </span>
                                                                    )}
                                                                    :{" "}
                                                                    {
                                                                        param.description
                                                                    }
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-xs font-semibold text-gray-700 mb-1">
                                                    Exemple:
                                                </p>
                                                <code className="block text-xs bg-gray-100 text-gray-800 p-2 rounded font-mono">
                                                    {transform.example}
                                                </code>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
