const line = require('@line/bot-sdk');

class LineBot {
  constructor(config) {
    this.client = new line.Client({
      channelAccessToken: config.channelAccessToken,
      channelSecret: config.channelSecret
    });
    this.config = config;
  }

  /**
   * ส่งข้อความแบบ Text
   * @param {string} targetId - User ID, Group ID หรือ Room ID
   * @param {string} text - ข้อความที่ต้องการส่ง
   * @param {Array} quickReplyItems - ตัวเลือก Quick Reply (optional)
   * @returns {Promise}
   */
  sendTextMessage(targetId, text, quickReplyItems = []) {
    const message = {
      type: 'text',
      text: text
    };

    if (quickReplyItems.length > 0) {
      message.quickReply = {
        items: quickReplyItems.map(item => ({
          type: 'action',
          action: {
            type: 'message',
            label: item.label,
            text: item.text
          }
        }))
      };
    }

    return this.client.pushMessage(targetId, message);
  }

  /**
   * ส่งสติกเกอร์
   * @param {string} targetId - User ID, Group ID หรือ Room ID
   * @param {string} packageId - Package ID ของสติกเกอร์
   * @param {string} stickerId - Sticker ID ของสติกเกอร์
   * @returns {Promise}
   */
  sendSticker(targetId, packageId, stickerId) {
    return this.client.pushMessage(targetId, {
      type: 'sticker',
      packageId: packageId,
      stickerId: stickerId
    });
  }

  /**
   * ส่งรูปภาพ
   * @param {string} targetId - User ID, Group ID หรือ Room ID
   * @param {string} originalContentUrl - URL รูปภาพเต็มขนาด
   * @param {string} previewImageUrl - URL รูปภาพตัวอย่าง
   * @returns {Promise}
   */
  sendImage(targetId, originalContentUrl, previewImageUrl) {
    return this.client.pushMessage(targetId, {
      type: 'image',
      originalContentUrl: originalContentUrl,
      previewImageUrl: previewImageUrl
    });
  }

  /**
   * ส่ง Flex Message
   * @param {string} targetId - User ID, Group ID หรือ Room ID
   * @param {Object} flexContent - เนื้อหา Flex Message
   * @param {string} altText - ข้อความสำรอง
   * @returns {Promise}
   */
  sendFlexMessage(targetId, flexContent, altText = 'Flex Message') {
    return this.client.pushMessage(targetId, {
      type: 'flex',
      altText: altText,
      contents: flexContent
    });
  }

  /**
   * ส่งหลายข้อความพร้อมกัน
   * @param {string} targetId - User ID, Group ID หรือ Room ID
   * @param {Array} messages - Array ของข้อความ
   * @returns {Promise}
   */
  sendMultipleMessages(targetId, messages) {
    return this.client.pushMessage(targetId, messages);
  }

  /**
   * ตรวจสอบว่าเป็น Group หรือไม่
   * @param {Object} source - ข้อมูล source จาก Webhook event
   * @returns {boolean}
   */
  isGroup(source) {
    return source && source.type === 'group';
  }

  /**
   * ดึง Group ID จาก event
   * @param {Object} event - Webhook event
   * @returns {string|null}
   */
  getGroupId(event) {
    return this.isGroup(event.source) ? event.source.groupId : null;
  }
}

module.exports = LineBot;