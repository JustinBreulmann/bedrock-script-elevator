import { ActionFormData } from "@minecraft/server-ui";

export function showElevatorMenu(player, floors, onSelectFloor) {
    const form = new ActionFormData();
    form.title("§e§lEtage wählen");
    form.body("Wähle ein Zielstockwerk für den Aufzug:");

    floors.forEach((f, index) => {
        form.button(`§8Etage ${index + 1}: §r§2${f.name || ("Höhe " + f.y)}`);
    });

    form.show(player).then((res) => {
        if (res.canceled) return;
        if (onSelectFloor) {
            onSelectFloor(player, floors[res.selection]);
        }
    });
}
