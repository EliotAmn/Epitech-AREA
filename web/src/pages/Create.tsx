import { useState } from "react";

import ProgressBar from "../component/ProgressBar";
import { actions, reactions, services } from "../data/catalogData";
import CatalogPage from "./CatalogPage";
import Summary from "./Summary";

export default function Create() {
	const [step, setStep] = useState<number>(1);
	const [actionService, setActionService] = useState<string | null>(null);
	const [action, setAction] = useState<string | null>(null);
	const [reactionService, setReactionService] = useState<string | null>(null);
	const [reaction, setReaction] = useState<string | null>(null);

	const goToStep = (s: number) => {
		if (s === 2 && !actionService) s = 1;
		if (s === 3 && !action) s = actionService ? 2 : 1;
		if (s === 4 && !reactionService) s = action ? 3 : (actionService ? 2 : 1)
		if (s <= 1) {
			setActionService(null);
			setAction(null);
			setReactionService(null);
			setReaction(null);
		} else if (s === 2) {
			setAction(null);
			setReactionService(null);
			setReaction(null);
		} else if (s === 3) {
			setReactionService(null);
			setReaction(null);
		}
		setStep(s);
	};

	const completedSteps = [
		!!actionService,
		!!action,
		!!reactionService,
		!!reaction,
	];

	return (
		<div className="text-center justify-center">
			<h1 className="text-7xl font-bold m-4">Create your own area</h1>

			<ProgressBar
				steps={4}
				current={step}
				onStepClick={(n) => goToStep(n)}
				labels={[
					"Service (action)",
					"Action",
					"Service (reaction)",
					"Reaction",
				]}
				completedSteps={completedSteps}
			/>

			<div className="flex flex-col items-center justify-center gap-6 mt-6 w-full">
				{step === 1 && (
					<CatalogPage
						items={services}
						description="Choose service for your action"
						onSelect={(item) => {
							setActionService(item.platform ?? null);
							setStep(2);
						}}
					/>
				)}

				{step === 2 &&
					(actionService ? (
						<CatalogPage
							items={actions}
							description={`Choose an action for ${actionService}`}
							onSelect={(item) => {
								setAction(item.title ?? null);
								setStep(3);
							}}
						/>
					) : null)}

				{step === 3 && (
					<CatalogPage
						items={services}
						description="Choose service for your reaction"
						onSelect={(item) => {
							setReactionService(item.platform ?? null);
							setStep(4);
						}}
					/>
				)}

				{step === 4 && (
					<div className="w-full">
						{!reaction ? (
							<CatalogPage
								items={reactions}
								description={
									reactionService
										? `Choose a reaction for ${reactionService}`
										: "Choose a reaction"
								}
								onSelect={(item) => {
									setReaction(item.title ?? null);
									setStep(4);
								}}
							/>
						) : (
							<div className="mt-6">
								<Summary
									actionService={actionService}
									action={action}
									reactionService={reactionService}
									reaction={reaction}
								/>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
