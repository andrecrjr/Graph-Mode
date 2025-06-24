import { convertToUid } from "../../utils/index.js";

// Abstract class for Element Handlers
class ElementHandler {
  constructor(processor) {
    this.processor = processor;
    this.initializeProcessorState();
  }

  /**
   * Initialize processor state arrays if they don't exist
   * This prevents redundant initialization across handlers
   */
  initializeProcessorState() {
    const stateArrays = [
      'insideColumn',
      'toggleList',
      'insideColumnToggle',
      'columnListTrack',
      'numberedList'
    ];

    stateArrays.forEach(arrayName => {
      if (!this.processor[arrayName]) {
        this.processor[arrayName] = [];
      }
    });
  }

  /**
   * Helper method to find items in processor state arrays
   */
  findInProcessorState(arrayName, predicate) {
    return this.processor[arrayName]?.find(predicate);
  }

  /**
   * Convert ID based on socket mode
   */
  convertId(id) {
    return this.processor.socketMode ? convertToUid(id) : id;
  }

  /**
   * Extract title from a block - default implementation
   * Can be overridden by specific handlers
   */
  extractTitle(block) {
    return block.type ? `${block.type.replace('_', ' ')}` : 'Untitled';
  }

  /**
   * Abstract method that must be implemented by subclasses
   */
  handle(child, parentId) {
    throw new Error('Method handle() must be implemented');
  }
}

export { ElementHandler }