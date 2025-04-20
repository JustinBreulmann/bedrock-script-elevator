import { system, world } from "@minecraft/server";

const playerCooldowns = new Map();
const COOLDOWN_TICKS = 15;

function getBlockLocation(player) {
    const x = Math.floor(player.location.x);
    const y = Math.floor(player.location.y - 1);
    const z = Math.floor(player.location.z);
    return { x, y, z };
}

function canTeleport(player) {
    const velocity = player.getVelocity();
    if (Math.sqrt(velocity.x ** 2 + velocity.z ** 2) > 0.25) return false;
    const lastTick = playerCooldowns.get(player.id) ?? 0;
    return system.currentTick - lastTick >= COOLDOWN_TICKS;
}

function teleportPlayer(player, targetLoc, isUp) {
    playerCooldowns.set(player.id, system.currentTick);
    player.teleport({ x: targetLoc.x + 0.5, y: targetLoc.y + 1, z: targetLoc.z + 0.5 });
    player.playSound(isUp ? "random.orb" : "random.door_close", { volume: 0.8, pitch: isUp ? 1.2 : 0.8 });
}

function countIronBlocks(player, blockLocation, yOffsetDirection, yOffsetStart, maxFloors) {
    const { x, y, z } = blockLocation;
    let blockCounter = 0;
    let yOffset = yOffsetStart;
    
    while (yOffset <= maxFloors) {
        const checkLocation = { x, y: y + (yOffsetDirection * yOffset), z };
        try {
            const checkBlock = player.dimension.getBlock(checkLocation);
            if (checkBlock && checkBlock.typeId === "minecraft:iron_block") {
                blockCounter++;
            }
        } catch (e) {
            break;
        }
        yOffset++;
    }
    return blockCounter;
}

function updateOnScreenDisplay(player, floorLevel, totalFloors) {
    if (totalFloors <= 1) {
        player.onScreenDisplay.setActionBar("§e§lAufzug §8| §fErdgeschoss");
    } else {
        player.onScreenDisplay.setActionBar(`§e§lAufzug §8| §aEtage ${floorLevel}/${totalFloors}`);
    }
}

export function handleElevator(player) {
    if (!player.isSneaking && !player.isJumping) return;
    if (!canTeleport(player)) return;

    const blockLoc = getBlockLocation(player);
    const standingBlock = player.dimension.getBlock(blockLoc);
    if (!standingBlock || standingBlock.typeId !== "minecraft:iron_block") return;

    const maxScanDistance = 64;

    // SCHLEICHEN -> NACH UNTEN
    if (player.isSneaking) {
        let targetLocation = null;
        for (let dy = 2; dy <= maxScanDistance; dy++) {
            const checkLoc = { x: blockLoc.x, y: blockLoc.y - dy, z: blockLoc.z };
            const b = player.dimension.getBlock(checkLoc);
            if (b && b.typeId === "minecraft:iron_block") {
                const space1 = player.dimension.getBlock({ ...checkLoc, y: checkLoc.y + 1 });
                const space2 = player.dimension.getBlock({ ...checkLoc, y: checkLoc.y + 2 });
                if (space1 && space1.isAir && space2 && space2.isAir) {
                    targetLocation = checkLoc;
                    break;
                }
            }
        }

        if (targetLocation) {
            teleportPlayer(player, targetLocation, false);
            const above = countIronBlocks(player, targetLocation, 1, 2, maxScanDistance);
            const below = countIronBlocks(player, targetLocation, -1, 2, maxScanDistance);
            const total = above + below + 1;
            const currentFloor = below + 1;
            updateOnScreenDisplay(player, currentFloor, total);
        }
    }

    // SPRINGEN -> NACH OBEN
    if (player.isJumping) {
        let targetLocation = null;
        for (let dy = 2; dy <= maxScanDistance; dy++) {
            const checkLoc = { x: blockLoc.x, y: blockLoc.y + dy, z: blockLoc.z };
            const b = player.dimension.getBlock(checkLoc);
            if (b && b.typeId === "minecraft:iron_block") {
                const space1 = player.dimension.getBlock({ ...checkLoc, y: checkLoc.y + 1 });
                const space2 = player.dimension.getBlock({ ...checkLoc, y: checkLoc.y + 2 });
                if (space1 && space1.isAir && space2 && space2.isAir) {
                    targetLocation = checkLoc;
                    break;
                }
            }
        }

        if (targetLocation) {
            teleportPlayer(player, targetLocation, true);
            const above = countIronBlocks(player, targetLocation, 1, 2, maxScanDistance);
            const below = countIronBlocks(player, targetLocation, -1, 2, maxScanDistance);
            const total = above + below + 1;
            const currentFloor = below + 1;
            updateOnScreenDisplay(player, currentFloor, total);
        }
    }
}
