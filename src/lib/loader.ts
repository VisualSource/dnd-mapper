import { db } from "./db";
import type { Entity, ResolvedStage } from "./types";

export const resloveStage = async (
	id: string,
): Promise<ResolvedStage | null> => {
	const stage = await db.stage.get(id);
	if (!stage) return null;

	//const entities = await db.entity.bulkGet(stage.entities.map((e) => e.id));

	//const reslovedEntities: ResolvedStage["entities"] = [];
	/*for (const instance of stage.entities) {
		const entity = entities.find((e) => e?.id === instance.id) as
			| Entity
			| undefined;
		if (!entity) continue;

		const { id, ...rest } = instance;

		reslovedEntities.push({ ...rest, entity: { ...entity } });
	}*/

	return {
		...stage,
		entities: []
	};
};
