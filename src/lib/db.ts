import Dexie, { type EntityTable } from "dexie";
import type { Entity, Group, Stage } from "./types";

const db = new Dexie("us.visualsource.dnd-mapper") as Dexie & {
	entity: EntityTable<Entity, "id">;
	stage: EntityTable<Stage, "id">;
	groups: EntityTable<Group, "id">;
};
db.version(10).stores({
	entity:
		"&id,name,image,initiative,isPlayerControlled,displayOnMap,health,maxHealth,tempHealth,puckSize",
	stage:
		"&id,name,dsFilepath,prevStage,nextStage,stageGroup,data,entities",
	groups: "id++,&name",
});

export { db };
