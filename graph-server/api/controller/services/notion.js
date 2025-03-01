import logger from "../../logs/index.js";
import { RedisController } from "../RedisController/index.js";

class NotionAPI {
  constructor(apiUrl=process.env.API_URL, apiKey, userNotion=null) {
    this.apiUrl = apiUrl || process.env.API_URL;
    this.apiKey = apiKey;
    this.count=0;
    this.limitNotionRefresh=parseInt(process.env.LIMIT_NOTION_REFRESH)||30
    this.isVip=false;
    this.redis = new RedisController();
    this.userNotion=userNotion;
  }

  async setRateLimit(){
    const resp = await this.redis.getKey(`notion-${this.userNotion}`)
    this.isVip = !!resp
  }

  getIsVip() {
    return this.isVip;
  }

  async fetchBlockChildren(blockId, nextCursor = null, children = true) {
    try {
      const url = `${this.apiUrl}/blocks/${blockId}/${children ? "children?page_size=100" : "?"}${nextCursor ? `&start_cursor=${nextCursor}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch children for block ${blockId}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      logger.error("Error to access Notion API", error)
      throw new Error(`Error accessing the Notion API: ${error.message}`);
    }
  }

  async fetchSearch(query){
    try {
      let options = {
        method: 'POST',
        headers: {
            ...this.getHeaders(),
        },
        body: `{"query":"${query}","filter":{"value":"page","property":"object"}}`
      };
      const res = await fetch(`${this.apiUrl}/search`, options)
      const data = await res.json()
      return data;
    } catch (error) {
      console.error(error);
      throw new Error("Error to find pages in query")
    }
  }

  async createPage(parentId, title, children = []) {
    try {
      const url = `${this.apiUrl}/pages`;
      const body = {
        parent: { page_id: parentId },
        properties: {
          title: [
            {
              type: 'text',
              text: {
                content: title
              }
            }
          ]
        },
        children: children
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Failed to create Notion page: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error creating page in Notion API:', error);
      console.log(error)
      throw new Error(`Error creating page: ${error.message}`);
    }
  }

  async updatePage(pageId, properties = {}) {
    try {
      const url = `${this.apiUrl}/pages/${pageId}`;
      const body = {
        properties
      };

      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Failed to update page ${pageId}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error updating page in Notion API:', error);
      throw new Error(`Error updating page: ${error.message}`);
    }
  }

  getHeaders() {
    return {
      'Authorization': `${this.apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    };
  }

  async fetchDatabase(databaseId) {
  try {
    const url = `${this.apiUrl}/databases/${databaseId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch database ${databaseId}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching database:', error);
    throw new Error(`Error fetching database: ${error.message}`);
  }
}
}

export {NotionAPI}