# Notion Webhook Integration Setup

This guide explains how to set up Notion webhook integration to receive real-time updates and automatically update your graph visualization.

## Overview

The webhook integration allows your Graph Mode application to:
- Receive real-time notifications when Notion pages are updated
- Automatically refresh cached data
- Update the live graph visualization via Socket.IO
- Handle various Notion events (page updates, creation, deletion, etc.)

## Webhook Endpoint

**URL:** `https://your-domain.com/api/notion-hook`  
**Method:** `POST`

## Setup Steps

### 1. Configure Environment Variables

Add these environment variables to your `.env` file:

```env
# Required for webhook signature validation
NOTION_WEBHOOK_SECRET=your_verification_token_here

# Required for fetching updated data
NOTION_API_KEY=Bearer secret_your_notion_api_key
API_URL=https://api.notion.com/v1

# Required for cache management
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

### 2. Create Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Fill in the integration details
4. Note down your Integration Token (this becomes your `NOTION_API_KEY`)

### 3. Set Up Webhook Subscription

1. In your Notion integration settings, go to the **Webhooks** tab
2. Click **+ Create a subscription**
3. Enter your webhook URL: `https://your-domain.com/api/notion-hook`
4. Select the event types you want to subscribe to:
   - `page.content_updated`
   - `page.created`
   - `page.deleted`
   - `database.schema_updated`
   - `comment.created` (optional)

### 4. Verify Webhook

When you create the subscription, Notion will send a verification request:

```json
{
  "verification_token": "secret_tMrlL1qK5vuQAh1b6cZGhFChZTSYJlce98V0pYn7yBl"
}
```

Your webhook endpoint will:
1. Receive and store this token
2. Return a success response
3. Use this token for future signature validation

### 5. Complete Verification

1. Check your webhook endpoint logs for the verification token
2. Go back to the Notion integration UI
3. Click **⚠️ Verify** 
4. Paste the verification token
5. Click **Verify subscription**

## Supported Events

### Page Content Updated (`page.content_updated`)
- **Trigger:** When page content is modified
- **Action:** Invalidates cache, fetches fresh data, broadcasts update via Socket.IO
- **Aggregated:** Yes (may have 1-2 minute delay)

### Page Created (`page.created`)
- **Trigger:** When a new page is created
- **Action:** Invalidates parent cache, broadcasts creation event

### Page Deleted (`page.deleted`)
- **Trigger:** When a page is deleted
- **Action:** Removes cache entries, broadcasts deletion event

### Database Schema Updated (`database.schema_updated`)
- **Trigger:** When database properties are modified
- **Action:** Invalidates database cache, broadcasts schema update

### Comment Created (`comment.created`)
- **Trigger:** When a comment is added
- **Action:** Broadcasts comment event (requires `comment read` capability)

## Security Features

### Signature Validation
All webhook payloads are validated using HMAC-SHA256:

```javascript
const calculatedSignature = `sha256=${createHmac("sha256", verificationToken)
    .update(payload)
    .digest("hex")}`;
```

### Error Handling
- Invalid signatures are rejected with 401 Unauthorized
- Malformed requests return 400 Bad Request
- Server errors return 500 Internal Server Error

## Frontend Integration

The frontend automatically receives webhook updates via Socket.IO:

```typescript
socket.on("notion_update", (data) => {
    switch (data.type) {
        case 'page_updated':
            // Refresh current page if it matches
            break;
        case 'page_created':
            // Refresh parent page
            break;
        case 'page_deleted':
            // Clear view or refresh parent
            break;
    }
});
```

## Cache Management

The webhook system manages Redis cache automatically:
- **Cache Invalidation:** Removes stale entries when content changes
- **Cache Updates:** Fetches and stores fresh data with appropriate TTL
- **Pattern Matching:** Handles various cache key patterns for comprehensive cleanup

## Testing Your Webhook

### Test 1: Update Page Content
1. Edit a page title in Notion
2. Wait 1-2 minutes (aggregated events have delay)
3. Check that your graph updates automatically

### Test 2: Create a New Page
1. Create a new page in Notion
2. Verify the parent page graph refreshes
3. Check webhook logs for `page.created` event

### Test 3: Add a Comment
1. Add a comment to any page
2. Verify `comment.created` event is received
3. Check console logs for webhook notification

## Troubleshooting

### Webhook Not Receiving Events
1. Check integration has access to the modified pages
2. Verify webhook subscription is **active**
3. Ensure capabilities match event types (e.g., `comment read` for comments)
4. Check server logs for errors

### Invalid Signature Errors
1. Verify `NOTION_WEBHOOK_SECRET` matches verification token
2. Check webhook URL is accessible and returns 200
3. Ensure payload is being read correctly

### Cache Not Updating
1. Verify Redis connection settings
2. Check `NOTION_API_KEY` is valid
3. Ensure integration has page access permissions

## Advanced Configuration

### Custom Event Handling
You can extend the webhook handler for custom business logic:

```javascript
async function handleCustomEvent(entity, redis, req) {
    // Your custom logic here
    await redis.setKey(`custom_${entity.id}`, customData);
    await broadcastUpdate('custom_event', customData, req);
}
```

### Rate Limiting
The system respects Notion API rate limits and user tiers:
- **Free:** No caching, limited requests
- **Premium:** 60-second cache TTL
- **Lifetime:** 800-second cache TTL

### Monitoring
Monitor webhook health by checking:
- `/api/notion-hook` endpoint response times
- Redis cache hit/miss ratios
- Socket.IO connection counts
- Webhook event processing errors

## Next Steps

1. Test the webhook with different types of Notion updates
2. Monitor the real-time graph updates in your application
3. Customize event handling for your specific use case
4. Set up monitoring and alerting for webhook failures 