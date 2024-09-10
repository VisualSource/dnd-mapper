import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react';
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { listen } from "@tauri-apps/api/event";


const win = getCurrentWebviewWindow();

const Display: React.FC = () => {
  const controls = useRef<HTMLDivElement>(null);

  useEffect(() => {

    const data = listen("update-some-data", (ev) => {
      console.log(ev);
    });

    return () => {
      data.then(e => e());
    }
  }, []);


  return (
    <div className="h-full w-full z-50 relative" data-tauri-drag-region>
      <header className="absolute w-full h-10" onMouseLeave={() => {
        controls.current?.classList.add("hidden")
      }} onMouseEnter={() => {
        controls.current?.classList.remove("hidden");
      }}>
        <div ref={controls} className='hidden bg-gray-600'>
          <button type="button" onClick={() => {
            win.toggleMaximize();
          }}>Max</button>
        </div>
      </header>


    </div>
  );
}

export const Route = createFileRoute('/display')({
  component: Display
})