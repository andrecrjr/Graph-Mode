import { RedisController } from '../controller/RedisController/index.js';
import dotenv from 'dotenv';
import { ACCOUNT_TIERS } from '../middleware/vipMiddleware.js';

// Load environment variables
dotenv.config();

// Initialize Redis
const redis = new RedisController();

// Test users to create
const TEST_USERS = [
    {
        email: 'free@example.com',
        // No special flags for free user
    },
    {
        email: 'premium@example.com',
        subscriptionId: 'test_premium_subscription',
        cancelAtPeriodEnd: false, // Active subscription
        lastPaymentDate: Date.now() - 86400000, // 1 day ago
    },
    {
        email: 'lifetime@example.com',
        lifetimePaymentId: 'test_lifetime_payment',
        lastPaymentDate: Date.now() - 86400000, // 1 day ago
    }
];

async function seedTestUsers() {
    try {
        console.log('Starting to seed test users...');

        // Create test users in Redis
        for (const user of TEST_USERS) {
            const key = `notion-${user.email}`;

            // Check if user already exists
            const existingUser = await redis.getKey(key);
            if (existingUser) {
                console.log(`User ${user.email} already exists. Updating...`);
            }

            // Set user data
            await redis.setKey(key, user);
            console.log(`Created test user: ${user.email}`);
        }

        // Print summary
        console.log('Test users successfully created:');
        for (const user of TEST_USERS) {
            const key = `notion-${user.email}`;
            const userData = await redis.getKey(key);
            let tier = 'free';

            if (userData.lifetimePaymentId) {
                tier = ACCOUNT_TIERS.LIFETIME;
            } else if (userData.subscriptionId && !userData.cancelAtPeriodEnd) {
                tier = ACCOUNT_TIERS.PREMIUM;
            }

            console.log(`- ${user.email}: ${tier}`);
        }

        console.log('\nTo test, use these emails as the ?user= parameter in your API requests');

    } catch (error) {
        console.error('Error seeding test users:', error);
    } finally {
        // Close Redis connection
        redis.disconnect();
    }
}

// Run script
seedTestUsers(); 