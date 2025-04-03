import { IStorageItem } from "../config/storage";

function moveHistoryItemUpward(item: IStorageItem, position: number): IStorageItem {
    // Validate position (should be between 2 and 5 since we can't move message1 up)
    if (position < 2 || position > 5) {
        throw new Error("Position must be between 2 and 5");
    }

    const newItem = { ...item }; // Create a shallow copy of the item
    const history = { ...newItem.history }; // Create a copy of history

    // Convert position to property keys
    const currentKey = `message${position}` as keyof typeof history;
    const aboveKey = `message${position - 1}` as keyof typeof history;

    // Swap the messages
    const temp = history[aboveKey];
    history[aboveKey] = history[currentKey];
    history[currentKey] = temp;

    // Update the history in the new item
    newItem.history = history;

    return newItem;
}

export { moveHistoryItemUpward };
