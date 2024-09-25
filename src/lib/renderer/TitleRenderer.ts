import { readFile } from '@tauri-apps/plugin-fs';
import type { Color, Dungeon, Shape } from "./dungeonScrawl/types";
import type { UUID } from "node:crypto";

const toHex = (value: Color) => `#${value.colour.toString(16)}`;

export class TitleRenderer {
    private abort: AbortController = new AbortController();
    private mountCount = 0;
    private ctx: CanvasRenderingContext2D | null = null;

    public map: Dungeon | null = null;
    public selectedPage: UUID | null = null;

    private isDragging = false;
    private frame: number | null = null;
    private cameraOffset = { x: 0, y: 0 };
    private dargStart = { x: 0, y: 0 };
    private cameraZoom = 1;

    private getEventLocation(ev: TouchEvent | MouseEvent) {
        if (ev instanceof TouchEvent && ev.touches.length === 1) {
            return { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
        }
        if (!(ev instanceof MouseEvent)) return null;
        return { x: ev.clientX, y: ev.clientY }
    }

    private onPointerUp = () => {
        this.isDragging = false;
    }
    private onPointerDown = (e: MouseEvent) => {
        const data = this.getEventLocation(e);
        if (!data) return;
        this.isDragging = true;
        this.dargStart.x = data.x / this.cameraZoom - this.cameraOffset.x;
        this.dargStart.y = data.y / this.cameraZoom - this.cameraOffset.y;
    }
    private onPointerMove = (ev: MouseEvent) => {
        if (this.isDragging) {
            const data = this.getEventLocation(ev);
            if (!data) return;
            this.cameraOffset.x = data.x / this.cameraZoom - this.dargStart.x;
            this.cameraOffset.y = data.y / this.cameraZoom - this.dargStart.y;
            //this.render();
        }
    }

    private draw = () => {
        if (!this.ctx) return;
        this.ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
        this.ctx.scale(this.cameraZoom, this.cameraZoom);
        this.ctx.translate(-window.innerWidth / 2 + this.cameraOffset.x, -window.innerHeight / 2 + this.cameraOffset.y);
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        this.ctx.fillStyle = "#991111";
        this.ctx.fillRect(-50, -50, 100, 100);

        this.ctx.fillStyle = "#eecc77";
        this.ctx.fillRect(-35, -35, 20, 20);
        this.ctx.fillRect(15, -35, 20, 20);
        this.ctx.fillRect(-35, 15, 70, 20);

        this.ctx.fillStyle = "#fff"
        this.ctx.font = `${32}px courier`
        this.ctx.fillText("Simple Pan and Zoom Canvas", -255, -100)


        this.ctx.rotate(-31 * Math.PI / 180)
        this.ctx.fillStyle = `#${(Math.round(Date.now() / 40) % 4096).toString(16)}`
        this.ctx.font = `${32}px courier`
        this.ctx.fillText("Now with touch!", -110, 100)


        this.ctx.fillStyle = "#fff"
        this.ctx.rotate(31 * Math.PI / 180)
        this.ctx.font = `${48}px courier`
        this.ctx.fillText("Wow, you found me!", -110, 100)

        this.frame = requestAnimationFrame(this.draw);
    }

    public async mount(canvas: HTMLCanvasElement) {
        this.mountCount++;
        if (this.mountCount !== 1) return;
        console.log("Mount");
        try {
            this.abort.signal.throwIfAborted();
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.canvas.width = window.innerWidth;
            ctx.canvas.height = window.innerHeight;

            this.ctx = ctx;

            this.cameraOffset = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

            /*const contents = await readFile("C:\\Users\\Collin\\Downloads\\dungeon.ds");
            const reader = new TextDecoder(undefined);
            const value = reader.decode(contents);

            const start = value.slice(value.indexOf("map") + 3);
            const config = start.slice(0, start.lastIndexOf("}") + 1);

            this.map = JSON.parse(config);*/

            window.addEventListener("resize", this.resize);

            this.ctx.canvas.addEventListener("mousedown", this.onPointerDown);
            this.ctx.canvas.addEventListener("mouseup", this.onPointerUp);
            this.ctx.canvas.addEventListener("mousemove", this.onPointerMove);
            this.draw();
            //this.render();
        } catch (error) {
            console.error(error);
        }
    }

    public unmount() {
        this.mountCount--;
        if (this.mountCount !== 0) return;
        console.log("Unmount");
        // this.abort.abort();
        if (this.frame) cancelAnimationFrame(this.frame);

        if (this.ctx) {
            this.ctx.canvas.removeEventListener("mousedown", this.onPointerDown);
            this.ctx.canvas.removeEventListener("mouseup", this.onPointerUp);
            this.ctx.canvas.removeEventListener("mousemove", this.onPointerMove);
        }
        this.ctx = null;
        window.removeEventListener("resize", this.resize);
    }

    private resize = () => {
        if (!this.ctx) return;
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight
    }

    private drawGrid(ctx: CanvasRenderingContext2D, gridCellDiameter: number, lineWidth: number, color = "lightgrey") {
        ctx.strokeStyle = color;

        ctx.beginPath();
        ctx.lineWidth = lineWidth;

        for (let x = 0; x <= ctx.canvas.width; x += gridCellDiameter) {
            ctx.moveTo(x, -(ctx.canvas.height / 2));
            ctx.lineTo(x, ctx.canvas.height);
        }

        for (let y = 0; y <= ctx.canvas.height; y += gridCellDiameter) {
            ctx.moveTo(-(ctx.canvas.width / 2), y);
            ctx.lineTo(ctx.canvas.width, y);
        }

        ctx.stroke();
    }

    private drawPolygonFill(points: Shape, ctx: CanvasRenderingContext2D, color: string) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.lineTo(points[0][0], points[0][1]);
        ctx.fill();

    }
    private drawPolygonStroke(points: Shape, ctx: CanvasRenderingContext2D, color: string, width: number) {

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.lineTo(points[0][0], points[0][1]);
        ctx.stroke();
        ctx.lineWidth = 1;
    }

