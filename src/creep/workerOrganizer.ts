import {WORKER} from "../constants";

export enum WorkerTask {
    BUILD,
    UPGRADE,
    REPAIR
}

class WorkerOrganizer {
    private taskReservations: Set<WorkerTask> = new Set();
    private defaultTask: WorkerTask = WorkerTask.UPGRADE;

    public organizeWorkersIn(room: Room) {
        if (Game.time % 10 !== 0) return;
        if (this.roomHasNoWorkers(room)) return;

        this.resetData();

        if (this.roomNeedsRepairs(room)) {
            this.reserveOneWorkerFor(WorkerTask.REPAIR);
        }

        if (this.roomHasConstructionSites(room)) {
            this.reserveOneWorkerFor(WorkerTask.UPGRADE);
            this.reserveRemainingWorkersFor(WorkerTask.BUILD);
        } else {
            this.reserveRemainingWorkersFor(WorkerTask.UPGRADE);
        }

        this.applyAssignment(room);
    }

    private resetData() {
        this.taskReservations = new Set();
        this.defaultTask = WorkerTask.UPGRADE;
    }

    private reserveOneWorkerFor(task: WorkerTask) {
        this.taskReservations.add(task);
    }

    private reserveRemainingWorkersFor(task: WorkerTask) {
        this.defaultTask = task;
    }

    private roomHasNoWorkers(room: Room) {
        return !room.spawn || room.spawn.creepsByRole[WORKER].length === 0;
    }

    private roomNeedsRepairs(room: Room) {
        return room.find(FIND_STRUCTURES, {filter: structure => structure.hits / structure.hitsMax < 0.3}).length > 0;
    }

    private roomHasConstructionSites(room: Room) {
        return room.find(FIND_MY_CONSTRUCTION_SITES).length > 0;
    }

    private applyAssignment(room: Room) {
        const workers = room.spawn.workersByTask;

        let tasksMissingWorkers: WorkerTask[] = [];
        _.forEach(WorkerTask, it => {
            const task = it as WorkerTask;
            const assignedWorkersToTask = workers[task];

            if (this.taskReservations.has(task)) {
                if (assignedWorkersToTask.length < 1) {
                    tasksMissingWorkers.push(task);
                }
            } else if (assignedWorkersToTask.length > 0 && task !== this.defaultTask) {
                _.forEach(workers[task], it => (it.memory.task = this.defaultTask));
            }
        });

        for (let i = workers[this.defaultTask].length - 1; i >= 0; i--) {
            if (tasksMissingWorkers.length === 0) break;

            workers[this.defaultTask][i].memory.task = tasksMissingWorkers.shift();
        }
    }
}

const workerOrganizer = new WorkerOrganizer();
export default workerOrganizer;
