const app = require('@live-change/framework').app()

const service = app.createServiceDefinition({
  name: 'todo',
  use: [ require('@live-change/session-service') ]
})

const Task = service.model({
  name: 'Task',
  sessionItem: {
    sessionReadAccess: () => true,
    sessionWriteAccess: () => true,
    sortBy: ['order']
  },
  properties: {
    text: {
      type: String,
      validation: ['nonEmpty']
    },
    done: {
      type: Boolean
    },
    order: {
      type: Number
    },
    lastUpdate: {
      type: Date,
      validation: ['nonEmpty']
    }
  }
})

module.exports = service
