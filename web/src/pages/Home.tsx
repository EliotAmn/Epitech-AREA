import { useNavigate } from "react-router-dom";

import Button from "../component/button";
import Widget from "../component/widget";
import { actions } from "../data/catalogData";


function Home() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen flex flex-col items-center justify-start">
			<div className="flex flex-col items-center w-full md:h-[530px] h-auto bg-[#242424] gap-6 py-12 md:py-0">
				<p className="text-center text-[#ffffff] text-3xl sm:text-4xl md:text-[75px] font-bold leading-tight">
					Automate. Save time.
					<br />
					Get more done.
				</p>
				<Button
					label="Create your free account"
					mode="white"
					onClick={() => navigate("/signup")}
				/>
			</div>
			<h2 className="text-center text-2xl sm:text-3xl md:text-[45px] font-bold mt-8">
				Get started with any Applet
			</h2>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center m-4">
				{actions.map((act) => (
				  <Widget
				    key={act.id}
				    titre={act.titre}
				    plateforme={act.plateforme}
				    color={act.color}
				    onClick={() =>
				      navigate(`/widget/${act.id}`, {
				        state: { titre: act.titre, color: act.color },
				      })
				    }
				  />
				))}
			</div>
		</div>
	);
}

export default Home;
