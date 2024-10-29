/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as StageEditorImport } from './routes/stage-editor'
import { Route as EntityEditorImport } from './routes/entity-editor'
import { Route as DisplayEditorImport } from './routes/display-editor'
import { Route as DisplayImport } from './routes/display'
import { Route as IndexImport } from './routes/index'
import { Route as StageEditorIndexImport } from './routes/stage-editor/index'
import { Route as EntityEditorIndexImport } from './routes/entity-editor/index'
import { Route as StageEditorIdImport } from './routes/stage-editor/$id'
import { Route as EntityEditorNewImport } from './routes/entity-editor/new'
import { Route as EntityEditorIdImport } from './routes/entity-editor/$id'
import { Route as ControlIdImport } from './routes/control.$id'

// Create/Update Routes

const StageEditorRoute = StageEditorImport.update({
  id: '/stage-editor',
  path: '/stage-editor',
  getParentRoute: () => rootRoute,
} as any)

const EntityEditorRoute = EntityEditorImport.update({
  id: '/entity-editor',
  path: '/entity-editor',
  getParentRoute: () => rootRoute,
} as any)

const DisplayEditorRoute = DisplayEditorImport.update({
  id: '/display-editor',
  path: '/display-editor',
  getParentRoute: () => rootRoute,
} as any)

const DisplayRoute = DisplayImport.update({
  id: '/display',
  path: '/display',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const StageEditorIndexRoute = StageEditorIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => StageEditorRoute,
} as any)

const EntityEditorIndexRoute = EntityEditorIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => EntityEditorRoute,
} as any)

const StageEditorIdRoute = StageEditorIdImport.update({
  id: '/$id',
  path: '/$id',
  getParentRoute: () => StageEditorRoute,
} as any)

const EntityEditorNewRoute = EntityEditorNewImport.update({
  id: '/new',
  path: '/new',
  getParentRoute: () => EntityEditorRoute,
} as any)

const EntityEditorIdRoute = EntityEditorIdImport.update({
  id: '/$id',
  path: '/$id',
  getParentRoute: () => EntityEditorRoute,
} as any)

const ControlIdRoute = ControlIdImport.update({
  id: '/control/$id',
  path: '/control/$id',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/display': {
      id: '/display'
      path: '/display'
      fullPath: '/display'
      preLoaderRoute: typeof DisplayImport
      parentRoute: typeof rootRoute
    }
    '/display-editor': {
      id: '/display-editor'
      path: '/display-editor'
      fullPath: '/display-editor'
      preLoaderRoute: typeof DisplayEditorImport
      parentRoute: typeof rootRoute
    }
    '/entity-editor': {
      id: '/entity-editor'
      path: '/entity-editor'
      fullPath: '/entity-editor'
      preLoaderRoute: typeof EntityEditorImport
      parentRoute: typeof rootRoute
    }
    '/stage-editor': {
      id: '/stage-editor'
      path: '/stage-editor'
      fullPath: '/stage-editor'
      preLoaderRoute: typeof StageEditorImport
      parentRoute: typeof rootRoute
    }
    '/control/$id': {
      id: '/control/$id'
      path: '/control/$id'
      fullPath: '/control/$id'
      preLoaderRoute: typeof ControlIdImport
      parentRoute: typeof rootRoute
    }
    '/entity-editor/$id': {
      id: '/entity-editor/$id'
      path: '/$id'
      fullPath: '/entity-editor/$id'
      preLoaderRoute: typeof EntityEditorIdImport
      parentRoute: typeof EntityEditorImport
    }
    '/entity-editor/new': {
      id: '/entity-editor/new'
      path: '/new'
      fullPath: '/entity-editor/new'
      preLoaderRoute: typeof EntityEditorNewImport
      parentRoute: typeof EntityEditorImport
    }
    '/stage-editor/$id': {
      id: '/stage-editor/$id'
      path: '/$id'
      fullPath: '/stage-editor/$id'
      preLoaderRoute: typeof StageEditorIdImport
      parentRoute: typeof StageEditorImport
    }
    '/entity-editor/': {
      id: '/entity-editor/'
      path: '/'
      fullPath: '/entity-editor/'
      preLoaderRoute: typeof EntityEditorIndexImport
      parentRoute: typeof EntityEditorImport
    }
    '/stage-editor/': {
      id: '/stage-editor/'
      path: '/'
      fullPath: '/stage-editor/'
      preLoaderRoute: typeof StageEditorIndexImport
      parentRoute: typeof StageEditorImport
    }
  }
}

// Create and export the route tree

interface EntityEditorRouteChildren {
  EntityEditorIdRoute: typeof EntityEditorIdRoute
  EntityEditorNewRoute: typeof EntityEditorNewRoute
  EntityEditorIndexRoute: typeof EntityEditorIndexRoute
}

const EntityEditorRouteChildren: EntityEditorRouteChildren = {
  EntityEditorIdRoute: EntityEditorIdRoute,
  EntityEditorNewRoute: EntityEditorNewRoute,
  EntityEditorIndexRoute: EntityEditorIndexRoute,
}

