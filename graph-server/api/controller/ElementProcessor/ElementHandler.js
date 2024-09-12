// Abstract class for Element Handlers
class ElementHandler {
  constructor(processor) {
    this.processor = processor;
    this.processor.insideColumn = [];
    this.processor.toggleList = [];
    this.processor.insideColumnToggle = [];
    this.processor.columnListTrack = [];
    this.processor.numberedList = [];
  }

  handle(child, parentId) {
    throw new Error('Method handle() must be implemented');
  }
}

export {ElementHandler}