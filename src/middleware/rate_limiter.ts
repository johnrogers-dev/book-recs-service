import { Request, Response, NextFunction } from 'express';
import Logger from '../utils/logger';
import ClientRateLimitSetting, { IClientRateLimitSetting } from '../models/ClientRateLimitSetting';
const logger = Logger('RateLimiter Middlware');

enum RateLimitTypes {
    APPLICATION = 0,
    USER
};

interface UserTokenBucket {
    timestamp: number,
    tokens: number,
    first_window_request: number
};

// these two parameters control the system-wide user rate limit: 10 requests per second, across all users
const DEFAULT_USER_TOKEN_QUANTITY = 3; // 10 requests allowed per window time
const WINDOW_SIZE_MILLISECONDS = 10000; // window size is every second

const DEFAULT_SYSTEM_TOKEN_QUANTITY = 500;
const DEFAULT_SYSTEM_WINDOWN_SIZE_MS = 1000;

// a system wide lookup table to throttle all incoming requests to a set limit, defined above
let SystemBucketTokenMap: UserTokenBucket = {
    timestamp: Date.now(),
    tokens: DEFAULT_SYSTEM_TOKEN_QUANTITY,
    first_window_request: Date.now() + DEFAULT_SYSTEM_WINDOWN_SIZE_MS
}

// this in-memory lookup table stores user token buckets that are manipulated based on the system-wide rate limiting configuration above. should be replaced by Redis server
let SystemUserTokenBucketMap: { [key: string]: UserTokenBucket } = {};
// this in-memory lookup table stores user token buckets that are manipulated based on each user's unique rate limiting configuration. should be replaced by Redis server
let PerUserTokenBucketMap: { [key: string]: UserTokenBucket } = {};

const RateLimitBucketMaps = {
    APPLICATION: SystemUserTokenBucketMap,
    USER: PerUserTokenBucketMap
}

export function system_limit(req: Request, res: Response, next: NextFunction) {
    try {
        const currentTime = Date.now();
        if (!SystemBucketTokenMap) {
            SystemBucketTokenMap = { timestamp: currentTime, tokens: DEFAULT_SYSTEM_TOKEN_QUANTITY, first_window_request: currentTime };
            res.set({
                'X-RateLimit-Limit': DEFAULT_SYSTEM_TOKEN_QUANTITY,
                'X-RateLimit-Remaining': DEFAULT_SYSTEM_TOKEN_QUANTITY,
                'X-RateLimit-Reset': currentTime + DEFAULT_SYSTEM_WINDOWN_SIZE_MS
            });
            next();
        }
        else {
            if (SystemBucketTokenMap.timestamp + DEFAULT_SYSTEM_WINDOWN_SIZE_MS < currentTime) { // if the window has elapsed since the last time user made a request, update the timestamp and reset the token quantity
                SystemBucketTokenMap = { timestamp: currentTime, tokens: DEFAULT_SYSTEM_TOKEN_QUANTITY, first_window_request: currentTime };
                res.set({
                    'X-RateLimit-Limit': DEFAULT_SYSTEM_TOKEN_QUANTITY,
                    'X-RateLimit-Remaining': DEFAULT_SYSTEM_TOKEN_QUANTITY,
                    'X-RateLimit-Reset': currentTime + DEFAULT_SYSTEM_WINDOWN_SIZE_MS
                });
                next();
            }
            else { // the user is still within the rate limit window
                let remaining_tokens = SystemBucketTokenMap.tokens;
                if (remaining_tokens === 0) res.status(429).json({ error: `You have exceeded your rate limit.` });
                else {
                    let updated_remaining_tokens = remaining_tokens--;
                    SystemBucketTokenMap = { timestamp: currentTime, tokens: updated_remaining_tokens, first_window_request: SystemBucketTokenMap.first_window_request };
                    res.set({
                        'X-RateLimit-Limit': DEFAULT_SYSTEM_TOKEN_QUANTITY,
                        'X-RateLimit-Remaining': updated_remaining_tokens,
                        'X-RateLimit-Reset': SystemBucketTokenMap.first_window_request + DEFAULT_SYSTEM_WINDOWN_SIZE_MS
                    });
                    next();
                }
            }
        }
    }
    catch (err) {
        logger.error(`RateLimiter Caught unhandled error: ${err}`)
        res.status(500).json({ error: `Internal Server Error` })
    }
}

