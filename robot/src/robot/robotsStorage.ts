import Robot from './robot'
import { promises } from 'fs'
import * as path from 'path'
import * as fs from 'fs'

interface RobotsStorage {
  readAll(): Robot[]
  save(robot: Robot): void
  remove(robot: Robot): void
}

export class FileRobotsStorage implements RobotsStorage {
  private readonly path: string

  constructor(path: string) {
    this.path = path
  }

  readAll(): Robot[] {
    return fs
      .readdirSync(this.path)
      .filter((file) => file.endsWith('.json'))
      .map((file) => {
        const content = fs.readFileSync(path.resolve(this.path, file))
        const data = JSON.parse(content.toString())
        return new Robot(data.id, data.accountId, data.figi)
      })
  }

  async save(robot: Robot) {
    await fs.writeFileSync(
      path.resolve(this.path, robot.getId() + '.json'),
      JSON.stringify({
        id: robot.getId(),
        accountId: robot.getAccountId(),
        figi: robot.getFigi(),
      })
    )
  }

  async remove(robot: Robot) {
    await promises.rm(path.resolve(this.path, robot.getId() + '.json'))
  }
}

export default RobotsStorage
