const txtgen = require('txtgen')
const randomProfile = require('random-profile-generator')

Feature('scroll')

Scenario('scroll down for history', async ({ I }) => {
  I.amOnPage('/')
  I.seeElement('.message')
  const messagesCount = await I.executeScript(() => document.querySelectorAll('.message').length)
  // console.log("MESSAGES COUNT", messagesCount)
  I.scrollPageToBottom()
  I.waitForFunction((count) => document.querySelectorAll('.message').length > count, messagesCount)
  // const nextMessagesCount = await I.executeScript(() => document.querySelectorAll('.message').length)
  // console.log("MESSAGES COUNT AFTER LOAD", nextMessagesCount)
})
