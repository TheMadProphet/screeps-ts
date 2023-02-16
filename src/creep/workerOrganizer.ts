import {WORKER} from "../constants";

const workerOrganizer = {
    organizeWorkersIn(room: Room) {
        if (!room.spawn) return;

        const workers = room.spawn.creepsByRole[WORKER];
        if (workers.length === 0) return;

        if (room.constructionSites.length > 0) {
            const upgraders = _.filter(workers, worker => worker.memory.task === "upgrader");
            if (upgraders.length > 1) {
                _.forEach(upgraders, (upgrader, t) => {
                    if (t != 0) {
                        upgrader.memory.task = "builder";
                    }
                });
            } else if (upgraders.length === 0) {
                workers[0].memory.task = "upgrader";
            }
        } else {
            _.forEach(workers, worker => {
                worker.memory.task = "upgrader";
            });
        }
    }
};

export default workerOrganizer;
