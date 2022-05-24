import Robot from './robot'
import { promises } from 'fs'
import * as path from 'path'
import * as fs from 'fs'
import { Node } from './node'
import { Strategy } from './strategy'
import { AvailableCriterias } from './availableCriterias'

interface RobotsStorage {
  readAll(): Robot[]
  save(robot: Robot): void
  remove(robot: Robot): void
}

export class FileRobotsStorage implements RobotsStorage {
  private readonly path: string
  private readonly criterias: AvailableCriterias

  constructor(path: string, criterias: AvailableCriterias) {
    this.path = path
    this.criterias = criterias
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
          data.name,
          data.accountId,
          data.figi,
          data.lots,
          new Strategy(
            Node.fromJSON(data.strategy.buy, this.criterias),
            Node.fromJSON(data.strategy.sell, this.criterias)
          ),
          data.active || false,
          data.startDate || null
        )
      })
  }

  async save(robot: Robot) {
    return fs.writeFileSync(
      path.resolve(this.path, robot.getId() + '.json'),
      JSON.stringify({
        id: robot.getId(),
        name: robot.getName(),
        accountId: robot.getAccountId(),
        figi: robot.getFigi(),
        lots: robot.getLots(),
        strategy: robot.getStrategy(),
        active: robot.isActive(),
        startDate: robot.getStartDate(),
      })
    )
  }

  async remove(robot: Robot) {
    return promises.rm(path.resolve(this.path, robot.getId() + '.json'))
  }
}

export default RobotsStorage
