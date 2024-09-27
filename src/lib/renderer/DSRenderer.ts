import type { UUID } from "node:crypto";
import { readFile } from '@tauri-apps/plugin-fs';
import type { Shape, Color, Dungeon, Transform } from "./dungeonScrawl/types";

const toHex = (value: Color) => {
    const alpha = value.alpha === 1 ? "ff" : value.alpha.toString(16).slice(2, 4);
    return `#${value.colour.toString(16).padStart(6, "0")}${alpha}`;
};

export default class DSRenderer {
    private abort: AbortController = new AbortController();
    private mountCount = 0;

    private map: Dungeon | null = null;
    public selectedPage: UUID | null = null;

    private ctx: CanvasRenderingContext2D | null = null;
    private cameraOffset = { x: 0, y: 0 };
    private dragStart = { x: 0, y: 0 };
    private frame: number | undefined;
    private isDragging = false;
    private cameraZoom = 1;
    private lastZoom = 1;

    //https://codepen.io/chengarda/pen/wRxoyB?editors=0010
    private init(canvas: HTMLCanvasElement) {
        this.abort = new AbortController();

        this.ctx = canvas.getContext("2d");

        if (this.ctx) {
            this.ctx.canvas.height = window.innerHeight;
            this.ctx.canvas.width = window.innerWidth;
        }

        this.cameraOffset = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

        canvas.addEventListener('mousedown', this.onPointerDown);
        canvas.addEventListener('mousemove', this.onPointerMove);
        canvas.addEventListener('mouseup', this.onPointerUp);

        readFile("C:\\Users\\Collin\\Downloads\\dungeon(2).ds").then(content => {

            const reader = new TextDecoder(undefined);
            const value = reader.decode(content);

            const start = value.slice(value.indexOf("map") + 3);
            const config = start.slice(0, start.lastIndexOf("}") + 1);

            if (!this.abort.signal.aborted) {
                this.map = JSON.parse(config);
            }
        }).catch(e => {
            console.error(e)
        })

        this.draw();
    }

    private destory() {
        this.abort.abort("DSRenderer::destory");
        this.map = null;
        this.ctx = null;
        if (this.frame) cancelAnimationFrame(this.frame);
    }

    private drawGrid(ctx: CanvasRenderingContext2D, gridCellDiameter: number, lineWidth: number, color = "lightgrey") {

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;

        const gridXCount = Math.round(ctx.canvas.width / gridCellDiameter);
        const gridYCount = Math.round(ctx.canvas.height / gridCellDiameter);

        const xStart = -Math.floor(gridXCount / 2);
        const yStart = -Math.floor(gridYCount / 2);

        const gridXStartCell = xStart * gridCellDiameter;
        const gridYStartCell = yStart * gridCellDiameter;

        const gridYMaxCell = gridYCount * gridCellDiameter;
        const gridXMaxCell = gridXCount * gridCellDiameter;

        for (let x = xStart; x <= gridXCount; x++) {
            ctx.moveTo(x * gridCellDiameter, gridYStartCell);
            ctx.lineTo(x * gridCellDiameter, gridYMaxCell);
        }

        for (let y = yStart; y <= gridYCount; y++) {
            ctx.moveTo(gridXStartCell, y * gridCellDiameter);
            ctx.lineTo(gridXMaxCell, y * gridCellDiameter);
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

    private drawMap(pageId: UUID) {

        if (!this.map || !this.ctx) return;
        let geomertyId: UUID | null = null;
        let transform: Transform | null = null;
        let clearTransformOn: UUID | null = null;
        const children: UUID[] = [];
        const page = this.map.state.document.nodes[pageId];

        if (page.type !== "PAGE") throw new Error("Expected node to be a page");

        const backgroundColor = toHex(page.background.colour);

        this.ctx.canvas.style.backgroundColor = backgroundColor;

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
                    if (!node.visible) break;

                    children.unshift(...node.children);
                    break;
                }
                case "SHADOW": {
                    break;
                }
                case "BUFFER_SHADING": {
                    break;
                }
                case "HATCHING": {
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

                    transform = node.transform;

                    const lastNode = node.children.at(-1);
                    if (lastNode) {
                        clearTransformOn = lastNode;
                    }

                    break;
                }
                case "GEOMETRY": {
                    if (!node.visible) break;
                    // debugger;
                    geomertyId = node.geometryId;
                    children.unshift(...node.children);
                    //children.unshift(...node.children);

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

                    this.ctx.save();

                    if (node.fill.visible) {
                        // main geomerty
                        this.drawPolygonFill(geomerty.polygons[0][0], this.ctx, toHex(node.fill.colour));
                        // remove hollow points
                        if (geomerty.polygons[0].length > 1) {
                            for (let i = 1; i < geomerty.polygons[0].length; i++) {
                                this.drawPolygonFill(geomerty.polygons[0][i], this.ctx, backgroundColor);
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


                    if (transform) {
                        const current = this.ctx.getTransform();
                        const a = new DOMMatrix(transform);
                        a.e = current.e;
                        a.f = current.f;
                        this.ctx.setTransform(a);

                        if (clearTransformOn === nodeId) {
                            transform = null;
                        }
                    }

                    this.ctx.restore();

                    break;
                }
                default:
                    console.info("Unknown node");
                    break;
            }
        }
    }

    private draw = () => {
        if (!this.ctx) return;
        this.ctx.canvas.height = window.innerHeight;
        this.ctx.canvas.width = window.innerWidth;

        // camera
        this.ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
        this.ctx.scale(this.cameraZoom, this.cameraZoom);
        this.ctx.translate(-window.innerWidth / 2 + this.cameraOffset.x, -window.innerHeight / 2 + this.cameraOffset.y);
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        if (this.map) {
            const document = this.map.state.document;
            const selectedPage = this.selectedPage ?? document.nodes[document.documentNodeId].selectedPage;
            this.drawMap(selectedPage);
        }

        this.frame = requestAnimationFrame(this.draw);
    }
    private onPointerDown = (ev: MouseEvent) => {
        this.isDragging = true;
        this.dragStart.x = this.getEventLocation(ev).x / this.cameraZoom - this.cameraOffset.x
        this.dragStart.y = this.getEventLocation(ev).y / this.cameraZoom - this.cameraOffset.y
    }
    private onPointerUp = () => {
        this.isDragging = false
        this.lastZoom = this.cameraZoom
    }
    private onPointerMove = (e: MouseEvent) => {
        if (this.isDragging) {
            this.cameraOffset.x = this.getEventLocation(e).x / this.cameraZoom - this.dragStart.x
            this.cameraOffset.y = this.getEventLocation(e).y / this.cameraZoom - this.dragStart.y
        }
    }

    private getEventLocation(e: TouchEvent | MouseEvent) {
        if ((e as TouchEvent).touches && (e as TouchEvent).touches.length === 1) {
            return { x: (e as TouchEvent).touches[0].clientX, y: (e as TouchEvent).touches[0].clientY }
        }

        return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }
    }

    public mount(canvas: HTMLCanvasElement) {
        this.mountCount++;
        if (this.mountCount !== 1) return;
        this.init(canvas);
    }
    public unmount() {
        this.mountCount--;
        if (this.mountCount !== 0) return;
        this.destory();
    }
}