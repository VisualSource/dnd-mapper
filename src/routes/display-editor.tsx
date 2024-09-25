import DSRenderer from "@/lib/renderer/DSRenderer";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/display-editor")({
	component: DisplayEditorPage,
});

const MAX_ZOOM = 5
const MIN_ZOOM = 0.1
const SCROLL_SENSITIVITY = 0.0005
let isDragging = false
const dragStart = { x: 0, y: 0 }
const cameraOffset = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
let cameraZoom = 1
let lastZoom = cameraZoom

function getEventLocation(e: TouchEvent | MouseEvent) {
	if ((e as TouchEvent).touches && (e as TouchEvent).touches.length === 1) {
		return { x: (e as TouchEvent).touches[0].clientX, y: (e as TouchEvent).touches[0].clientY }
	}
	return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }
}
function onPointerDown(e: MouseEvent) {
	isDragging = true
	dragStart.x = getEventLocation(e).x / cameraZoom - cameraOffset.x
	dragStart.y = getEventLocation(e).y / cameraZoom - cameraOffset.y
}
function onPointerUp(e: MouseEvent) {
	isDragging = false
	//initialPinchDistance = null
	lastZoom = cameraZoom
}

function onPointerMove(e: MouseEvent) {
	if (isDragging) {
		cameraOffset.x = getEventLocation(e).x / cameraZoom - dragStart.x
		cameraOffset.y = getEventLocation(e).y / cameraZoom - dragStart.y
	}
}

function drawRect(x: number, y: number, width: number, height: number, ctx: CanvasRenderingContext2D) {
	ctx.fillRect(x, y, width, height)
}

function drawText(text: string, x: number, y: number, size: number, font: string, ctx: CanvasRenderingContext2D) {
	ctx.font = `${size}px ${font}`
	ctx.fillText(text, x, y)
}
function adjustZoom(zoomAmount: number, zoomFactor?: number) {
	if (!isDragging) {
		if (zoomAmount) {
			cameraZoom += zoomAmount
		}
		else if (zoomFactor) {
			console.log(zoomFactor)
			cameraZoom = zoomFactor * lastZoom
		}

		cameraZoom = Math.min(cameraZoom, MAX_ZOOM)
		cameraZoom = Math.max(cameraZoom, MIN_ZOOM)

		console.log(zoomAmount)
	}
}

function DisplayEditorPage() {
	const ref = useRef<HTMLCanvasElement>(null);
	const renderer = useRef(new DSRenderer());

	useEffect(() => {
		if (ref.current) {
			renderer.current.mount(ref.current);
		}
		return () => {
			renderer.current.unmount();
		};
	}, []);

	return (
		<div className="h-full w-full z-50 relative">
			<canvas ref={ref} />
		</div>
	);
}
