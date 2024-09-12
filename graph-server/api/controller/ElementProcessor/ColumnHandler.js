import { ElementHandler } from "./ElementHandler.js";

class ColumnListHandler extends ElementHandler {
  handle(child) {
    if (child.has_children) {
      this.processor.columnListTrack.push({
        father: child.parent[child.parent.type],
        columnList: child.id,
      });
    }
  }
}
class ColumnHandler extends ElementHandler {
  handle(child) {
    const columnList = this.processor.columnListTrack.find(item => item.columnList === child.parent?.block_id);
    if (columnList) {
      this.processor.insideColumn.push({ ...columnList, idColumn: child.id });
    }
  }
}



export {ColumnHandler, ColumnListHandler}
