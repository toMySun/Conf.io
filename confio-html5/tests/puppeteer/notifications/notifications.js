const MultiUsers = require('../user/multiusers');
const Page = require('../core/page');
const params = require('../params');
const util = require('./util');
const ne = require('./elements');
const we = require('../whiteboard/elements');

class Notifications extends MultiUsers {
  constructor() {
    super('notifications');
    this.page1 = new Page();
    this.page2 = new Page();
    this.page3 = new Page();
    this.page4 = new Page();
  }

  async init(meetingId) {
    await this.page1.init(Page.getArgs(), meetingId, { ...params });
    await this.page2.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'User2' });
  }

  async initUser3(meetingId) {
    await this.page3.init(Page.getArgs(), meetingId, { ...params, fullName: 'User3' });
  }

  async initUser4() {
    await this.page4.init(Page.getArgs(), this.page3.meetingId, { ...params, fullName: 'User4' });
  }

  // Save Settings toast notification
  async saveSettingsNotification() {
    await util.popupMenu(this.page1);
    await util.saveSettings(this.page1);
    const resp = await util.getLastToastValue(this.page1) === ne.savedSettingsToast;
    return resp;
  }

  // Public chat toast notification
  async publicChatNotification() {
    await util.popupMenu(this.page1);
    await util.enableChatPopup(this.page1);
    await util.saveSettings(this.page1);
    const expectedToastValue = await util.publicChatMessageToast(this.page1, this.page2);
    await this.page1.waitForSelector(ne.smallToastMsg);
    await this.page1.waitForSelector(ne.hasUnreadMessages);
    const lastToast = await util.getOtherToastValue(this.page1);
    return expectedToastValue === lastToast;
  }

  // Private chat toast notification
  async privateChatNotification() {
    await util.popupMenu(this.page1);
    await util.enableChatPopup(this.page1);
    await util.saveSettings(this.page1);
    const expectedToastValue = await util.privateChatMessageToast(this.page2);
    await this.page1.waitForSelector(ne.smallToastMsg);
    await this.page1.waitForSelector(ne.hasUnreadMessages);
    const lastToast = await util.getOtherToastValue(this.page1);
    return expectedToastValue === lastToast;
  }

  // User join toast notification
  async userJoinNotification() {
    await util.popupMenu(this.page3);
    await util.enableUserJoinPopup(this.page3);
    await util.saveSettings(this.page3);
  }

  async getUserJoinPopupResponse() {
    await this.page3.waitForSelector(ne.smallToastMsg);
    const response = await util.getOtherToastValue(this.page3);
    return response;
  }

  // File upload notification
  async fileUploaderNotification() {
    await util.uploadFileMenu(this.page3);
    await this.page3.waitForSelector(ne.fileUploadDropZone);
    const inputUploadHandle = await this.page3.page.$('input[type=file]');
    await inputUploadHandle.uploadFile(process.env.PDF_FILE);
    await this.page3.page.evaluate(util.clickTestElement, ne.modalConfirmButton);
    const resp = await util.getLastToastValue(this.page3);
    await this.page3.waitForSelector(we.whiteboard);
    return resp;
  }

  async publishPollResults() {
    await this.page3.waitForSelector(we.whiteboard);
    await util.startPoll(this.page3);
    await this.page3.waitForSelector(ne.smallToastMsg);
    const resp = await util.getLastToastValue(this.page3);
    return resp;
  }

  async closePages() {
    await this.page3.close();
    await this.page4.close();
  }
}

module.exports = exports = Notifications;
