import type { Color, Dungeon, Polygon } from "./dungeonScrawl/types";
import Level from "../../assets/dungeon.json";
import type { UUID } from "node:crypto";

const toHex = (value: Color) => `#${value.colour.toString(16)}`;

export class TitleRenderer {
    private mountCount = 0;
    private ctx: CanvasRenderingContext2D | null = null;
    private camera = { x: 0, y: 0 };
    public map: Dungeon | null = null;
    public selectedPage: UUID | null = null;
    public mount(canvas: HTMLCanvasElement) {
        this.mountCount++;
        if (this.mountCount !== 1) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        this.map = Level as unknown as Dungeon;

        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;

        this.ctx = ctx;

        window.addEventListener("resize", this.resize);

        this.render();
    }
    public unmount() {
        this.mountCount--;
        if (this.mountCount !== 0) return;
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
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ctx.canvas.height);
        }

        for (let y = 0; y <= ctx.canvas.height; y += gridCellDiameter) {
            ctx.moveTo(0, y);
            ctx.lineTo(ctx.canvas.width, y);
        }

        ctx.stroke();
    }

    private drawPolygonFill(points: Polygon, ctx: CanvasRenderingContext2D, color: string) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.fill();

    }
    private drawPolygonStroke(points: Polygon, ctx: CanvasRenderingContext2D, color: string, width: number) {

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.stroke();
        ctx.lineWidth = 1;
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
                        for (const item of geomerty.polygons) {
                            for (const g of item) {
                                this.drawPolygonFill(g, this.ctx, toHex(node.fill.colour));
                            }
                        }
                        for (const item of geomerty.polylines) {
                            const start = item[0];
                            const end = item[1];
                            this.ctx.fillStyle = toHex(node.fill.colour);
                            this.ctx.moveTo(start[0], start[1]);
                            this.ctx.lineTo(end[0], end[1]);
                        }

                    }

                    if (node.stroke.visible) {
                        for (const item of geomerty.polygons) {
                            for (const g of item) {
                                this.drawPolygonStroke(g, this.ctx, toHex(node.stroke.colour), node.stroke.width);
                            }
                        }
                        for (const item of geomerty.polylines) {
                            const start = item[0];
                            const end = item[1];
                            this.ctx.lineWidth = node.stroke.width;
                            this.ctx.fillStyle = toHex(node.fill.colour);
                            this.ctx.moveTo(start[0], start[1]);
                            this.ctx.lineTo(end[0], end[1]);
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
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);


        const document = this.map.state.document;
        const selectedPage = this.selectedPage ?? document.nodes[document.documentNodeId].selectedPage

        this.process(selectedPage);

        // draw entities, other objects

    }

}