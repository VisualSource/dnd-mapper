import { type PuckSize, getPuckSize } from "./utils";

type Args = {
	id: string;
	size: PuckSize;
	image: HTMLImageElement;
	gridSize: number;
	x?: number;
	y?: number;
	name?: string;
	isPlayerControlled?: boolean;
	display: boolean;
};
// public id: string, size: PuckSize, protected image: HTMLImageElement, protected girdSize: number
export class Entity extends EventTarget {
	protected x = 0;
	protected y = 0;
	public z = 0;
	protected gridSize: number;
	public id: string;
	protected size = 1;
	protected image: HTMLImageElement;
	private display = false;
	private name: string | undefined;
	protected isPlayerControlled = false;
	constructor({
		size,
		id,
		display,
		image,
		x = 0,
		y = 0,
		name,
		isPlayerControlled = false,
		gridSize,
	}: Args) {
		super();
		this.name = name;
		this.x = x;
		this.y = y;
		this.id = id;
		this.image = image;
		this.gridSize = gridSize;
		this.size = getPuckSize(size);
		this.isPlayerControlled = isPlayerControlled;
		this.display = display;
	}

	public setSize(value: PuckSize) {
		this.size = getPuckSize(value);
	}

	public move(x: number, y: number) {
		this.x += x;
		this.y += y;
	}

	public setDisplay(value: boolean) {
		this.display = value;
	}
	public setPosition(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	public render(ctx: CanvasRenderingContext2D) {
		if (!this.display) return;
		if (!this.image) {
			console.warn("Entity does not have image set; ignoring");
			return;
		}
		const wh = this.gridSize * this.size;

		const x =
			(Math.floor(window.innerWidth / 2 / this.gridSize) + this.x) *
			this.gridSize;
		const y =
			(Math.floor(window.innerHeight / 2 / this.gridSize) + this.y) *
			this.gridSize;
		ctx.drawImage(this.image, x, y, wh, wh);

		if (this.isPlayerControlled && this.name?.length) {
			ctx.font = "10px serif";
			ctx.fillStyle = "yellow";
			ctx.fillText(this.name, x + 10, y + 5);
		}
	}
}
