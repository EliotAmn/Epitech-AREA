import { temporaryAreas } from "../data/catalogData";
import CatalogPage from "./CatalogPage";

export default function Areas() {
	const items = temporaryAreas;

	return <CatalogPage description="My Areas" items={items} />;
}
