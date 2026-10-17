import { world, system } from "@minecraft/server";
import { handleElevator } from "./core/elevator.js";
export { handleElevator } from "./core/elevator.js";
export { KinematicElevator } from "./core/kinematicElevator.js";
export { showElevatorMenu } from "./core/elevatorUI.js";

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        if (player.isSneaking || player.isJumping) {
            handleElevator(player);
        }
    }
}, 4);

console.warn("[Bedrock Script Elevator] Aufzugsystem aktiv.");

// Build-Trace #41: Tippfehler behoben

// Build-Trace #42: Werte feinjustiert

// Build-Trace #43: Prüfung auf undefined hinzugefügt

// Build-Trace #44: Cooldown angepasst

// Build-Trace #45: kleine Performance-Optimierung im Tick-Loop

// Build-Trace #47: WIP

// Build-Trace #48: console.log entfernt
