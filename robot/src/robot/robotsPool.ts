import Robot from './robot'
import RobotsStorage from './robotsStorage'
import { Strategy } from './strategy'

type RobotView = {
  id: string
  figi: string
  name: string
}

class RobotsPool {
  private readonly storage: RobotsStorage
  private robots: Robot[] = []

  constructor(storage: RobotsStorage) {
    this.storage = storage
    this.robots = storage.readAll()
  }

  async add(accountId: string, name: string, robotId: string, figi: string) {
    const robot = new Robot(robotId, name, accountId, figi, Strategy.blank())
    this.robots.push(robot)
    return this.storage.save(robot)
  }

  async remove(accountId: string, robotId: string) {
    const robot = this.get(accountId, robotId)
    const index = this.robots.indexOf(robot)
    if (index > -1) {
      this.robots.splice(index, 1)
    }
    return this.storage.remove(robot)
  }

  async removeAllRobotsForAccout(accountId: string) {
    this.robots
      .filter((robot) => robot.isForAccount(accountId))
      .forEach((robot) => this.remove(accountId, robot.getId()))
  }

  async changeStrategy(accountId: string, robotId: string, callback: (strategy: Strategy) => Strategy) {
    const robot = this.get(accountId, robotId)
    const strategy = callback(robot.getStrategy())
    robot.changeStrategy(strategy)
    return this.storage.save(robot)
  }

  view(accountId: string, robotId: string): RobotView {
    const robot = this.get(accountId, robotId)
    return {
      id: robot.getId(),
      figi: robot.getFigi(),
      name: robot.getName(),
    }
  }

  viewAll(accountId: string): RobotView[] {
    return this.robots
      .filter((robot) => robot.getAccountId() === accountId)
      .map((robot) => ({
        id: robot.getId(),
        figi: robot.getFigi(),
        name: robot.getName(),
      }))
  }

  viewStrategy(accountId: string, robotId: string): Strategy {
    const robot = this.get(accountId, robotId)
    return robot.getStrategy()
  }

  private get(accountId: string, robotId: string): Robot {
    const robot = this.robots.find((robot) => robot.is(accountId, robotId))
    if (!robot) {
      throw new Error('Робот не найден')
    }
    return robot
  }
}

export default RobotsPool
