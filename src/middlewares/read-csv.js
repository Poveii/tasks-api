import fs from 'node:fs'
import { parse } from 'csv-parse'

export async function readCSV(csvPath) {
  const csvArray = []

  const fileStream = fs.createReadStream(csvPath)

  const parsedCSV = fileStream.pipe(
    parse({
      fromLine: 2,
      delimiter: ',',
      skipEmptyLines: true,
    }),
  )

  for await (const line of parsedCSV) {
    const [title, description] = line

    csvArray.push({ title, description })
  }

  return csvArray
}
