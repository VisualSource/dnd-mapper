export type PuckSize = "small" | "mid" | "large";
export function getPuckSize(size: PuckSize) {
	switch (size) {
		case "small":
			return 1;
		case "mid":
			return 2;
		case "large":
			return 3;
		default:
			return 1;
	}
}

export async function loadExternalImage(source: string) {
	const image = new Image();
	image.src = source;
	await new Promise<void>((ok, reject) => {
		image.addEventListener("error", (er) => reject(er));
		image.addEventListener("load", () => ok());
	});
	return image;
}
