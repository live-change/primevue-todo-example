const txtgen = require('txtgen')
const randomProfile = require('random-profile-generator')

Feature('write')

Scenario('post message', ({ I }) => {

  const user1 = randomProfile.profile()
  const user2 = randomProfile.profile()
  
  session(user1.fullName)
  session(user2.fullName)

  const user1RandomSentence = txtgen.sentence()
  const user2RandomSentence = txtgen.sentence()

  session(user1.fullName, () => {
    I.amOnPage('/')
    I.dontSee(user1.fullName)
    I.dontSeeElement('.messageForm')
    I.seeElement('form.nameForm')
    I.fillField('.nameForm input[type=text]', user1.fullName)
    I.click('.nameForm button[type=submit]')
    I.dontSeeElement('.nameForm')
    I.seeElement('.messageForm')
    I.see(user1.fullName, '.userName')
    I.fillField('.messageForm input[type=text]', user1RandomSentence)
    I.click('.messageForm button[type=submit]')
    I.see(user1.fullName, '.messageAuthor')
    I.see(user1RandomSentence)
    I.videoWait(2)
  })
  
  session(user2.fullName, () => {
    I.amOnPage('/')
    I.see(user1RandomSentence)
    I.dontSee(user2.fullName)
    I.dontSeeElement('.messageForm')
    I.seeElement('form.nameForm')
    I.fillField('.nameForm input[type=text]', user2.fullName)
    I.click('.nameForm button[type=submit]')
    I.dontSeeElement('.nameForm')
    I.seeElement('.messageForm')
    I.see(user2.fullName, '.userName')
    I.fillField('.messageForm input[type=text]', user2RandomSentence)
    I.click('.messageForm button[type=submit]')
    I.see(user2.fullName, '.messageAuthor')
    I.see(user2RandomSentence)
    I.videoWait(2)
  })

  session(user1.fullName, () => {
    I.see(user2RandomSentence)
    I.click('.userName')
    I.dontSeeElement('.userName')
    I.dontSee(user1.fullName)
    I.dontSeeElement('.messageForm')
    I.seeElement('form.nameForm')
  })

  session(user2.fullName, () => {
    I.dontSee(user1.fullName)
  })

  session(user1.fullName, () => {
    I.fillField('.nameForm input[type=text]', user1.fullName)
    I.click('.nameForm button[type=submit]')
    I.dontSeeElement('.nameForm')
    I.seeElement('.messageForm')
    I.see(user1.fullName, '.userName')
  })

  session(user2.fullName, () => {
    I.see(user1.fullName)
  })

})


