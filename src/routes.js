import { randomUUID } from 'node:crypto'

import { buildRoutePath } from './utils/build-route-path.js'
import { Database } from './database.js'
import { readCSV } from './middlewares/read-csv.js'

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.query

      let search = null
      if (title !== undefined || description !== undefined) {
        search = {
          title,
          description,
        }
      }

      const tasks = database.select('tasks', search)

      return res.end(JSON.stringify(tasks))
    },
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      if (!req.body) {
        return res.writeHead(400).end(
          JSON.stringify({
            message: 'Both title and description are required',
          }),
        )
      }

      const { title, description } = req.body

      if (!title) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ message: 'title is required' }))
      }

      if (!description) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ message: 'description is required' }))
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        created_at: new Date(),
        updated_at: null,
        completed_at: null,
      }

      database.insert('tasks', task)

      return res.writeHead(201).end()
    },
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ message: 'task not found.' }))
      }

      if (!req.body || (!req.body.title && !req.body.description)) {
        return res.writeHead(400).end(
          JSON.stringify({
            message: 'Both title and description are required',
          }),
        )
      }

      const body = {
        ...req.body,
        updated_at: new Date(),
      }
      database.update('tasks', id, body)

      return res.writeHead(204).end()
    },
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ message: 'task not found.' }))
      }

      database.delete('tasks', id)
      return res.writeHead(204).end()
    },
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params
      const [task] = database.select('tasks', { id })

      if (!task) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ message: 'task not found.' }))
      }

      const isTaskCompleted = !!task.completed_at

      const completedAt = isTaskCompleted ? null : new Date()
      database.update('tasks', id, { completed_at: completedAt })

      return res.writeHead(204).end()
    },
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks/csv'),
    handler: async (req, res) => {
      const csvPath = new URL('./sample.csv', import.meta.url)

      const csvArray = await readCSV(csvPath)

      csvArray.forEach(({ title, description }) => {
        const task = {
          id: randomUUID(),
          title,
          description,
          created_at: new Date(),
          updated_at: null,
          completed_at: null,
        }

        database.insert('tasks', task)
      })

      return res.writeHead(200).end(JSON.stringify({ csvArray }))
    },
  },
]
