class RoomBuilder {
    public constructionSitesAreAvailable(room: Room): boolean {
        const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
        if (constructionSites.length > 0) {
            return true;
        }

        return this.findConstructionSiteInColoniesOf(room) !== undefined;
    }

    public findConstructionSite(creep: Creep): ConstructionSite | undefined {
        const closestSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        if (closestSite) return closestSite;

        const home = Game.rooms[creep.memory.home];
        if (home) {
            return this.findConstructionSiteInColoniesOf(home);
        }

        return undefined;
    }

    private findConstructionSiteInColoniesOf(room: Room): ConstructionSite | undefined {
        for (const colony of room.getVisibleColonies()) {
            const sitesInColony = colony.find(FIND_MY_CONSTRUCTION_SITES);
            if (sitesInColony.length > 0) {
                return sitesInColony[0];
            }
        }

        return undefined;
    }
}

const roomBuilder = new RoomBuilder();
export default roomBuilder;
