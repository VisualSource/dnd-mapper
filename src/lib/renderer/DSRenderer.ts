import type { UUID } from "node:crypto";
import { emitTo, listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { Shape, Color, Dungeon, PageNode } from "./dungeonScrawl/types";
import { EVENTS_MAP_EDITOR, WINDOW_MAIN } from "../consts";
import { PolygonObject } from "./dungeonScrawl/shape";
import type { ReslovedEntityInstance } from "../types";
import { getPuckSize, type PuckSize } from "../display/utils";

const toHex = (value: Color) => {
    const alpha = value.alpha === 1 ? "ff" : value.alpha.toString(16).slice(2, 4);
    return `#${value.colour.toString(16).padStart(6, "0")}${alpha}`;
};

export default class DSRenderer extends EventTarget {
    private abort: AbortController = new AbortController();
    private mountCount = 0;

    private map: Dungeon | null = null;
    public selectedPage: UUID | null = null;

    private ctx: CanvasRenderingContext2D | null = null;
    private cameraOffset = { x: 0, y: 0 };
    private dragStart = { x: 0, y: 0 };
    private frame: number | undefined;
    private isDragging = false;
    private didMove = false;
    private cameraZoom = 1;
    private lastZoom = 1;

    private imageCache = new Map<string, HTMLImageElement>();

    private objects: { box: PolygonObject; id: UUID }[] = [];
    private entities: Record<UUID, ReslovedEntityInstance[]> = {};

    private loadEvent: Promise<UnlistenFn> | undefined;
    private setVisEvent: Promise<UnlistenFn> | undefined;
    private moveCameraEvent: Promise<UnlistenFn> | undefined;
    private centerCameraOn: Promise<UnlistenFn> | undefined;

    //https://codepen.io/chengarda/pen/wRxoyB?editors=0010
    private init(canvas: HTMLCanvasElement) {
        this.abort = new AbortController();

        this.ctx = canvas.getContext("2d");

        if (this.ctx) {
            this.ctx.canvas.height = window.innerHeight;
            this.ctx.canvas.width = window.innerWidth;
        }

        this.objects = [];
        this.cameraOffset = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

        canvas.addEventListener('mousedown', this.onPointerDown);
        canvas.addEventListener('mousemove', this.onPointerMove);
        canvas.addEventListener('mouseup', this.onPointerUp);

        this.addEventListener("click", this.onClick);

        this.centerCameraOn = listen<{ type: string, target: UUID }>(EVENTS_MAP_EDITOR.CenterCameraOn, async (ev) => {
            if (ev.payload.type === "object") {
                const obj = this.objects.find(e => e.id === ev.payload.target)
                // get center of box
                const bb = obj?.box.getBoundingBox();
                if (!bb) return;

                const offsetX = (Math.abs(bb.maxX) - Math.abs(bb.minX)) / 2;
                const offsetY = (Math.abs(bb.maxY) - Math.abs(bb.minY)) / 2;

                const x = Math.floor((window.innerWidth / 2)) - (bb.minX + offsetX);
                const y = Math.floor((window.innerHeight / 2)) - (bb.minY + offsetY);

                this.cameraOffset.x = x;
                this.cameraOffset.y = y;
            }

        });

        this.loadEvent = listen<Dungeon>(EVENTS_MAP_EDITOR.Load, async (ev) => {
            this.map = ev.payload;

            const assets = Object.values(this.map.state.document.nodes).filter(e => e.type === "DUNGEON_ASSET");

            for (const asset of assets) {
                for (const item of asset.children) {
                    const n = this.map.state.document.nodes[item];
                    if (n.type === "GEOMETRY") {
                        const box = new PolygonObject(this.map.data.geometry[n.geometryId]);
                        if (!box.isEmpty)
                            this.objects.push({ box, id: asset.id });
                        break;
                    }
                }
            }
        });
        this.setVisEvent = listen<{ target: UUID, value: boolean, type: "entity" | "object" }>(EVENTS_MAP_EDITOR.SetVisable, (ev) => {
            if (ev.payload.type === "object") {
                if (!this.map) return;
                const node = this.map.state.document.nodes[ev.payload.target];
                if ("visible" in node) {
                    node.visible = ev.payload.value;
                }
                return;
            }
        });

        this.moveCameraEvent = listen<{ x: number, y: number, autoCenter: boolean }>(EVENTS_MAP_EDITOR.MoveCamera, (ev) => {
            this.cameraOffset.x = ev.payload.x;
            this.cameraOffset.y = ev.payload.y;
        });

        this.draw();
    }

    private destory() {
        this.abort.abort("DSRenderer::destory");
        this.map = null;
        this.ctx = null;
        this.loadEvent?.then(e => e());
        this.setVisEvent?.then(e => e());
        this.moveCameraEvent?.then(e => e());
        this.centerCameraOn?.then(e => e());
        this.removeEventListener("click", this.onClick);
        if (this.frame) cancelAnimationFrame(this.frame);
    }

    private drawGrid(ctx: CanvasRenderingContext2D, gridCellDiameter: number, lineWidth: number, color = "lightgrey") {
        ctx.save();

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

        ctx.restore();
    }

    private drawPolygonFill(points: Shape, ctx: CanvasRenderingContext2D, color: string, transform?: DOMMatrix | null) {
        ctx.save(); // save and restore calls required for allowing transforms not affecting other components.

        if (transform) {
            const current = ctx.getTransform();
            transform.e = current.e;
            transform.f = current.f;
            ctx.setTransform(transform);
        }

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.lineTo(points[0][0], points[0][1]);
        ctx.fill();

        ctx.restore();
    }
    private drawPolygonStroke(points: Shape, ctx: CanvasRenderingContext2D, color: string, width: number, transform?: DOMMatrix | null) {
        ctx.save();

        if (transform) {
            const current = ctx.getTransform();
            transform.e = current.e;
            transform.f = current.f;
            ctx.setTransform(transform);
        }

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.lineTo(points[0][0], points[0][1]);
        ctx.stroke();
        //ctx.lineWidth = 1;
        ctx.restore();
    }
    private drawLine(points: Shape, ctx: CanvasRenderingContext2D, color: string, width: number) {
        if (points.length < 2) return;

        const start = points[0];
        const end = points[1];

        ctx.beginPath(); // stop lineWidth,lineCap,strokeStyle, etc from bleeding into other components. save/restore not required

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
        let transform: DOMMatrix | null = null;
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

                    transform = new DOMMatrix(node.transform);

                    const lastNode = node.children.at(-1);
                    if (lastNode) {
                        clearTransformOn = lastNode;
                    }

                    break;
                }
                case "GEOMETRY": {
                    if (!node.visible) break;

                    geomertyId = node.geometryId;
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
                        // main geomerty
                        this.drawPolygonFill(geomerty.polygons[0][0], this.ctx, toHex(node.fill.colour), transform);
                        // remove hollow points
                        if (geomerty.polygons[0].length > 1) {
                            for (let i = 1; i < geomerty.polygons[0].length; i++) {
                                this.drawPolygonFill(geomerty.polygons[0][i], this.ctx, backgroundColor, transform);
                            }
                        }
                    }

                    if (node.stroke.visible) {
                        for (const item of geomerty.polygons) {
                            for (const g of item) {
                                this.drawPolygonStroke(g, this.ctx, toHex(node.stroke.colour), node.stroke.width, transform);
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

            if (transform && clearTransformOn === nodeId) {
                transform = null;
            }
        }
    }
    private drawEntity(image: string, x: number, y: number, puck: PuckSize, page: UUID) {
        if (!this.ctx) return;

        const gridSize = (this.map?.state.document.nodes[page] as PageNode).grid.cellDiameter
        const wh = gridSize * getPuckSize(puck);

        // do transform

        const loadedImage = this.imageCache.get(image);
        if (!loadedImage) return;

        this.ctx.drawImage(loadedImage, x * gridSize, y * gridSize, wh, wh);

    }
    private draw = () => {
        if (!this.ctx) return;
        // Magic if we don't set the width and height of the canvas 
        // the scroll feature does not work.
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

            for (const [layer, units] of Object.entries(this.entities)) {
                if (!(this.map?.state.document.nodes[layer as UUID] as { visible?: boolean })?.visible) continue;
                for (const unit of units) {
                    if (!(unit.overrides?.visible ?? unit.entity.displayOnMap)) continue;
                    this.drawEntity(unit.entity.image, unit.x, unit.y, unit.entity.puckSize, selectedPage);
                }
            }
        } else {
            this.drawGrid(this.ctx, 36, 1);
        }



        for (const object of this.objects) {
            const item = object.box.getBoundingBox();

            this.drawPolygonStroke([
                [item.minX - 2, item.minY - 2],
                [item.maxX + 2, item.minY - 2],
                [item.maxX + 2, item.maxY + 2],
                [item.minX - 2, item.maxY + 2]
            ], this.ctx, "yellow", 4);
        }

        this.frame = requestAnimationFrame(this.draw);

    }

    private onPointerDown = (ev: MouseEvent) => {
        this.isDragging = true;
        this.didMove = false;
        this.dragStart.x = this.getEventLocation(ev).x / this.cameraZoom - this.cameraOffset.x
        this.dragStart.y = this.getEventLocation(ev).y / this.cameraZoom - this.cameraOffset.y
    }
    private onPointerUp = (_ev: MouseEvent) => {
        if (!this.didMove) {
            for (const object of this.objects) {
                if (object.box.contains(this.dragStart)) {
                    this.dispatchEvent(new CustomEvent("click", { detail: { target: object.id } }));
                    break;
                }
            }
        }
        this.isDragging = false
        this.lastZoom = this.cameraZoom
    }
    private onPointerMove = (e: MouseEvent) => {
        this.didMove = true;
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
    private onClick = async (ev: Event) => {
        const target = (ev as CustomEvent<{ target: UUID }>).detail.target;

        const node = this.map?.state.document.nodes[target]
        if (!node) return;

        if ("visible" in node && node.visible) {
            await emitTo(WINDOW_MAIN, "editor-select", target);
        }
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