import type { Geometry } from "./types";
export class PolygonObject {
    private boundingBox: { minX: number, minY: number, maxX: number, maxY: number; }

    constructor(private geomerty: Geometry) {

        let minX = null;
        let maxX = null;
        let minY = null;
        let maxY = null;

        for (const shapes of geomerty.polygons) {
            for (const shape of shapes) {
                for (const [x, y] of shape) {
                    minX = minX ? Math.min(minX, x) : x;
                    minY = minY ? Math.min(minY, y) : y;
                    maxX = maxX ? Math.max(maxX, x) : x;
                    maxY = maxY ? Math.max(maxY, y) : y;
                }
            }
        }

        for (const lines of geomerty.polylines) {
            for (const [x, y] of lines) {
                minX = minX ? Math.min(minX, x) : x;
                minY = minY ? Math.min(minY, y) : y;
                maxX = maxX ? Math.max(maxX, x) : x;
                maxY = maxY ? Math.max(maxY, y) : y;
            }
        }


        this.boundingBox = {
            minX: minX ?? 0,
            minY: minY ?? 0,
            maxX: maxX ?? 0,
            maxY: maxY ?? 0
        }
    }

    public get isEmpty(): boolean {
        return this.boundingBox.minX === 0 && this.boundingBox.minY === 0 && this.boundingBox.maxX === 0 && this.boundingBox.maxY === 0
    }

    public getShape() {
        return this.geomerty;
    }

    public getBoundingBox() {
        return this.boundingBox;
    }
    // https://stackoverflow.com/questions/217578/how-can-i-determine-whether-a-2d-point-is-within-a-polygon
    public contains(point: { x: number, y: number }): boolean {
        if (point.x < this.boundingBox.minX || point.x > this.boundingBox.maxX || point.y < this.boundingBox.minY || point.y > this.boundingBox.maxY) {
            return false;
        }
        return true;
    }
}