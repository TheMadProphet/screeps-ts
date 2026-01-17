import {WORKER} from "../constants";
import roomBuilder from "./roomBuilder";

export const workerTasks = {
    BUILD: 0,
    UPGRADE: 1,
    REPAIR: 2
} as const;

export type WorkerTask = (typeof workerTasks)[keyof typeof workerTasks];

class WorkerOrganizer {
    private taskReservations: WorkerTask[] = [];
    private defaultTask: WorkerTask = workerTasks.UPGRADE;

    public organizeWorkersIn(room: Room) {
        if (Game.time % 2 !== 0) return;
        if (this.roomHasNoWorkers(room)) return;

        this.resetData();

        if (this.roomNeedsRepairs(room)) {
            this.reserveOneWorkerFor(workerTasks.REPAIR);
        }

        if (roomBuilder.constructionSitesAreAvailable(room)) {
            this.reserveOneWorkerFor(workerTasks.UPGRADE);
            this.reserveRemainingWorkersFor(workerTasks.BUILD);
        } else {
            this.reserveRemainingWorkersFor(workerTasks.UPGRADE);
        }

        this.applyAssignment(room);
    }

    private resetData() {
        this.taskReservations = [];
        this.defaultTask = workerTasks.UPGRADE;
    }

    private reserveOneWorkerFor(task: WorkerTask) {
        this.taskReservations.push(task);
    }

    private reserveRemainingWorkersFor(task: WorkerTask) {
        this.defaultTask = task;
    }

    private roomHasNoWorkers(room: Room) {
        return !room.spawn || room.creepsByRole[WORKER].length === 0;
    }

    private roomNeedsRepairs(room: Room) {
        return (
            room.find(FIND_STRUCTURES, {
                filter: structure =>
                    structure.hits / structure.hitsMax < 0.95 && structure.structureType !== "constructedWall"
            }).length > 0
        );
    }

    private applyAssignment(room: Room) {
        const workers = room.workersByTask;

        let tasksMissingWorkers: WorkerTask[] = [];
        for (const it of _.values(workerTasks)) {
            const task = it as WorkerTask;
            const assignedWorkersToTask = workers[task];

            if (this.taskReservations.includes(task)) {
                if (assignedWorkersToTask.length < 1) {
                    tasksMissingWorkers.push(task);
                } else if (assignedWorkersToTask.length > 1) {
                    _.forEach(assignedWorkersToTask.slice(1), it => (it.memory.task = this.defaultTask));
                }
            } else if (assignedWorkersToTask.length > 0 && task !== this.defaultTask) {
                _.forEach(assignedWorkersToTask, it => (it.memory.task = this.defaultTask));
            }
        }

        for (let i = workers[this.defaultTask].length - 1; i >= 0; i--) {
            if (tasksMissingWorkers.length === 0) break;

            workers[this.defaultTask][i].memory.task = tasksMissingWorkers.shift();
        }
    }
}

const workerOrganizer = new WorkerOrganizer();
export default workerOrganizer;
