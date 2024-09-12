import { ElementHandler } from "./ElementHandler.js";

export class ChildPageHandler extends ElementHandler {
  handle(child, parentId) {
    const childId = child.id;
    this.processor.addPage(childId, child.child_page.title);
    this.processor.addNode(parentId, childId);


    const insideColumn = this.processor.insideColumn.find(item => item.idColumn === parentId);
    const insideToggle = this.processor.toggleList.find(item => item.idToggle === parentId);
    const insideColumnToggle = this.processor.insideColumnToggle.find(item => item.idColumn === parentId);
    const insideNumberedList = this.processor.numberedList.find(item => item.numberedColumn === parentId)

    if (insideColumnToggle) {
      this.processor.addNode(insideColumnToggle.father, childId);
    }
    if(insideNumberedList){
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
