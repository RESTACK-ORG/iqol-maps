const express = require('express');
const { Storage } = require('@google-cloud/storage');
const NodeCache = require('node-cache');
const fs = require('fs-extra');
const path = require('path');
const router = express.Router();

const storage = new Storage();
const BUCKET_NAME = 'restack_maps_bucket';

// Cache Configuration
const CACHE_DIR = path.join(__dirname, '../tile_cache');
const MEMORY_CACHE_TTL = 3600; // 1 hour in seconds
const MEMORY_CACHE_MAX_KEYS = 5000; // Max tiles in memory
const DISK_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Initialize memory cache
const memoryCache = new NodeCache({ 
    stdTTL: MEMORY_CACHE_TTL, 
    maxKeys: MEMORY_CACHE_MAX_KEYS,
    useClones: false // Better performance for binary data
});

// Ensure cache directory exists
fs.ensureDirSync(CACHE_DIR);

// Helper function to generate cache file path
function getCacheFilePath(area, z, x, y) {
    const subDir = path.join(CACHE_DIR, area, z.toString());
    fs.ensureDirSync(subDir);
    return path.join(subDir, `${x}_${y}.png`);
}

// Helper function to check if disk cache is valid
async function isDiskCacheValid(filePath) {
    try {
        const stats = await fs.stat(filePath);
        const age = Date.now() - stats.mtime.getTime();
        return age < DISK_CACHE_TTL;
    } catch {
        return false;
    }
}

// Main tile serving route with multi-layer caching
router.get('/tiles/:area/:z/:x/:y', async (req, res) => {
    const { area, z, x, y } = req.params;
    const cacheKey = `${area}_${z}_${x}_${y}`;
    
    console.log(`[DEBUG] Checking cache for: ${cacheKey}`);
    
    // Check memory cache
    const memoryCachedTile = memoryCache.get(cacheKey);
    if (memoryCachedTile) {
        console.log(`[MEMORY HIT] ${cacheKey} - Cache working!`);
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('X-Cache', 'MEMORY-HIT');
        return res.send(memoryCachedTile);
    }
    
    console.log(`[MEMORY MISS] ${cacheKey} - Fetching from GCS`);
    
    // Fetch from GCS and cache
    const gcsFilePath = `raster_tiles/${area}/${z}/${x}/${y}.png`;
    const file = storage.bucket(BUCKET_NAME).file(gcsFilePath);
    
    try {
        const [exists] = await file.exists();
        if (!exists) {
            console.log(`[404] Missing tile: ${gcsFilePath}`);
            return res.status(404).send('Tile not found');
        }
        
        const [buffer] = await file.download();
        
        // Store in cache
        console.log(`[CACHE STORE] Storing ${cacheKey} in memory`);
        memoryCache.set(cacheKey, buffer);
        
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('X-Cache', 'GCS-MISS');
        res.send(buffer);
        
    } catch (err) {
        console.error(`[ERROR] ${cacheKey}:`, err.message);
        res.status(500).send('Error serving tile');
    }
});

// Cache statistics endpoint (for monitoring)
router.get('/cache/stats', (req, res) => {
    const stats = memoryCache.getStats();
    const diskCacheSize = getDiskCacheSize();
    
    res.json({
        memory: {
            keys: stats.keys,
            hits: stats.hits,
            misses: stats.misses,
            hitRate: stats.hits / (stats.hits + stats.misses) || 0
        },
        disk: {
            sizeGB: diskCacheSize
        }
    });
});

// Helper function to calculate disk cache size
function getDiskCacheSize() {
    try {
        const { execSync } = require('child_process');
        const size = execSync(`du -s ${CACHE_DIR}`).toString().split('\t')[0];
        return (parseInt(size) / 1024 / 1024).toFixed(2); // Convert to GB
    } catch {
        return 'unknown';
    }
}

// Cache cleanup endpoint
router.delete('/cache/clear', async (req, res) => {
    try {
        // Clear memory cache
        memoryCache.flushAll();
        
        // Clear disk cache
        await fs.emptyDir(CACHE_DIR);
        
        res.json({ message: 'Cache cleared successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
