const { redisClient } = require('./Redis');

// รายการ token ที่ยังไม่ถูกใช้งาน (stored in Redis)
const makedAdd = async function makedAdd(_result) {
    await redisClient.sAdd('makedTokens', _result);
    return _result;
};

// ถ้ามี token ที่ยังไม่ถูกใช้งานจะ return true
const makedHas = async function makedHas(_result) {
    return await redisClient.sIsMember('makedTokens', _result);
};

// รายการ token ที่ถูกใช้งานแล้ว (stored in Redis)
const usedAdd = async function usedAdd(_result) {
    // When a token is used, move it from makedTokens to usedTokens
    await redisClient.multi()
        .sRem('makedTokens', _result)
        .sAdd('usedTokens', _result)
        .exec();
    return _result;
};

// ถ้ามี token ที่ถูกใช้งานแล้วจะ return true
const usedHas = async function usedHas(_result) {
    return await redisClient.sIsMember('usedTokens', _result);
};

// ฟังก์ชันสำหรับดึงรายการ token ทั้งหมดที่ยังไม่ถูกใช้งาน
const getAllMakedTokens = async function() {
    return await redisClient.sMembers('makedTokens');
};

// ฟังก์ชันสำหรับดึงรายการ token ทั้งหมดที่ถูกใช้งานแล้ว
const getAllUsedTokens = async function() {
    return await redisClient.sMembers('usedTokens');
};

module.exports = {
    makedAdd,
    makedHas,
    usedAdd,
    usedHas,
    getAllMakedTokens,
    getAllUsedTokens
};