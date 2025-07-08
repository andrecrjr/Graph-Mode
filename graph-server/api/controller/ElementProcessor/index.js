import { ChildPageHandler } from "./ChildPageHandler.js";
import { ColumnHandler, ColumnListHandler } from "./ColumnHandler.js";
import { HeadingHandler } from "./HeadingHandler.js";
import { MentionHandler } from "./MentionHandler.js";
import { NumberedListHandler } from "./NumberedList.js";
import { PageHandler } from "./PageHandler.js";
import { ParagraphHandler } from "./ParagraphHandler.js";
import { ToggleHandler } from "./ToggleHandler.js";
import { convertToUid } from "../../utils/index.js";

class ElementProcessor {
  constructor(notionApi, socketMode = false) {
    this.elements = [];
    this.handlers = {};
    this.notionApi = notionApi;
    this.socketMode = socketMode;
    this.firstParent = true;

    this.initializeHandlers();
  }

  /**
   * Initialize all element handlers
   */
  initializeHandlers() {
    const handlerMappings = [
      ['column_list', new ColumnListHandler(this)],
      ['column', new ColumnHandler(this)],
      ['toggle', new ToggleHandler(this)],
      ['paragraph', new ParagraphHandler(this)],
      ['child_page', new ChildPageHandler(this, this.socketMode)],
      ['numbered_list_item', new NumberedListHandler(this)],
      ['mention', new MentionHandler(this)],
      ['page', new PageHandler(this)],
      ['heading_1', new HeadingHandler(this)],
      ['heading_2', new HeadingHandler(this)],
      ['heading_3', new HeadingHandler(this)]
    ];

    handlerMappings.forEach(([type, handler]) => {
      this.registerHandler(type, handler);
    });
  }

  registerHandler(type, handler) {
    this.handlers[type] = handler;
  }

  processChild(child, parentId) {
    const handler = this.handlers[child.type];
    if (handler) {
      try {
        handler.handle(child, parentId);
      } catch (error) {
        console.error(`Error processing child of type ${child.type}:`, error);
      }
    }
    return child.has_children ? child.id : null;
  }

  processParent(child) {
    // Convert the parent ID based on socket mode
    const convertedParentId = this.convertId(child.id);

    // First, always add the parent as a page (this creates the root node in the graph)
    const title = this.extractTitleUsingHandler(child);
    this.addPage(convertedParentId, title);

    // Then, if it's a block that might contain mentions or other linkable content,
    // process it through the handlers to extract those relationships
    if (this.hasLinkableContent(child)) {
      this.processChild(child, convertedParentId);
    }
  }

  /**
   * Extract title using the appropriate handler
   */
  extractTitleUsingHandler(block) {
    // Try to get the specific handler for this block type
    const handler = this.handlers[block.type] || this.handlers[block.object];

    if (handler && typeof handler.extractTitle === 'function') {
      return handler.extractTitle(block);
    }

    // Fallback to default title extraction
    return block.type ? `${block.type.replace('_', ' ')}` : 'Untitled';
  }

  /**
   * Convert ID based on socket mode (for ElementProcessor level)
   */
  convertId(id) {
    return this.socketMode ? convertToUid(id) : id;
  }

  /**
   * Check if a block might contain linkable content (mentions, child pages, etc.)
   */
  hasLinkableContent(block) {
    // Paragraphs can contain mentions in their rich_text
    if (block.type === 'paragraph') return true;

    // Other block types that might have children or references
    if (block.type === 'toggle') return true;
    if (block.type === 'numbered_list_item') return true;
    if (block.type === 'bulleted_list_item') return true;
    if (block.type === 'column_list') return true;

    // Already page-like blocks don't need additional processing
    return false;
  }

  addPage(id, label) {
    if (!id) return;

    const isFirstParent = !this.elements.some(e => e.type === 'page');
    const pageExists = this.elements.some(e => e.id === id && e.type === 'page');

    if (!pageExists) {
      this.elements.push({
        id,
        label: label || 'Untitled',
        type: 'page',
        firstParent: isFirstParent
      });
      this.firstParent = false;
    }
  }

  addNode(source, target) {
    if (source && target) {
      this.elements.push({ source, target, type: 'node' });
    }
  }

  getElements() {
    return this.elements;
  }

  /**
   * Get handler statistics for debugging
   */
  getHandlerStats() {
    return {
      registeredHandlers: Object.keys(this.handlers),
      totalElements: this.elements.length,
      pages: this.elements.filter(e => e.type === 'page').length,
      nodes: this.elements.filter(e => e.type === 'node').length
    };
  }
}

export default ElementProcessor