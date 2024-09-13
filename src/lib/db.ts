import Dexie, { type EntityTable } from "dexie";
import type { Entity, Group, Stage } from "./types";

const db = new Dexie("us.visualsource.dnd-mapper") as Dexie & {
    entity: EntityTable<Entity, "id">,
    stage: EntityTable<Stage, "id">,
    groups: EntityTable<Group, "id">
};
db.version(2).stores({
    entity: "&id,name,image,initiative,isPlayerControlled,displayOnMap,health,maxHealth,tempHealth",
    stage: "&id,name,*entities,backgroundImage,backgroundPosition,backgroundSize,gridScale,prevStage,nextStage,stageGroup",
    groups: "id++,&name"
})

export { db }