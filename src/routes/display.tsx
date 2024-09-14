import { createFileRoute } from '@tanstack/react-router'
import { HideableHeader } from '../components/game/HideableHeader';
import { useEffect, useRef } from 'react';
import { convertFileSrc } from "@tauri-apps/api/core";
import { listen } from '@tauri-apps/api/event';

//const JIMMY = "C:\\Users\\Collin\\Downloads\\jimmy.png";

const Display: React.FC = () => {
  const ca = useRef<HTMLCanvasElement>(null);
  //const renderer = useRef(new Renderer());

  useEffect(() => {
    /*const unlin = listen("move-player", (ev) => {
      const data = ev.payload as { target: string; move: { x: number, y: number } }

      const player = renderer.current.getEntity<Player>(data.target);
      if (!player) return;

      player.move(data.move.x, data.move.y);

      renderer.current.render();
    });
    if (ca.current) {
      renderer.current.init(ca.current);
      renderer.current.render();
    }*/

    return () => {
      //unlin.then(e => e());
      // renderer.current.destory();
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