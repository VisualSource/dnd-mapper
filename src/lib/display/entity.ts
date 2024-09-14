import { getPuckSize, type PuckSize } from "./utils";

type Args = {
    id: string;
    size: PuckSize,
    image: HTMLImageElement,
    gridSize: number;
    x?: number;
    y?: number;
    name?: string;
    isPlayerControlled?: boolean
}
// public id: string, size: PuckSize, protected image: HTMLImageElement, protected girdSize: number
export class Entity extends EventTarget {
    protected x = 0;
    protected y = 0;
    public z = 0;
    protected gridSize: number;
    public id: string;
    protected size = 1;
    protected image: HTMLImageElement;
    private name: string | undefined;
    protected isPlayerControlled = false;
    constructor({ size, id, image, x = 0, y = 0, name, isPlayerControlled = false, gridSize }: Args) {
        super();
        this.name = name;
        this.x = x;
        this.y = y;
        this.id = id;
        this.image = image;
        this.gridSize = gridSize;
        this.size = getPuckSize(size);
        this.isPlayerControlled = isPlayerControlled;
    }

    public move(x: number, y: number) {
        const stepX = this.gridSize * x;
        const stepY = this.gridSize * y;

        this.x += stepX;
        this.y += stepY;
    }

    public setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public render(ctx: CanvasRenderingContext2D) {
        if (!this.image) {
            console.warn("Entity does not have image set; ignoring");
            return;
        }
        const wh = this.gridSize * this.size;
        ctx.drawImage(this.image, this.x, this.y, wh, wh);


        if (this.isPlayerControlled && this.name) {
            ctx.font = "10px serif";
            ctx.fillStyle = "white"
            ctx.fillText(this.name, this.x + 10, this.y + 5);
        }
    }
}