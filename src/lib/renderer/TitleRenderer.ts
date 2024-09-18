import { Dungeon, parseDungeonSave, Polygon } from "./DungeonScrawl";
import Level from "../../assets/dungeon-wide.json";
import { UUID } from "crypto";

const toHex = (value: number) => `#${value.toString(16)}`;



export class TitleRenderer {
    private mountCount = 0;
    private ctx: CanvasRenderingContext2D | null = null;
    private camera = { x: 0, y: 0 };
    private gridCellDiameter = 36;
    public mount(canvas: HTMLCanvasElement) {
        this.mountCount++;
        if (this.mountCount !== 1) return;

        this.ctx = canvas.getContext("2d");

        this.ctx!.canvas.width = window.innerWidth;
        this.ctx!.canvas.height = window.innerHeight;


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


    private drawGrid(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = "lightgrey";

        ctx.beginPath();

        for (let x = 0; x <= ctx.canvas.width; x += this.gridCellDiameter) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ctx.canvas.height);
        }

        for (let y = 0; y <= ctx.canvas.height; y += this.gridCellDiameter) {
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


    public render() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        const data = (Level as unknown as Dungeon)
        const document = data.state.document;

        const process = (children: UUID[], geomertyId?: UUID) => {
            if (!this.ctx) return;
            for (const child of children) {
                const node = document.nodes[child];
                if (!node) continue;

                switch (node.type) {
                    case "PAGE": {
                        process(node.children, geomertyId);
                        break;
                    }
                    case "IMAGES": {
                        break;
                    }
                    case "TEMPLATE": {
                        if (node.visible) process(node.children, geomertyId);
                        break;
                    }
                    case "GEOMETRY":
                        if (node.visible) process(node.children, node.geometryId);
                        break;
                    case "FOLDER": {
                        if (node.name === "Grid") {
                            this.drawGrid(this.ctx);
                            break;
                        }
                        if (node.visible) process(node.children, geomertyId);
                        break;
                    }
                    case "GRID":

                        break;
                    case "MULTIPOLYGON": {
                        if (!geomertyId || !node.visible) break;
                        const geomerty = data.data.geometry[geomertyId].polygons;


                        if (node.fill.visible) {
                            for (const poly of geomerty) {
                                for (const part of poly) {
                                    this.drawPolygonFill(part, this.ctx, toHex(node.fill.colour.colour))
                                }


                            }
                        }
                        if (node.stroke.visible) {
                            for (const poly of data.data.geometry[geomertyId].polygons) {
                                for (const part of poly) {
                                    this.drawPolygonStroke(part, this.ctx, toHex(node.stroke.colour.colour), node.stroke.width);
                                }

                            }

                        }

                        break;
                    }
                    default:
                        break;
                }
            }
        }


        const docNode = document.nodes[document.documentNodeId];
        process(docNode.children);

        /* // Floor
         this.drawPolygonFill(geo, this.ctx, toHex(16777215));
 
         //grid
         this.drawGrid(this.ctx);
 
         // Walls
         this.drawPolygonStroke(geo, this.ctx, toHex(1513239), 3);*/

    }

}