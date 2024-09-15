import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { StageSelectionDialog, type StageSelectionDialogHandle } from "../components/dialog/StageSelectionDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export const Route = createFileRoute("/")({
    component: Index,
});

function Index() {
    const [isReady, setIsReady] = useState(false);
    const navigate = useNavigate();
    const dialogRef = useRef<StageSelectionDialogHandle>(null);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => setIsReady(true));
    }, [])


    return (
        <div className="flex flex-col w-full justify-center items-center">
            <StageSelectionDialog ref={dialogRef} onSelect={(id) => navigate({ to: "/control/$id", params: { id } })} />
            <div className="absolute h-full w-full top-0 left-0 z-20 flex flex-col items-center justify-center">
                <div className="h-32">
                    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Dnd Mapper</h1>
                </div>
                <div className="flex flex-col gap-2 w-2/12">
                    <Link to="/stage-editor" className={buttonVariants({ size: "sm" })}>Stage Editor</Link>
                    <Link to="/entity-editor" className={buttonVariants({ size: "sm" })}>Entity Editor</Link>
                    <Button type="button" size="sm" onClick={() => dialogRef.current?.show()}>Run Stage</Button>
                </div>
            </div>
            {isReady ? <Particles options={{
                particles: {
                    number: {
                        value: 100
                    },
                    color: {
                        value: "#ffffff"
                    },
                    links: {
                        enable: true,
                        distance: 200,
                    },
                    shape: {
                        type: "circle"
                    },
                    opacity: {
                        value: 1
                    },
                    size: {
                        value: {
                            min: 4,
                            max: 6
                        }
                    },
                    move: {
                        enable: true,
                        speed: 2
                    }
                }
            }} /> : null}
        </div>
    );
}