import Robot from './robot'
import { promises } from 'fs'
import * as path from 'path'
import * as fs from 'fs'
import { Strategy } from './strategy'
import { CriteriaCreator } from './criteriaCreator'

interface RobotsStorage {
  readAll(): Robot[]
  save(robot: Robot): void
  remove(robot: Robot): void
}

export class FileRobotsStorage implements RobotsStorage {
  private readonly path: string
  private readonly criteriaCreator: CriteriaCreator

  constructor(path: string, criteriaCreator: CriteriaCreator) {
    this.path = path
    this.criteriaCreator = criteriaCreator
  }

  readAll(): Robot[] {
    return fs
      .readdirSync(this.path)
      .filter((file) => file.endsWith('.json'))
      .map((file) => {
        const content = fs.readFileSync(path.resolve(this.path, file))
        const data = JSON.parse(content.toString())
        return new Robot(
          data.id,
          data.accountId,
          data.figi,
          new Strategy(
            this.criteriaCreator.restoreCriteria(data.strategy.buy),
            this.criteriaCreator.restoreCriteria(data.strategy.sell)
          )
        )
      })
  }

  async save(robot: Robot) {
    await fs.writeFileSync(
      path.resolve(this.path, robot.getId() + '.json'),
      JSON.stringify({
        id: robot.getId(),
        accountId: robot.getAccountId(),
        figi: robot.getFigi(),
        strategy: robot.getStrategy(),
      })
    )
  }

  async remove(robot: Robot) {
    await promises.rm(path.resolve(this.path, robot.getId() + '.json'))
  }
}

export default RobotsStorage
