import { convertToUid } from "../../utils/index.js";
import { ElementHandler } from "./ElementHandler.js";

export class ChildPageHandler extends ElementHandler {
  constructor(processor, socketMode) {
    super(processor);
    this.socketMode = socketMode;
  }

  handle(child, parentId) {
    const childId = child.id;

    this.processor.addPage(this.socketMode ? convertToUid(childId) : childId, child.child_page.title);
    this.processor.addNode(this.socketMode ? convertToUid(parentId) : parentId, this.socketMode ? convertToUid(childId) : childId);

    const insideColumn = this.processor.insideColumn.find(item => item.idColumn === parentId);
    const insideToggle = this.processor.toggleList.find(item => item.idToggle === parentId);
    const insideColumnToggle = this.processor.insideColumnToggle.find(item => item.idColumn === parentId);
    const insideNumberedList = this.processor.numberedList.find(item => item.numberedColumn === parentId)

    if (insideColumnToggle) {
      this.processor.addNode(insideColumnToggle.father, childId);
    }
    if (insideNumberedList) {
      this.processor.addNode(insideNumberedList.father, childId);
    }
    if (insideColumn) {
      this.processor.addNode(insideColumn.father, childId);
    }
    if (insideToggle) {
      this.processor.addNode(insideToggle.father, childId);
    }
  }
}
