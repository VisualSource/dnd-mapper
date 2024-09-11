import { createFileRoute } from '@tanstack/react-router'
import { HideableHeader } from '../components/game/HideableHeader';
import { useEffect, useRef } from 'react';
import { convertFileSrc } from "@tauri-apps/api/core";
import { listen } from '@tauri-apps/api/event';

type PuckSize = "small" | "mid" | "large";

const GRID_CELL_SIZE = 28;

const JIMMY = "C:\\Users\\Collin\\Downloads\\jimmy.png";

function getPuckSize(size: PuckSize) {
  switch (size) {
    case 'small':
      return 1;
    case 'mid':
      return 2;
    case 'large':
      return 3;
    default:
      return 1;
  }
}

async function loadExternalImage(source: string) {
  const url = convertFileSrc(source);
  const image = new Image();
  image.src = url;
  await new Promise<void>((ok, reject) => {
    image.addEventListener("error", (er) => reject(er));
    image.addEventListener("load", () => ok());
  });
  return image;
}

class Entity extends EventTarget {
  protected x = 0;
  protected y = 0;
  public z = 0;
  protected size = 1;
  constructor(public id: string, size: PuckSize, protected image: HTMLImageElement) {
    super();
    this.size = getPuckSize(size);
  }

  public move(x: number, y: number) {
    const stepX = GRID_CELL_SIZE * x;
    const stepY = GRID_CELL_SIZE * y;

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
    const wh = GRID_CELL_SIZE * this.size;
    ctx.drawImage(this.image, this.x, this.y, wh, wh);
  }
}

class Player extends Entity {
  constructor(public name: string, id: string, size: PuckSize, image: HTMLImageElement) {
    super(id, size, image);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    super.render(ctx);

    ctx.font = "10px serif";

    ctx.fillStyle = "white"
    ctx.fillText("Jimmy", this.x + 10, this.y + 5);
  }
}

class Renderer {
  public ctx: CanvasRenderingContext2D | null = null;
  public entityList = new Map<string, Entity>();

  constructor() {
    loadExternalImage(JIMMY).then(image => {
      const jimmy = new Player("Jimmy", "TEST_ID", "mid", image);
      jimmy.setPosition(GRID_CELL_SIZE * 4, GRID_CELL_SIZE * 5)
      this.addEntity(jimmy);
      this.render();
    });
  }

  public getEntity<T extends Entity>(id: string): T | undefined {
    return this.entityList.get(id) as T | undefined;
  }
  public addEntity<T extends Entity>(entity: T) {
    if (this.entityList.has(entity.id)) throw new Error(`Entity with id ${entity.id} already exists`);
    this.entityList.set(entity.id, entity);
  }

  private drawGrid(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "lightgrey";

    ctx.beginPath();

    for (let x = 0; x <= ctx.canvas.width; x += GRID_CELL_SIZE) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
    }

    for (let y = 0; y <= ctx.canvas.height; y += GRID_CELL_SIZE) {
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


  public init(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to build canvas");
    this.ctx = ctx;

    this.ctx.canvas.width = window.innerWidth;
    this.ctx.canvas.height = window.innerHeight;

    window.addEventListener("resize", this.resize);
  }
  public destory() {
    window.removeEventListener("resize", this.resize);
    this.ctx = null;
  }

  public render() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.drawGrid(this.ctx);

    const data = Array.from(this.entityList.values());
    data.sort((a, b) => b.z - a.z);

    for (const entity of data) {
      entity.render(this.ctx);
    }
  }
}

const Display: React.FC = () => {
  const ca = useRef<HTMLCanvasElement>(null);
  const renderer = useRef(new Renderer());

  useEffect(() => {
    const unlin = listen("move-player", (ev) => {
      const data = ev.payload as { target: string; move: { x: number, y: number } }

      const player = renderer.current.getEntity<Player>(data.target);
      if (!player) return;

      player.move(data.move.x, data.move.y);

      renderer.current.render();
    });
    if (ca.current) {
      renderer.current.init(ca.current);
      renderer.current.render();
    }

    return () => {
      unlin.then(e => e());
      renderer.current.destory();
    }
  }, [])

  return (
    <div className="h-full w-full z-50 relative">
      <HideableHeader />
      <canvas ref={ca} className="h-full w-full block" />
    </div>
  );
}

export const Route = createFileRoute('/display')({
  component: Display
})