// implements a system-wide user-token-based middleware for rate limiting
export function all_user_limit(req: Request, res: Response, next: NextFunction) {
    try {
        rate_limit(req, res, next, RateLimitTypes.APPLICATION, DEFAULT_USER_TOKEN_QUANTITY, WINDOW_SIZE_MILLISECONDS);
    }
    catch (err) {
        logger.error(`RateLimiter Caught unhandled error: ${err}`)
        res.status(500).json({ error: `Internal Server Error` })
    }
};

// this rate limiter checks a DB record for each user to get rate limiting configuration. 
export async function per_user_limit(req: Request, res: Response, next: NextFunction) {
    try {
        let clientId: string = req["currentClient"].client_id;
        //console.log(clientId)
        let userRateLimitSetting: IClientRateLimitSetting = await ClientRateLimitSetting.findOne({ clientId });
        rate_limit(req, res, next, RateLimitTypes.USER, userRateLimitSetting.token_quantity, userRateLimitSetting.window_size_ms)
    }
    catch (err) {
        logger.error(`RateLimiter Caught unhandled error: ${err}`)
        res.status(500).json({ error: `Internal Server Error` })
    }
};

function rate_limit(req: Request, res: Response, next: NextFunction, type: RateLimitTypes, rate_limit_token_quantity: number, rate_limit_window_ms: number) {
    let bucket_map = RateLimitBucketMaps[RateLimitTypes[type]]
    //console.log(req)
    let userId: string = req["currentClient"]._id;
    let user_map_record = bucket_map[userId];
    const currentTime = Date.now();
    if (!user_map_record) {
        bucket_map[userId] = { timestamp: currentTime, tokens: rate_limit_token_quantity, first_window_request: currentTime };
        res.set({
            'X-RateLimit-Limit': rate_limit_token_quantity,
            'X-RateLimit-Remaining': rate_limit_token_quantity,
            'X-RateLimit-Reset': currentTime + rate_limit_window_ms
        });
        next();
    }
    else {
        if (user_map_record.timestamp + rate_limit_window_ms < currentTime) { // if the window has elapsed since the last time user made a request, update the timestamp and reset the token quantity
            bucket_map[userId] = { timestamp: currentTime, tokens: rate_limit_token_quantity, first_window_request: currentTime };
            res.set({
                'X-RateLimit-Limit': rate_limit_token_quantity,
                'X-RateLimit-Remaining': rate_limit_token_quantity,
                'X-RateLimit-Reset': currentTime + rate_limit_window_ms
            });
            next();
        }
        else { // the user is still within the rate limit window
            let remaining_tokens = user_map_record.tokens;
            if (remaining_tokens === 0) {
                res.set({
                    'X-RateLimit-Limit': rate_limit_token_quantity,
                    'X-RateLimit-Remaining': 0,
                    'X-RateLimit-Reset': user_map_record.first_window_request + rate_limit_window_ms
                });
                res.status(429).json({ error: `You have exceeded your ${RateLimitTypes[type]} rate limit. Please wait until ${user_map_record.first_window_request + rate_limit_window_ms} to make another request.` });
            }
            else {
                let updated_remaining_tokens = remaining_tokens - 1;
                bucket_map[userId] = { timestamp: currentTime, tokens: updated_remaining_tokens, first_window_request: user_map_record.first_window_request };
                res.set({
                    'X-RateLimit-Limit': rate_limit_token_quantity,
                    'X-RateLimit-Remaining': updated_remaining_tokens,
                    'X-RateLimit-Reset': user_map_record.first_window_request + rate_limit_window_ms
                });
                next();
            }
        }
    }
}