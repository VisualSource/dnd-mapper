import type { UUID } from "node:crypto";

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

export type Transform = [number, number, number, number, number, number];

type DungeonAssetNode = {
    type: "DUNGEON_ASSET",
    id: UUID,
    name: string,
    alpha: number;
    parentId: string;
    visible: boolean,
    children: UUID[];
    transform: Transform;
}

export type PageNode = {
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

type ShadowNode = {
    type: "SHADOW";
    id: UUID;
    alpha: number,
    name: string,
    parentId: UUID,
    visible: boolean,
    castFromInternalLines: boolean,
    tx: number;
    ty: number;
    colour: Color;
    lineWidth: number,
    roughOptions: "low" | "off"
}

type HatchingNode = {
    type: "HATCHING"
    id: UUID,
    alpha: number;
    name: string,
    parentId: UUID,
    visible: boolean;
    variant: string;
    squareOptions: {
        padding: number;
        lineCount: number;
    };
    sharedOptions: {
        wallDistance: number,
        strokeWidth: number,
        strokeColour: Color
    }
}

type BufferShadingNode = {
    type: "BUFFER_SHADING",
    id: UUID;
    alpha: number,
    name: string,
    parentId: UUID;
    visible: boolean;
    wallDistance: number;
    roughness: number;
    fill: {
        visible: boolean;
        colour: Color;
    },
    stroke: {
        visible: boolean,
        colour: Color;
        width: number;
    }
}

type Node = PageNode | ImagesNode | TemplateNode | GeometryNode | GridNode | MultiPolygonNode | FolderNode | DungeonAssetNode | ShadowNode | HatchingNode | BufferShadingNode;
export type NodeType = Pick<Node, "type">["type"]

export type Point = [number, number];
export type Shape = Point[];
export type Polygon = Shape[];

export type Geometry = {
    polygons: Polygon[],
    polylines: Shape[]
}

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
            [value: UUID]: Geometry
        }
        assets: unknown
    }
}