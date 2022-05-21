import Robot from './robot'
import RobotsStorage from './robotsStorage'
import { Strategy } from './strategy'

type RobotView = {
  id: string
  figi: string
}

class RobotsPool {
  private readonly storage: RobotsStorage
  private robots: Robot[] = []

  constructor(storage: RobotsStorage) {
    this.storage = storage
    this.robots = storage.readAll()
  }

  async add(accountId: string, id: string, figi: string) {
    if (this.robots.find((robot) => robot.isFor(accountId, figi))) {
      throw new Error('Робот для этого инструмента уже есть')
    }
    const robot = new Robot(id, accountId, figi, Strategy.blank())
    this.robots.push(robot)
    await this.storage.save(robot)
  }

  async remove(accountId: string, id: string) {
    const robot = this.get(accountId, id)
    const index = this.robots.indexOf(robot)
    if (index > -1) {
      this.robots.splice(index, 1)
    }
    await this.storage.remove(robot)
  }

  async changeStrategy(accountId: string, id: string, callback: (strategy: Strategy) => Strategy) {
    const robot = this.get(accountId, id)
    const strategy = callback(robot.getStrategy())
    robot.changeStrategy(strategy)
    await this.storage.save(robot)
  }

  view(accountId: string, id: string): RobotView {
    const robot = this.get(accountId, id)
    return {
      id: robot.getId(),
      figi: robot.getFigi(),
    }
  }

  viewAll(accountId: string): RobotView[] {
    return this.robots
      .filter((robot) => robot.getAccountId() === accountId)
      .map((robot) => ({
        id: robot.getId(),
        figi: robot.getFigi(),
      }))
  }

  viewStrategy(accountId: string, id: string): Strategy {
    const robot = this.get(accountId, id)
    return robot.getStrategy()
  }

  private get(accountId: string, id: string): Robot {
    const robot = this.robots.find((robot) => robot.is(accountId, id))
    if (!robot) {
      throw new Error('Робот не найден')
    }
    return robot
  }
}

export default RobotsPool
