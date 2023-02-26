import {WORKER} from "../constants";
import {WorkerTask} from "./roles/workerBehavior";

const workerOrganizer = {
    organizeWorkersIn(room: Room) {
        if (!room.spawn) return;

        const workers = room.spawn.creepsByRole[WORKER];
        if (workers.length === 0) return;

        if (room.constructionSites.length > 0) {
            const upgraders = _.filter(workers, worker => worker.memory.task === WorkerTask.UPGRADER);
            if (upgraders.length > 1) {
                _.forEach(upgraders, (upgrader, t) => {
                    if (t != 0) {
                        upgrader.memory.task = WorkerTask.BUILDER;
                    }
                });
            } else if (upgraders.length === 0) {
                workers[0].memory.task = WorkerTask.UPGRADER;
            }
        } else {
            _.forEach(workers, worker => {
                worker.memory.task = WorkerTask.UPGRADER;
            });
        }
    }
};

export default workerOrganizer;
