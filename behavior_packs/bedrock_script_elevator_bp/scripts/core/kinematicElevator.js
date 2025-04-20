import { system, world } from "@minecraft/server";

export class KinematicElevator {
    constructor(config) {
        this.name = config.name;
        this.minY = config.minY;
        this.maxY = config.maxY;
        this.x1 = config.x1;
        this.z1 = config.z1;
        this.x2 = config.x2;
        this.z2 = config.z2;
        this.currentY = config.minY;
        this.isMoving = false;
        this.direction = 0;
    }

    moveUp(player) {
        if (this.isMoving || this.currentY >= this.maxY) return;
        this.isMoving = true;
        this.direction = 1;

        const interval = system.runInterval(() => {
            if (this.currentY < this.maxY) {
                const dim = player.dimension;
                dim.runCommandAsync(`execute as @e[x=${this.x1},y=${this.currentY},z=${this.z1},dx=${Math.abs(this.x2 - this.x1)},dy=4,dz=${Math.abs(this.z2 - this.z1)}] run tp @s ~ ~1 ~`);
                player.playSound("tile.piston.out", { volume: 0.5 });
                this.currentY++;
            } else {
                system.clearRun(interval);
                this.isMoving = false;
                player.playSound("random.levelup", { volume: 0.6, pitch: 1.5 });
            }
        }, 15);
    }

    moveDown(player) {
        if (this.isMoving || this.currentY <= this.minY) return;
        this.isMoving = true;
        this.direction = -1;

        const interval = system.runInterval(() => {
            if (this.currentY > this.minY) {
                const dim = player.dimension;
                dim.runCommandAsync(`execute as @e[x=${this.x1},y=${this.currentY},z=${this.z1},dx=${Math.abs(this.x2 - this.x1)},dy=4,dz=${Math.abs(this.z2 - this.z1)}] run tp @s ~ ~-1 ~`);
                player.playSound("tile.piston.in", { volume: 0.5 });
                this.currentY--;
            } else {
                system.clearRun(interval);
                this.isMoving = false;
                player.playSound("random.levelup", { volume: 0.6, pitch: 1.0 });
            }
        }, 15);
    }
}
