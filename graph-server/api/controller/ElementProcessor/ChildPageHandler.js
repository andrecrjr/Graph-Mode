import { convertToUid } from "../../utils/index.js";
import { ElementHandler } from "./ElementHandler.js";

export class ChildPageHandler extends ElementHandler {
  constructor(processor, socketMode) {
    super(processor);
    this.socketMode = socketMode;
  }



  /**
   * Extract title from child_page block
   */
  extractTitle(block) {
    if (block.type === 'child_page' && block.child_page) {
      return block.child_page.title || 'Untitled';
    }
    return super.extractTitle(block);
  }

  /**
   * Find parent context for the child page
   */
  findParentContext(parentId) {
    return {
      insideColumn: this.findInProcessorState('insideColumn', item => item.idColumn === parentId),
      insideToggle: this.findInProcessorState('toggleList', item => item.idToggle === parentId),
      insideColumnToggle: this.findInProcessorState('insideColumnToggle', item => item.idColumn === parentId),
      insideNumberedList: this.findInProcessorState('numberedList', item => item.numberedColumn === parentId)
    };
  }

  /**
   * Add nodes based on parent context
   */
  addContextualNodes(childId, parentContext) {
    const { insideColumnToggle, insideNumberedList, insideColumn, insideToggle } = parentContext;

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

  handle(child, parentId) {
    const childId = this.convertId(child.id);
    const convertedParentId = this.convertId(parentId);

    // Add page and primary node
    this.processor.addPage(childId, child.child_page.title);
    this.processor.addNode(convertedParentId, childId);

    // Handle contextual parent relationships
    const parentContext = this.findParentContext(parentId);
    this.addContextualNodes(childId, parentContext);
  }
}
