import Robot from './robot'
import RobotsStorage from './robotsStorage'

class RobotsService {
  private readonly storage: RobotsStorage
  private robots: Robot[] = []

  constructor(storage: RobotsStorage) {
    this.storage = storage
    this.robots = storage.readAll()
  }

  async create(accountId: string, id: string, figi: string) {
    if (this.robots.find((robot) => robot.isFor(accountId, figi))) {
      throw new Error('Робот для этого инструмента уже есть')
    }
    const robot = new Robot(id, accountId, figi)
    this.robots.push(robot)
    await this.storage.save(robot)
  }

  get(accountId: string, id: string): Robot {
    const robot = this.robots.find((robot) => robot.getId() === id)
    if (!robot) {
      throw new Error('Робот не найден')
    }
    return robot
  }

  async remove(accountId: string, id: string) {
    const robot = this.robots.find((robot) => robot.getId() === id)
    if (!robot) {
      throw new Error('Робот не найден')
    }
    const index = this.robots.indexOf(robot)
    if (index > -1) {
      this.robots.splice(index, 1)
    }
    await this.storage.remove(robot)
  }

  getAll(accountId: string): Robot[] {
    return this.robots.filter((robot) => robot.getAccountId() === accountId)
  }
}

export default RobotsService
