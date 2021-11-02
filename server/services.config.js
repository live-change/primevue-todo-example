const authentication = [
  {
    type: 'message',
    secrets: [
     // { type: 'code', length: 6 },
      { type: 'link' }
    ]
  },
  // {
  //   type: 'password'
  // }
]

const identifiers = [
  {
    type: 'email',
    authentication
  },
  // {
  //   type: 'phone',
  //   authentication
  // },
  // {
  //   type: 'google-account'
  // }
]

module.exports = {
  services: [
   //  { path: '@live-change/secret-link-service' },
   //  { path: '@live-change/secret-code-service' },
   //  { path: '@live-change/email-service' },
   //  { path: '@live-change/smsapi-service' },
   //  { path: '@live-change/message-authentication-service' },
   //  { path: '@live-change/password-authentication-service' },
    { path: '@live-change/session-service' },
   //  { path: '@live-change/google-account-service' },
   //  {
   //    path: '@live-change/user-service',
   //    identifiers
   //  },
    {
      path: './todo'
    },
  ]
}
