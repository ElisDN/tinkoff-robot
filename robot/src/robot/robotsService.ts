import Robot from './robot'

class RobotsService {
  private readonly robots: Robot[] = []

  create(accountId: string, id: string, figi: string): void {
    if (this.robots.find((robot) => robot.isFor(accountId, figi))) {
      throw new Error('Robot for this figi already exists')
    }
    this.robots.push(new Robot(id, accountId, figi))
  }

  get(accountId: string, id: string): Robot {
    const robot = this.robots.find((robot) => robot.getId() === id)
    if (!robot) {
      throw new Error('Robot not found')
    }
    return robot
  }

  getAll(accountId: string): Robot[] {
    return this.robots.filter((robot) => robot.getAccountId() === accountId)
  }
}

export default RobotsService