    private drawLine(points: Shape, ctx: CanvasRenderingContext2D, color: string, width: number) {
        if (points.length < 2) return;

        const start = points[0];
        const end = points[1];
        ctx.lineCap = "round";
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.moveTo(start[0], start[1]);
        ctx.lineTo(end[0], end[1]);
        ctx.stroke();
    }

    private process(pageId: UUID) {
        if (!this.map || !this.ctx) return;
        let geomertyId: UUID | null = null;
        const children: UUID[] = [];
        const page = this.map.state.document.nodes[pageId];

        if (page.type !== "PAGE") throw new Error("Expected node to be a page");

        children.push(...page.children);

        while (children.length > 0) {
            const nodeId = children.shift();
            if (!nodeId) {
                console.log("No nodes found");
                break;
            }

            const node = this.map.state.document.nodes[nodeId];
            if (!node) {
                console.warn(`Missing node with id of "${nodeId}"`);
                break;
            }

            switch (node.type) {
                case "PAGE":
                    throw new Error("Should not be processing a page node!");
                case "IMAGES": {
                    break;
                }
                case "TEMPLATE": {
                    if (!node.visible) break;

                    children.unshift(...node.children)

                    break;
                }
                case "DUNGEON_ASSET": {
                    if (!node.visible) break;

                    children.unshift(...node.children);

                    break;
                }
                case "GEOMETRY": {
                    if (!node.visible) break;
                    geomertyId = node.geometryId

                    children.unshift(...node.children);

                    break;
                }
                case "FOLDER": {
                    if (!node.visible) break;

                    children.unshift(...node.children);

                    break;
                }
                case "GRID": {
                    geomertyId = null;

                    this.drawGrid(
                        this.ctx,
                        page.grid.cellDiameter,
                        page.grid.linesOptions.width,
                        toHex(page.grid.sharedOptions.colour)
                    );

                    break;
                }
                case "MULTIPOLYGON": {
                    if (!node.visible || !geomertyId) break;

                    const geomerty = this.map.data.geometry[geomertyId];

                    if (node.fill.visible) {
                        for (const polygon of geomerty.polygons) {
                            for (const part of polygon) {
                                this.drawPolygonFill(part, this.ctx, toHex(node.fill.colour));
                            }
                        }
                    }

                    if (node.stroke.visible) {
                        for (const item of geomerty.polygons) {
                            for (const g of item) {
                                this.drawPolygonStroke(g, this.ctx, toHex(node.stroke.colour), node.stroke.width);
                            }
                        }
                        for (const item of geomerty.polylines) {
                            this.drawLine(item, this.ctx, toHex(node.stroke.colour), node.stroke.width);
                        }
                    }

                    break;
                }
                default:
                    console.info("Unknown node");
                    break;
            }
        }
    }

    public render() {
        if (!this.ctx || !this.map) return;
        try {
            this.abort.signal.throwIfAborted();
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

            const document = this.map.state.document;
            const selectedPage = this.selectedPage ?? document.nodes[document.documentNodeId].selectedPage

            this.process(selectedPage);
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
                return;
            }
        }
    }
}