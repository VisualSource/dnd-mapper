import type { UUID } from "crypto";

export type Polygon = [number, number][]

type DocumentNode = {
    type: "DOCUMENT";
    id: "document";
    name: string;
    selectedPage: string;
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

type ReslovedChildren<T, C = unknown> = Omit<T, "children"> & { children: C[] };

type Node = PageNode | ImagesNode | TemplateNode | GeometryNode | GridNode | MultiPolygonNode | FolderNode;
type ResolvedPageNode = ReslovedChildren<PageNode>;
type ReslovedImagesNode = ReslovedChildren<ImagesNode>;
type ReslovedTemplateNode = ReslovedChildren<TemplateNode>;
type ReslovedGeometryNode = ReslovedChildren<GeometryNode> & { geometry: Dungeon["data"]["geometry"][UUID] };
type ReslovedFolderNode = ReslovedChildren<FolderNode>;
type ReslovedNodeWithChildren = ResolvedPageNode | ReslovedImagesNode | ReslovedTemplateNode | ReslovedGeometryNode | ReslovedFolderNode
type ReslovedNode = ReslovedNodeWithChildren | GridNode | MultiPolygonNode;


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
                polylines: unknown[]
            }
        }
        assets: {}
    }
}


function resolveChildren(doc: Dungeon, childrenIds: UUID[]): ReslovedNode[] {
    const children: ReslovedNode[] = [];

    for (const child of childrenIds) {
        const node = doc.state.document.nodes[child];
        if (!node) continue;

        if ("children" in node) {
            const childs = resolveChildren(doc, node.children);
            (node as ReslovedNodeWithChildren).children = childs;
        }

        if (node.type === "GEOMETRY") {
            (node as ReslovedGeometryNode).geometry = doc.data.geometry[node.geometryId]
        }

        children.push({ ...node } as ReslovedNode);
    }


    return children;
}

export function parseDungeonSave(value: Dungeon) {
    if (value.version !== 1) throw new Error("Unsupported Version")

    const doc = value.state.document;

    const docConfig = doc.nodes[doc.documentNodeId];
    const children = resolveChildren(value, docConfig.children);


    return {
        ...docConfig,
        children,
    }
}