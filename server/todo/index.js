const app = require('@live-change/framework').app()

const service = app.createServiceDefinition({
  name: 'todo'
})

const Task = service.model({
  name: 'Task',
  sessionItem: {
    readAccess: () => true,
    writeAccess: () => true,
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
    }
  }
})

module.exports = service
