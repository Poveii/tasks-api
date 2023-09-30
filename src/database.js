import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
  #database = {}

  constructor() {
    fs.readFile(databasePath, 'utf-8')
      .then((data) => {
        this.#database = JSON.parse(data)
      })
      .catch(() => {
        this.#persists()
      })
  }

  #persists() {
    fs.writeFile(databasePath, JSON.stringify(this.#database))
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data)
    } else {
      this.#database[table] = [data]
    }

    this.#persists()

    return data
  }

  select(table, search) {
    let data = this.#database[table] ?? []

    if (search) {
      const uuidRegex =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/

      data = data.filter((row) => {
        return Object.entries(search).some(([key, value]) => {
          if (!value) return true

          if (!uuidRegex.test(value)) {
            return false
          }

          if (value.includes('+') || value.includes('%20')) {
            value = decodeURI(value).replaceAll('+', ' ')
          }

          return row[key].includes(value)
        })
      })
    }

    return data
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id)

    if (rowIndex > -1) {
      Object.entries(data).forEach(([key, value]) => {
        this.#database[table][rowIndex][key] = value
      })
      this.#persists()
    }
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id)

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1)
      this.#persists()
    }
  }
}
