import { ElementHandler } from "./ElementHandler.js";

export class NumberedListHandler extends ElementHandler {
    handle(child, parentId) {
        if (child.has_children) {
            this.processor.numberedList.push({
                father: child.parent[child.parent.type],
                numberedColumn: child.id,
            });
        }
    }
}