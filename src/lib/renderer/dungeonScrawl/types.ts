import type { UUID } from "node:crypto";

export type Polygon = [number, number][]
export type Color = {
    colour: number;
    alpha: number;
}
type DocumentNode = {
    type: "DOCUMENT";
    id: "document";
    name: string;
    selectedPage: UUID;
    children: UUID[]
}

type PageNode = {
    type: "PAGE",
    id: string;
    parentId: string;
    name: string;
    children: UUID[],
    selection: UUID[],
    alpha: number;
    objectSelection: unknown[],
    pageTransform: string;
    grid: {
        type: "square",
        cellDiameter: number;
        variant: "lines",
        visible: boolean;
        dotsOptions: {
            radius: number;
        }
        linesOptions: {
            width: number;
        }
        sharedOptions: {
            colour: {
                colour: number;
                alpha: number;
            }
        }
    }
    background: {
        colour: {
            colour: number;
            alpha: number;
        }
    }
    lighting: {
        enabled: boolean;
        ambientLight: {
            colour: number;
            alpha: number;
        }
        blur: number;
    }
    texture: {
        enabled: boolean;
        scale: number;
        alpha: number;
    }
}

type ImagesNode = {
    type: "IMAGES",
    id: UUID,
    alpha: number;
    parentId: string;
    name: string;
    visible: boolean;
    children: UUID[];
}

type TemplateNode = {
    type: "TEMPLATE",
    id: UUID,
    alpha: number;
    parentId: UUID,
    name: string;
    visible: boolean;
    children: UUID[];
    template: {
        type: string;
        dungeonShape: UUID,
        floor: string;
        grid: string;
        walls: string;
    }
}

type GeometryNode = {
    type: "GEOMETRY",
    id: UUID,
    alpha: number;
    parentId: string;
    name: string;
    visible: boolean;
    children: UUID[],
    backgroundEffect: Record<string, unknown>,
    geometryId: UUID
}

type GridNode = {
    type: "GRID",
    id: UUID;
    alpha: number;
    name: string;
    parentId: UUID,
    visible: boolean;
    gridType: string;
    variant: string;
    cleanOptions: {
        width: number;
        colour: {
            colour: number;
            alpha: number;
        }
    }
    roughOptions: {
        width: number;
        colour: {
            colour: number;
            alpha: number;
        }
        roughness: {
            segmentSizeMin: number,
            segmentSizeMax: number,
            segmentSkipRate: number,
            noDotRate: number,
            scribbleScale: number,
            scribbleAmplitude: number,
            shiftRate: number,
            shiftAmountMin: number,
            shiftAmountMax: number,
            majorNoiseScale: number,
            majorNoiseAmplitude: number,
            majorNoiseShift: number
        }
        dotsOptions: {
            radius: number,
            colour: {
                colour: number,
                alpha: number
            }
        }
    }
}

type MultiPolygonNode = {
    type: "MULTIPOLYGON",
    id: UUID,
    alpha: number;
    name: string;
    visible: boolean;
    blendMode: "normal",
    stroke: {
        visible: boolean;
        width: number;
        colour: {
            colour: number;
            alpha: number;
        }
        roughOptions: string;
    }
    fill: {
        visible: boolean;
        colour: {
            colour: number;
            alpha: number;
        }
    }
}

type FolderNode = {
    type: "FOLDER",
    id: UUID,
    alpha: number;
    parentId: UUID,
    name: string;
    visible: boolean;
    children: UUID[];
}

type Node = PageNode | ImagesNode | TemplateNode | GeometryNode | GridNode | MultiPolygonNode | FolderNode;

export type Dungeon = {
    version: number;
    state: {
        document: {
            documentNodeId: "document";
            nodes: {
                document: DocumentNode
                [key: UUID]: Node
            }
            undoStack: unknown[];
            undoHistoryPaused: boolean;
            undoStackPointer: number;
        }
    }
    data: {
        geometry: {
            [value: UUID]: {
                polygons: Polygon[][],
                polylines: ([number, number][])[]
            }
        }
        assets: unknown
    }
}