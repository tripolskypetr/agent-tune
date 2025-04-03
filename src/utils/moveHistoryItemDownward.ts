import { IStorageItem } from "../config/storage";

function moveHistoryItemDownward(item: IStorageItem, position: number): IStorageItem {
    // Validate position (should be between 1 and 4 since we can't move message5 down)
    if (position < 1 || position > 4) {
        throw new Error("Position must be between 1 and 4");
    }

    const newItem = { ...item }; // Create a shallow copy of the item
    const history = { ...newItem.history }; // Create a copy of history

    // Convert position to property keys
    const currentKey = `message${position}` as keyof typeof history;
    const belowKey = `message${position + 1}` as keyof typeof history;

    // Swap the messages
    const temp = history[belowKey];
    history[belowKey] = history[currentKey];
    history[currentKey] = temp;

    // Update the history in the new item
    newItem.history = history;

    return newItem;
}

export { moveHistoryItemDownward }
