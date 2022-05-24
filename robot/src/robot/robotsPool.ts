import Robot from './robot'
import RobotsStorage from './robotsStorage'
import { Strategy } from './strategy'
import { Trader } from './trading'

type RobotView = {
  id: string
  accountId: string
  figi: string
  lots: number
  name: string
  active: boolean
}

class RobotsPool {
  private readonly storage: RobotsStorage
  private readonly trader: Trader
  private robots: Robot[] = []

  constructor(storage: RobotsStorage, trader: Trader) {
    this.storage = storage
    this.trader = trader
    this.robots = storage.readAll()
  }

  async add(accountId: string, name: string, robotId: string, figi: string, lots: number, from: string | null) {
    const strategy = from ? this.get(from).getStrategy() : Strategy.blank()
    const robot = new Robot(robotId, name, accountId, figi, lots, strategy, false)
    this.robots.push(robot)
    return this.storage.save(robot)
  }

  async edit(accountId: string, robotId: string, name: string, figi: string, lots: number) {
    const robot = this.getInAccount(accountId, robotId)
    robot.edit(name, figi, lots)
    return this.storage.save(robot)
  }

  async remove(accountId: string, robotId: string) {
    const robot = this.getInAccount(accountId, robotId)
    const index = this.robots.indexOf(robot)
    if (index > -1) {
      this.robots.splice(index, 1)
    }
    return this.storage.remove(robot)
  }

  async removeAllRobotsForAccount(accountId: string) {
    this.robots
      .filter((robot) => robot.getAccountId() === accountId)
      .forEach((robot) => this.remove(accountId, robot.getId()))
  }

  copyStrategy(accountId: string, robotId: string, from: string) {
    const robot = this.getInAccount(accountId, robotId)
    const strategy = this.get(from).getStrategy()
    robot.changeStrategy(strategy)
    return this.storage.save(robot)
  }

  async changeStrategy(accountId: string, robotId: string, callback: (strategy: Strategy) => Strategy) {
    const robot = this.getInAccount(accountId, robotId)
    const strategy = callback(robot.getStrategy())
    robot.changeStrategy(strategy)
    return this.storage.save(robot)
  }

  async backTest(accountId: string, robotId: string, from: Date) {
    return this.getInAccount(accountId, robotId).backTest(this.trader, from)
  }

  async start(accountId: string, robotId: string) {
    const robot = await this.getInAccount(accountId, robotId)
    robot.start()
    return this.storage.save(robot)
  }

  async stop(accountId: string, robotId: string) {
    const robot = await this.getInAccount(accountId, robotId)
    robot.stop()
    return this.storage.save(robot)
  }

  view(accountId: string, robotId: string): RobotView {
    const robot = this.getInAccount(accountId, robotId)
    return {
      id: robot.getId(),
      accountId: robot.getAccountId(),
      figi: robot.getFigi(),
      lots: robot.getLots(),
      name: robot.getName(),
      active: robot.isActive(),
    }
  }

  viewAll(): RobotView[] {
    return this.robots.map((robot) => ({
      id: robot.getId(),
      accountId: robot.getAccountId(),
      figi: robot.getFigi(),
      lots: robot.getLots(),
      name: robot.getName(),
      active: robot.isActive(),
    }))
  }

  viewAllForAccount(accountId: string): RobotView[] {
    return this.robots
      .filter((robot) => robot.getAccountId() === accountId)
      .map((robot) => ({
        id: robot.getId(),
        accountId: robot.getAccountId(),
        figi: robot.getFigi(),
        lots: robot.getLots(),
        name: robot.getName(),
        active: robot.isActive(),
      }))
  }

  viewStrategy(accountId: string, robotId: string): Strategy {
    const robot = this.getInAccount(accountId, robotId)
    return robot.getStrategy()
  }

  private get(robotId: string): Robot {
    const robot = this.robots.find((robot) => robot.getId() === robotId)
    if (!robot) {
      throw new Error('Робот не найден')
    }
    return robot
  }

  private getInAccount(accountId: string, robotId: string): Robot {
    const robot = this.robots.find((robot) => robot.getAccountId() === accountId && robot.getId() === robotId)
    if (!robot) {
      throw new Error('Робот в аккаунте не найден')
    }
    return robot
  }
}

export default RobotsPool
