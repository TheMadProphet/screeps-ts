import {WORKER} from "../constants";

const workerOrganizer = {
    organizeWorkersIn(room: Room) {
        if (!room.spawn) return;

        const workers = room.spawn.creepsByRole[WORKER];

        const upgraders = _.filter(workers, worker => worker.memory.task === "upgrader");

        if (room.constructionSites.length > 0) {
            if (upgraders.length > 1) {
                const onlyUpgrader = upgraders[0];
                _.forEach(upgraders, upgrader => {
                    upgrader.memory.task = "builder";
                });

                onlyUpgrader.memory.task = "upgrader";
            }
        } else {
            _.forEach(workers, worker => {
                worker.memory.task = "upgrader";
            });
        }
    }
};

export default workerOrganizer;
