import logger from "../../logs/index.js";
import { RedisController } from "../RedisController/index.js";
import { getUserTier, ACCOUNT_TIERS } from "../../middleware/vipMiddleware.js";

class NotionAPI {
  constructor(apiUrl = process.env.API_URL, apiKey, userNotion = null) {
    this.apiUrl = apiUrl || process.env.API_URL;
    this.apiKey = apiKey;
    this.count = 0;
    this.limitNotionRefresh = parseInt(process.env.LIMIT_NOTION_REFRESH) || 30;
    this.isVip = false;
    this.userTier = ACCOUNT_TIERS.FREE;
    this.redis = new RedisController();
    this.userNotion = userNotion;
    this.cacheEnabled = true;
    this.cacheTTL = {
      [ACCOUNT_TIERS.FREE]: 0,
      [ACCOUNT_TIERS.PREMIUM]: 60,
      [ACCOUNT_TIERS.LIFETIME]: 800
    };
  }

  async setRateLimit() {
    try {
      const userData = await this.redis.getKey(`notion-${this.userNotion}`);
      this.userTier = getUserTier(userData);
      this.isVip = this.userTier !== ACCOUNT_TIERS.FREE;

      // Adjust cache settings based on tier
      this.cacheEnabled = this.userTier !== ACCOUNT_TIERS.FREE;

      logger.debug(`User ${this.userNotion} set as tier: ${this.userTier}, VIP: ${this.isVip}`);
    } catch (error) {
      logger.error(`Error setting rate limit for user ${this.userNotion}:`, error);
      // Default to free tier on error
      this.isVip = false;
      this.userTier = ACCOUNT_TIERS.FREE;
    }
  }

  getIsVip() {
    return this.isVip;
  }

  getUserTier() {
    return this.userTier;
  }

  async fetchBlockChildren(blockId, nextCursor = null, children = true, cache = true) {
    if (!blockId) {
      throw new Error('Block ID is required');
    }

    try {
      // Build URL with proper query parameter formatting
      let url = `${this.apiUrl}/blocks/${blockId}`;

      if (children) {
        url += '/children';

        // Build query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('page_size', '100');

        if (nextCursor) {
          queryParams.append('start_cursor', nextCursor);
        }

        // Append query string if there are parameters
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }

      // Check cache first if Redis is available and caching is enabled for this tier
      const cacheKey = `block_${blockId}_${nextCursor || 'initial'}_${children}`;
      let cachedData = null;

      if (this.cacheEnabled && cache) {
        cachedData = await this.redis?.getKey(cacheKey);
      }

      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // Make the request to Notion API
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch children for block ${blockId}: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();

      // Cache the response for future requests with TTL based on user tier
      if (this.redis && this.cacheEnabled) {
        const ttl = this.cacheTTL[this.userTier];
        if (ttl > 0) {
          await this.redis.setKey(cacheKey, JSON.stringify(data), ttl);
        }
      }

      return data;
    } catch (error) {
      logger.error(`Error fetching block children for ${blockId}`, {
        blockId,
        children,
        nextCursor,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Error accessing the Notion API: ${error.message}`);
    }
  }

  async fetchSearch(query) {
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

export { NotionAPI }