const qs = require('qs');
const axios = require('axios');

// https://console.cloud.google.com/apis/credentials?project=direct-album-301008

const googleOAuth = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REDIRECT_URI: 'http://localhost:3000/user/google/callback',
}

const getGoogleUserInfo = async function getGoogleUserInfo(_accessToken) {
    try {
        const { data } = await axios({
            url: 'https://www.googleapis.com/oauth2/v2/userinfo',
            method: 'get',
            headers: {
                Authorization: `Bearer ${_accessToken}`,
            },
        });
        
        return data;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error; // ส่งข้อผิดพลาดต่อไปเพื่อให้ผู้ใช้หรือโปรแกรมที่เรียกใช้รับรู้
    }
}

const getAccessToken = async function getAccessToken(_code) {
    try {
        // กำหนดพารามิเตอร์สำหรับการขอรับโทเค็นการเข้าสู่ระบบแบบอนุญาต
        const tokenParams = {
            code: _code,
            client_id: googleOAuth.CLIENT_ID,
            client_secret: googleOAuth.CLIENT_SECRET,
            redirect_uri: googleOAuth.REDIRECT_URI,
            grant_type: 'authorization_code'
        };

        // สร้าง URL ของ Google OAuth 2.0 API สำหรับการขอรับโทเค็นการเข้าสู่ระบบแบบอนุญาต
        const tokenUrl = 'https://oauth2.googleapis.com/token';

        // ส่งคำขอ POST ไปยัง URL ของ Google OAuth 2.0 API
        const response = await axios.post(tokenUrl, qs.stringify(tokenParams));

        return {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
        };
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error; // ส่งข้อผิดพลาดต่อไปเพื่อให้ผู้ใช้หรือโปรแกรมที่เรียกใช้รับรู้
    }
}

const refreshAccessToken = async function refreshAccessToken(refreshToken) {
    try {
        // กำหนดพารามิเตอร์สำหรับการขอรับ accessToken ด้วย refreshToken
        const tokenParams = {
            refresh_token: refreshToken,
            client_id: googleOAuth.CLIENT_ID,
            client_secret: googleOAuth.CLIENT_SECRET,
            grant_type: 'refresh_token'
        };

        // สร้าง URL ของ OAuth 2.0 API สำหรับการขอรับ accessToken ด้วย refreshToken
        const tokenUrl = 'https://oauth2.googleapis.com/token';

        // ทำการขอรับ accessToken ใหม่จาก OAuth 2.0 API โดยใช้ refreshToken
        const response = await axios.post(tokenUrl, qs.stringify(tokenParams));

        // ดึง accessToken ใหม่จากข้อมูลการตอบกลับ
        const newAccessToken = response.data.access_token;

        return newAccessToken;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error; // ส่งข้อผิดพลาดต่อไปเพื่อให้ผู้ใช้หรือโปรแกรมที่เรียกใช้รับรู้
    }
}

module.exports = { googleOAuth, getGoogleUserInfo, getAccessToken, refreshAccessToken };