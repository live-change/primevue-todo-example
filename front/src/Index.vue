<template>
  <div class="todo">

    <ConfirmPopup v-if="isMounted"></ConfirmPopup>
    <Toast v-if="isMounted"></Toast>

    <DataTable :value="tasks"
               class="p-datatable-sm"
               responsiveLayout="scroll"
               @rowReorder="handleRowReorder"
               :rowClass="data => ['task', { 'task-done':  data.done, 'task-empty': data.empty }]">
      <Column v-if="editable" bodyClass="task-reorder-cell" :rowReorder="true">
        <template #body="{ data }">
          <div v-if="data.id" class="reorder-area p-datatable-reorderablerow-handle"></div>
        </template>
      </Column>
      <Column field="done" bodyClass="task-done-cell">
        <template #body="{ data }">
          <Checkbox v-if="data.id" v-model="data.done" :binary="true" />
        </template>
      </Column>
      <Column field="text" header="Task" bodyClass="task-text-cell">
        <template #body="{ data }">
          <TextArea v-model="data.text" autoResize
                    :readonly="!editable"
                    rows="1" class="task-text"
                    :placeholder="!data.id ? 'Add task...' : ''" />
        </template>
      </Column>
      <Column v-if="editable" bodyClass="task-delete-cell">
        <template #body="{ data }">
          <Button
              v-if="data.id"
              @click="ev => deleteTask(ev, data.id)"
              icon="pi pi-trash"
              class="p-button-raised p-button-secondary"
              title="Delete task" />
          <Button
              v-else-if="data.text.trim()"
              @click="ev => addNewTask(ev)"
              icon="pi pi-plus"
              class="p-button-raised p-button-primary"
              title="Add task" />
        </template>
      </Column>
    </DataTable>

  </div>
</template>

<script setup>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import TextArea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'

import ConfirmPopup from 'primevue/confirmpopup'
import Toast from 'primevue/toast'

import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { reactive, ref, computed, watch, onMounted, onUnmounted} from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { live, path, client, actions, uid as uidGenerator } from '@live-change/vue3-ssr'

const todoActions = actions().todo
const uid = uidGenerator()

console.log('UID', uid)

const confirm = useConfirm()
const toast = useToast()

const editable = true
let isMounted = ref(false)
onMounted(() => isMounted.value = true)
onUnmounted(() => isMounted.value = false)

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

let serverTasks = ref([])
let localTasks = reactive([])
    //JSON.parse(JSON.stringify(testTasks)).map(t => ({ ...t, lastUpdate: '' })))
let localyDeletedTasks = reactive([])
let locallyAddedTasks = reactive([])

function localCache(server, local, property, onChange) {
  return computed({
    get: () => local.lastUpdate > server.lastUpdate ? local[property] : server[property],
    set: onChange && (text => {
      local[property]= text
      local.lastUpdate = new Date().toISOString()
      onChange()
    })
  })
}

const newTask = reactive({ text: '', done: false })

const tasks = computed(() => {
  const srcTasks = (Array.isArray(serverTasks?.value) ? serverTasks?.value : serverTasks?.value?.value) || []
  console.log("COMPUTE NORMAL TASKS!!!", srcTasks )
  const clearServerTasks = srcTasks.filter(task => !localyDeletedTasks.includes(task.to))
  const normalTasks = clearServerTasks.map((serverTask) => {
    let localTask = localTasks.find(task => task.id == serverTask.to)
    if(!localTask) {
      localTask = { ...serverTask, id: serverTask.to, lastUpdate: ''}
      localTasks.push(localTask)
    }
    const task = reactive({
      id: serverTask.to,
      text: localCache(serverTask, localTask, 'text', () => handleChange()),
      done: localCache(serverTask, localTask, 'done', () => handleChange()),
      order: localCache(serverTask, localTask, 'order')
    })
    return task
  }).filter(task => !!task).sort((a, b) => a.order - b.order)
  if(!editable) return normalTasks
  locallyAddedTasks.value = locallyAddedTasks.filter(la => !srcTasks.find(s => s.to == la.id))
  console.log("NT", normalTasks.map(t => t.id))
  console.log("SRC", srcTasks.map(t => t.to))
  console.log("LAT", locallyAddedTasks.value.map(t=>t.id))
  return normalTasks
      .concat(locallyAddedTasks.value)
      .concat([newTask])
})

watch(() => newTask.text, (text) => { if(text.trim()) handleNewTaskText() })
const handleNewTaskText = useDebounceFn(() => addNewTask())

async function addNewTask() {
  const text = newTask.text
  const lastTask = tasks.value[tasks.value.length - 2]
  const order = lastTask ? lastTask.order + 1 : 0
  const id = uid()
  locallyAddedTasks.push({ id, text, done: false, order })
  newTask.text = ''
  const lastUpdate = new Date()

  const added = await todoActions.createMySessionTask({ task: id, text, done: false, order, lastUpdate })
  //locallyAddedTasks.find(lt => lt.id == id).id = added
  console.log("ADDED!", added)
  //sleep(500)
  //serverTasks.push({ id, text, done: false, order })
  toast.add({ severity: 'info', summary: 'Task added', life: 1500 })
  console.log("ADD NEW TASK!")
}

