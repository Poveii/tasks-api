import fs from 'node:fs/promises'

const databasePath = new URL("../db.json", import.meta.url)

export class Database {
  #database = {}

  constructor() {
    fs.readFile(databasePath, "utf-8")
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
}