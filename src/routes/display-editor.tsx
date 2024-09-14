import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react';
import { Renderer } from '../lib/display/renderer';

export const Route = createFileRoute('/display-editor')({
  component: DisplayEditorPage
});


function DisplayEditorPage() {
  const ref = useRef<HTMLCanvasElement>(null);
  const renderer = useRef(new Renderer(true));

  useEffect(() => {
    if (ref.current) {
      renderer.current.mount(ref.current);
    }
    return () => {
      renderer.current.unmount();
    }
  }, []);

  return (
    <div className="h-full w-full z-50 relative">
      <canvas ref={ref} />
    </div>
  );
}