function handleRowReorder(event) {
  if(!editable) return
  if(editable && event.dragIndex + 1 == tasks.length) return
  const taskIds = tasks.value.map(task => task.id)
  if(event.dragIndex > event.dropIndex) { // move up
    for(let i = event.dropIndex; i < event.dragIndex; i++) {
      const localTask = localTasks.find(task => task.id == taskIds[i])
      localTask.order += 1
      localTask.lastUpdate = new Date().toISOString()
    }
    const localDraggedTask = localTasks.find(task => task.id == taskIds[event.dragIndex])
    localDraggedTask.order = event.dropIndex
    localDraggedTask.lastUpdate = new Date().toISOString()
  } else { // move down
    const localDraggedTask = localTasks.find(task => task.id == taskIds[event.dragIndex])
    localDraggedTask.order = event.dropIndex
    localDraggedTask.lastUpdate = new Date().toISOString()
    for(let i = event.dragIndex + 1; i < event.dropIndex + 1; i++) {
      const localTask = localTasks.find(task => task.id == taskIds[i])
      localTask.order -= 1
      localTask.lastUpdate = new Date().toISOString()
    }
  }
  localTasks.sort((a, b) => a.order - b.order)
  handleChange()
}
function deleteTask(event,id) {
  if(!editable) return
  confirm.require({
    target: event.currentTarget,
    message: 'Do you want to delete this task?',
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const index = localTasks.findIndex(task => task.id == id)
      localTasks.splice(index, 1)
      localyDeletedTasks.push(id)
      handleChange()
      toast.add({ severity:'info', summary: 'Task deleted', life: 1500 })
    },
    reject: () => {
      toast.add({ severity:'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 })
    }
  })
}

let lastChange = new Date()
let lastSave = new Date()
let saving = false
const saveInterval = setInterval(() => saveIfNeeded(), 1000)
onUnmounted(() => clearTimeout(saveInterval))
function handleChange() {
  lastChange = new Date()
}
function saveIfNeeded() {
  if(lastSave.getTime() >= lastChange.getTime()) return // nothing changed
  const timeFromLastChange = Date.now() - lastChange.getTime()
  const timeFromLastSave = Date.now() - lastChange.getTime()
  if( (timeFromLastSave > 1000 && timeFromLastChange > 1000) ||
      (timeFromLastSave > 5000 && timeFromLastChange > 300) ||
      (timeFromLastSave > 20000) ) {
    saveChanges()
  }
}
async function saveChanges() {
  if(saving) return
  saving = true
  try {
    const deletedList = localyDeletedTasks.slice()

    const srcTasks = serverTasks?.value?.value || []
    let promises = []

    console.log("SAVE SRC TASKS", srcTasks)
    for(let task of srcTasks) {
      if(localyDeletedTasks.includes(task.to)) {
        promises.push(todoActions.deleteMySessionTask({ task: task.to }))
      } else {
        const localTask = localTasks.find(t => t.id == task.to)
        if(localTask.lastUpdate > task.lastUpdate) {
          const update = {}
          if(task.done != localTask.done) update.done = localTask.done
          if(task.text != localTask.text) update.text = localTask.text
          if(task.order != localTask.order) update.order = localTask.order
          if(Object.keys(update).length > 0) {
            console.log("UPDATE", update)
            promises.push(todoActions.updateMySessionTask({
              task: task.to,
              lastUpdate: localTask.lastUpdate,
              ...update
            }))
          }
        }
      }
    }

    await Promise.all(promises)

    lastSave = new Date()
    toast.add( {severity: 'info', summary: 'Saved', life: 1000 })
    setTimeout(() => {
      localyDeletedTasks = localyDeletedTasks.filter(id => !deletedList.includes(id))
    }, 5000)
  } catch(error) {
    toast.add({severity: 'error', summary: 'Save error', detail: error.message, life: 3000 })
  }
  saving = false
}

serverTasks.value = await live(
  path().todo.mySessionTasksByOrder()
)

console.log("LOADED SERVER TASKS!", serverTasks.value)
</script>

<style lang="scss">
  .todo {
    .p-datatable-thead {
      display: none;
    }

    .task {

      .task-reorder-cell {
        width: 10px;
        .reorder-area {
          width: 10px;
          height: 20px;
        }
      }

      &:hover {
        .task-reorder-cell .reorder-area{
          background-image: radial-gradient(black 1.5px, transparent 0);
          background-size: 5px 5px;
          background-position: 0px 0px;
        }
      }

      &.task-done {
        .task-text {
          text-decoration: line-through;
          color: var(--text-color-secondary);
        }
      }

      .task-done-cell {
        width: 30px;
      }

      .task-delete-cell {
        width: 40px;
      }

      .task-text-cell {
        padding-top: 6px !important;
        padding-bottom: 0 !important;
        vertical-align: middle;

        .task-text {
          border: none;
          width: 100%;
        }
      }
    }
  }
</style>
