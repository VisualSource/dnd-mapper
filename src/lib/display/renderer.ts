import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { Entity } from "./entity";
import { EDITOR_MAP_EVENTS } from "../consts";
import type { BackgroundFull, ResolvedStage } from "../types";
import { loadExternalImage } from "./utils";

export class Renderer {
    private abortController = new AbortController();
    private mountCount = 0;
    private ctx: CanvasRenderingContext2D | null = null;
    private entityList = new Map<string, Entity>();
    private gridSize = 28;
    private background: BackgroundFull | null = null;
    private events: UnlistenFn[] = [];

    constructor(private editorMode: boolean) { }

    public setGridSize(size: number) {
        this.gridSize = size;
    }

    public getEntity<T extends Entity>(id: string): T | undefined {
        return this.entityList.get(id) as T | undefined;
    }
    public addEntity<T extends Entity>(entity: T) {
        if (this.entityList.has(entity.id)) throw new Error(`Entity with id ${entity.id} already exists`);
        this.entityList.set(entity.id, entity);
    }

    private async registerEvents() {
        if (this.editorMode) {
            const updateEvent = await listen<ResolvedStage>(EDITOR_MAP_EVENTS.Update, async (ev) => {
                console.log(ev);
                const { background, gridScale, entities } = ev.payload;
                this.entityList.clear();
                if (background !== null) {
                    const i = await loadExternalImage(background.image)
                    this.background = {
                        ...background,
                        image: i,
                    };
                }
                this.gridSize = gridScale;
                for (const { nameOverride, entity, instanceId, x, y } of entities) {
                    if (!entity.displayOnMap) continue;
                    try {
                        const i = await loadExternalImage(entity.image)

                        const en = new Entity({
                            id: instanceId,
                            gridSize: this.gridSize,
                            image: i,
                            name: nameOverride ?? entity.name,
                            isPlayerControlled: entity.isPlayerControlled,
                            size: entity.puckSize,
                            x: x * this.gridSize,
                            y: y * this.gridSize
                        });

                        this.entityList.set(instanceId, en);

                    } catch (error) {
                        console.error(error);
                    }
                }

                this.render();
            });
            this.events.push(updateEvent);
            return;
        }
    }

    private async removeEvents() {
        for (const event of this.events) {
            event();
        }
    }


    private drawBackground(ctx: CanvasRenderingContext2D) {
        if (!this.background) return;

        console.log(window.innerWidth, this.background.image.width, window.innerHeight, this.background.image.height);

        let x = 0;
        let y = 0;
        if (this.background.autoCenter) {
            const winX = Math.round(((window.innerWidth / 2) - (this.background.image.width / 2)) / this.gridSize);
            const winY = Math.round(((window.innerHeight / 2) - (this.background.image.height / 2)) / this.gridSize);

            x = (winX * this.gridSize) + this.background.offset.x;
            y = (winY * this.gridSize) + this.background.offset.y;
        } else {
            x = (this.background.position.x * this.gridSize) + this.background.offset.x;
            y = (this.background.position.y * this.gridSize) + this.background.offset.y;
        }


        ctx.save();
        ctx.rotate(Math.PI / 180 * this.background.rotation);
        ctx.drawImage(this.background.image, x, y);
        ctx.restore();
    }

    private drawGrid(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = "lightgrey";

        ctx.beginPath();

        for (let x = 0; x <= ctx.canvas.width; x += this.gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ctx.canvas.height);
        }

        for (let y = 0; y <= ctx.canvas.height; y += this.gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(ctx.canvas.width, y);
        }

        ctx.stroke();

    }

    private resize = () => {
        if (!this.ctx) return;
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;

        this.render();
    }

    public async mount(canvas: HTMLCanvasElement) {
        try {
            this.abortController.signal.throwIfAborted();
            this.mountCount++;
            if (this.mountCount !== 1) return;
            await this.registerEvents();
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Failed to build canvas");
            this.ctx = ctx;

            this.ctx.canvas.width = window.innerWidth;
            this.ctx.canvas.height = window.innerHeight;

            window.addEventListener("resize", this.resize);
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.debug("Unmount");
                return;
            }
            console.error(error);
        }
    }
    public async unmount() {
        this.abortController.abort();
        this.mountCount--;
        if (this.mountCount !== 0) return;
        window.removeEventListener("resize", this.resize);
        this.ctx = null;
        await this.removeEvents();
    }

    public render() {
        try {
            if (!this.ctx) return;
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

            this.drawBackground(this.ctx);
            this.drawGrid(this.ctx);

            const data = Array.from(this.entityList.values());
            data.sort((a, b) => b.z - a.z);

            for (const entity of data) {
                entity.render(this.ctx);
            }
        } catch (error) {
            console.error(error);
        }
    }
}