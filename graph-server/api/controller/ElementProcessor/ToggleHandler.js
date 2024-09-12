import { ElementHandler } from "./ElementHandler.js";

export class ToggleHandler extends ElementHandler {
  handle(child) {
    const isInsideColumn = this.processor.insideColumn.find(item => item.idColumn === child.parent[child.parent.type]);
    if (isInsideColumn) {
      this.processor.insideColumnToggle.push({ ...isInsideColumn, idColumn: child.id });
    } else {
      this.processor.toggleList.push({
        father: child.parent[child.parent.type],
        idToggle: child.id,
      });
    }
  }
}

