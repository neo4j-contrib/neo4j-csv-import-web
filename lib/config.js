module.exports = {
    redis_url: process.env.REDISCLOUD_URL || "",
    redis_ttl: 3600,
    session_secret: process.env.SESSION_SECRET || 'ljalsjdflj824aflj#$lkajd',
    csv_file_protocol: process.env.CSV_FILE_PROTOCOL || 'http://'
};