const EntityEditorRouteWithChildren = EntityEditorRoute._addFileChildren(
  EntityEditorRouteChildren,
)

interface StageEditorRouteChildren {
  StageEditorIdRoute: typeof StageEditorIdRoute
  StageEditorIndexRoute: typeof StageEditorIndexRoute
}

const StageEditorRouteChildren: StageEditorRouteChildren = {
  StageEditorIdRoute: StageEditorIdRoute,
  StageEditorIndexRoute: StageEditorIndexRoute,
}

const StageEditorRouteWithChildren = StageEditorRoute._addFileChildren(
  StageEditorRouteChildren,
)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/display': typeof DisplayRoute
  '/display-editor': typeof DisplayEditorRoute
  '/entity-editor': typeof EntityEditorRouteWithChildren
  '/stage-editor': typeof StageEditorRouteWithChildren
  '/control/$id': typeof ControlIdRoute
  '/entity-editor/$id': typeof EntityEditorIdRoute
  '/entity-editor/new': typeof EntityEditorNewRoute
  '/stage-editor/$id': typeof StageEditorIdRoute
  '/entity-editor/': typeof EntityEditorIndexRoute
  '/stage-editor/': typeof StageEditorIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/display': typeof DisplayRoute
  '/display-editor': typeof DisplayEditorRoute
  '/control/$id': typeof ControlIdRoute
  '/entity-editor/$id': typeof EntityEditorIdRoute
  '/entity-editor/new': typeof EntityEditorNewRoute
  '/stage-editor/$id': typeof StageEditorIdRoute
  '/entity-editor': typeof EntityEditorIndexRoute
  '/stage-editor': typeof StageEditorIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/display': typeof DisplayRoute
  '/display-editor': typeof DisplayEditorRoute
  '/entity-editor': typeof EntityEditorRouteWithChildren
  '/stage-editor': typeof StageEditorRouteWithChildren
  '/control/$id': typeof ControlIdRoute
  '/entity-editor/$id': typeof EntityEditorIdRoute
  '/entity-editor/new': typeof EntityEditorNewRoute
  '/stage-editor/$id': typeof StageEditorIdRoute
  '/entity-editor/': typeof EntityEditorIndexRoute
  '/stage-editor/': typeof StageEditorIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/display'
    | '/display-editor'
    | '/entity-editor'
    | '/stage-editor'
    | '/control/$id'
    | '/entity-editor/$id'
    | '/entity-editor/new'
    | '/stage-editor/$id'
    | '/entity-editor/'
    | '/stage-editor/'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/display'
    | '/display-editor'
    | '/control/$id'
    | '/entity-editor/$id'
    | '/entity-editor/new'
    | '/stage-editor/$id'
    | '/entity-editor'
    | '/stage-editor'
  id:
    | '__root__'
    | '/'
    | '/display'
    | '/display-editor'
    | '/entity-editor'
    | '/stage-editor'
    | '/control/$id'
    | '/entity-editor/$id'
    | '/entity-editor/new'
    | '/stage-editor/$id'
    | '/entity-editor/'
    | '/stage-editor/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  DisplayRoute: typeof DisplayRoute
  DisplayEditorRoute: typeof DisplayEditorRoute
  EntityEditorRoute: typeof EntityEditorRouteWithChildren
  StageEditorRoute: typeof StageEditorRouteWithChildren
  ControlIdRoute: typeof ControlIdRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  DisplayRoute: DisplayRoute,
  DisplayEditorRoute: DisplayEditorRoute,
  EntityEditorRoute: EntityEditorRouteWithChildren,
  StageEditorRoute: StageEditorRouteWithChildren,
  ControlIdRoute: ControlIdRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/display",
        "/display-editor",
        "/entity-editor",
        "/stage-editor",
        "/control/$id"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/display": {
      "filePath": "display.tsx"
    },
    "/display-editor": {
      "filePath": "display-editor.tsx"
    },
    "/entity-editor": {
      "filePath": "entity-editor.tsx",
      "children": [
        "/entity-editor/$id",
        "/entity-editor/new",
        "/entity-editor/"
      ]
    },
    "/stage-editor": {
      "filePath": "stage-editor.tsx",
      "children": [
        "/stage-editor/$id",
        "/stage-editor/"
      ]
    },
    "/control/$id": {
      "filePath": "control.$id.tsx"
    },
    "/entity-editor/$id": {
      "filePath": "entity-editor/$id.tsx",
      "parent": "/entity-editor"
    },
    "/entity-editor/new": {
      "filePath": "entity-editor/new.tsx",
      "parent": "/entity-editor"
    },
    "/stage-editor/$id": {
      "filePath": "stage-editor/$id.tsx",
      "parent": "/stage-editor"
    },
    "/entity-editor/": {
      "filePath": "entity-editor/index.tsx",
      "parent": "/entity-editor"
    },
    "/stage-editor/": {
      "filePath": "stage-editor/index.tsx",
      "parent": "/stage-editor"
    }
  }
}
ROUTE_MANIFEST_END */
