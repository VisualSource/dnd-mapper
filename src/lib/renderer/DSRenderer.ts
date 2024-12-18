import type { UUID } from "node:crypto";
import { emitTo, listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { Shape, Color, Dungeon, PageNode } from "./dungeonScrawl/types";
import { type EventMap, EVENTS_MAP_EDITOR, WINDOW_MAIN } from "../consts";
import { PolygonObject } from "./dungeonScrawl/shape";
import type { ReslovedEntityInstance } from "../types";
import { getPuckSize, loadExternalImage } from "../display/utils";

const toHex = (value: Color) => {
    const alpha = value.alpha === 1 ? "ff" : value.alpha.toString(16).slice(2, 4);
    return `#${value.colour.toString(16).padStart(6, "0")}${alpha}`;
};

/*
    Render Queue 
        Object
        { 
            type: "object", 
            visible: boolean
            id: UUID, 
            layerIndex: 0 // Layer priority, 
            z: 0 //in layer propity, 
            instructions: [
                {
                    type: 0 // polygon-fill,
                    transform: Matrix
                    color: string,
                    geoId
                }
            ] 
        }
        Entity
        {
            type: "entity",
            id: UUID,
            layerIndex: 0, // layer order
            z: 0, // in layer order
            icon: ICONREF,
            x: number,
            y: number
        }
*/

/*enum RenderType {
    PolygonFill = 0,
    PolygonStroke = 1,
    Line = 2,
    Grid = 3
}

type RenderObject = {
    type: "object",
    visible: boolean;
    id: UUID,
    layerIndex: number;
    z: number;
    instructions: (
        { type: 0, color: string, transform?: DOMMatrix | null, geomertyId: UUID } |
        { type: 1, color: string, width: number, transform?: DOMMatrix | null, geomertyId: UUID } |
        { type: 2, color: string, width: number, transform?: DOMMatrix | null, geomertyId: UUID } |
        { type: 3, gridCellDiameter: number, lineWidth: number, color?: string }
    )[],
    debug: boolean;
}

type RenderEntity = {
    type: "entity",
    visible: boolean,
    id: UUID,
    layerIndex: number;
    z: number,
    y: number;
    x: number;
    icon: string;
    name: string
    puckSize: number;
    transform?: DOMMatrix | null,
    debug: boolean;
}

type RenderQueue = (RenderObject | RenderEntity)[]*/


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
    //private lastZoom = 1;

    private imageCache = new Map<string, HTMLImageElement>();

    private objects: { box: PolygonObject; id: UUID }[] = [];
    private entities: Record<UUID, ReslovedEntityInstance[]> = {};

    private loadEvent: Promise<UnlistenFn> | undefined;
    private setVisEvent: Promise<UnlistenFn> | undefined;
    private moveCameraEvent: Promise<UnlistenFn> | undefined;
    private centerCameraOn: Promise<UnlistenFn> | undefined;
    private addEntityEvent: Promise<UnlistenFn> | undefined;

    public gridSize = 36;

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

        this.centerCameraOn = listen<EventMap["centerCameraOn"]>(EVENTS_MAP_EDITOR.CenterCameraOn, async (ev) => {
            if (ev.payload.type === "object") {
                const obj = this.objects.find(e => e.id === ev.payload.target)
                // get center of box
                const bb = obj?.box.getCenter();
                if (!bb) return;

                this.cameraOffset.x = bb.x;
                this.cameraOffset.y = bb.y;
                return;
            }

            console.log(this.entities);

            if (!ev.payload.layerId) return;
            const entity = this.entities[ev.payload.layerId].find(e => e.id === ev.payload.target);
            if (!entity) {
                console.warn("Entity not found %s on layer %s", ev.payload.target, ev.payload.layerId);
                return;
            }

            const cellSize = 36;
            const ps = getPuckSize(entity.entity.puckSize);

            const minX = (entity.x * cellSize);
            const minY = (entity.y * cellSize);
            const maxX = minX + (cellSize * ps);
            const maxY = minY + (cellSize * ps);

            const offsetX = (Math.abs(maxX) - Math.abs(minX)) / 2;
            const offsetY = (Math.abs(maxY) - Math.abs(minY)) / 2;

            const x = Math.floor((window.innerWidth / 2)) - (minX + offsetX);
            const y = Math.floor((window.innerHeight / 2)) - (minY + offsetY);

            this.cameraOffset.x = x;
            this.cameraOffset.y = y;
        });

        this.loadEvent = listen<Dungeon>(EVENTS_MAP_EDITOR.Load, async (ev) => {
            this.map = ev.payload;

            this.entities = {};
            this.imageCache.clear();
            this.objects = [];

            this.gridSize = (this.map.state.document.nodes[this.map.state.document.nodes[this.map.state.document.documentNodeId].selectedPage] as PageNode).grid.cellDiameter;

            const assets = Object.values(this.map.state.document.nodes).filter(e => e.type === "DUNGEON_ASSET" || e.type === "ASSET");

            for (const asset of assets) {
                if (asset.type === "DUNGEON_ASSET") {
                    for (const item of asset.children) {
                        const n = this.map.state.document.nodes[item];
                        if (n.type === "GEOMETRY") {
                            const box = new PolygonObject(this.map.data.geometry[n.geometryId]);
                            if (!box.isEmpty)
                                this.objects.push({ box, id: asset.id });
                            break;
                        }
                    }
                    continue;
                }

                const dim = this.map.data.assets[asset.assetId].asset.dimensions;
                const scale = this.map.data.assets[asset.assetId].asset.scale;

                const posX = asset.transform[4];
                const poxY = asset.transform[5];

                const box = new PolygonObject({ width: dim[0] * scale[0], height: dim[1] * scale[1], x: posX, y: poxY });

                this.objects.push({ box, id: asset.id });

                const content = await loadExternalImage(this.map.data.assets[asset.assetId].data);
                this.imageCache.set(this.map.data.assets[asset.assetId].asset.id, content);
            }

        });
        this.setVisEvent = listen<{ target: UUID, value: boolean, type: "entity" | "object", layerId?: UUID }>(EVENTS_MAP_EDITOR.SetVisable, (ev) => {
            if (ev.payload.type === "object") {
                if (!this.map) return;
                const node = this.map.state.document.nodes[ev.payload.target];
                if ("visible" in node) {
                    node.visible = ev.payload.value;
                }
                return;
            }
            if (!ev.payload.layerId) return;
            const entity = this.entities[ev.payload.layerId].find(e => e.id === ev.payload.target);
            if (!entity) {
                console.warn("No entity found with if of %s and type of %s", ev.payload.target, ev.payload.type)
                return;
            }
            entity.overrides.visible = ev.payload.value;
        });

        this.moveCameraEvent = listen<{ x: number, y: number, autoCenter: boolean }>(EVENTS_MAP_EDITOR.MoveCamera, (ev) => {
            this.cameraOffset.x = ev.payload.x;
            this.cameraOffset.y = ev.payload.y;
        });

        this.addEntityEvent = listen<{ entity: ReslovedEntityInstance, layer: UUID }>(EVENTS_MAP_EDITOR.AddEntity, async (ev) => {
            if (!this.entities[ev.payload.layer]) {
                this.entities[ev.payload.layer] = [];
            }

            const data = await loadExternalImage(ev.payload.entity.entity.image);
            this.imageCache.set(ev.payload.entity.entity.image, data);

            this.entities[ev.payload.layer].push(ev.payload.entity);
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
        this.addEntityEvent?.then(e => e());
        this.removeEventListener("click", this.onClick);
        if (this.frame) cancelAnimationFrame(this.frame);
    }

    private drawGrid(ctx: CanvasRenderingContext2D, gridCellDiameter: number, lineWidth: number, color = "lightgrey") {
        ctx.save();

        ctx.beginPath();

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;

        const gridXCount = Math.round(ctx.canvas.width / gridCellDiameter) + 100;
        const gridYCount = Math.round(ctx.canvas.height / gridCellDiameter) + 100;

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
        ctx.font = "15px serif"
        ctx.fillStyle = "green"

        for (let x = xStart; x <= gridXCount; x++) {
            ctx.fillText(`${x},0`, x * gridCellDiameter, gridYStartCell);
        }

        ctx.restore();
    }

    public addObject(x: number, y: number, width: number, height: number) {
        this.objects.push({ box: new PolygonObject({ width, height, x, y }), id: crypto.randomUUID() })
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
                case "ASSET": {
                    if (!node.visible) break;

                    const asset = this.map.data.assets[node.assetId];

                    const image = this.imageCache.get(asset.asset.id);
                    if (!image) break;

                    const [w, h] = asset.asset.dimensions;
                    const s = asset.asset.scale;

                    this.ctx.save();

                    this.ctx.drawImage(image, node.transform[4], node.transform[5], w * s[0], h * s[1]);
                    this.ctx.restore();
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

                        for (const poly of geomerty.polygons) {
                            // main geomerty
                            this.drawPolygonFill(poly[0], this.ctx, toHex(node.fill.colour), transform);

                            // remove hollow points
                            if (poly.length > 1) {
                                for (let i = 1; i < poly.length; i++) {
                                    this.drawPolygonFill(poly[i], this.ctx, backgroundColor, transform);
                                }
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
    private drawEntity(ctx: CanvasRenderingContext2D, imageId: string, x: number, y: number, puckSize: number, gridCellDiameter: number, transform?: DOMMatrix | null) {
        const wh = gridCellDiameter * puckSize;

        const cachedImage = this.imageCache.get(imageId);
        if (!cachedImage) return;

        ctx.save();

        if (transform) {
            const current = ctx.getTransform();
            transform.e = current.e;
            transform.f = current.f;
            ctx.setTransform(transform);
        }

        ctx.drawImage(cachedImage, x * gridCellDiameter, y * gridCellDiameter, wh, wh);

        ctx.restore();
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
                    this.drawEntity(this.ctx, unit.entity.image, unit.x, unit.y, getPuckSize(unit.entity.puckSize), (document.nodes[selectedPage] as PageNode).grid.cellDiameter);
                }
            }
        } else {
            this.drawGrid(this.ctx, this.gridSize, 1);
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

    public getGridCellSize() {
        return this.gridSize;
    }

    public getOffset(ev: MouseEvent) {
        return {
            x: this.getEventLocation(ev).x / this.cameraZoom - this.cameraOffset.x,
            y: this.getEventLocation(ev).y / this.cameraZoom - this.cameraOffset.y
        }
    }

    private onPointerDown = (ev: MouseEvent) => {
        this.isDragging = true;
        this.didMove = false;
        this.dragStart = this.getOffset(ev);

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
        //this.lastZoom = this.cameraZoom
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