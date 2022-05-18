import Robot from './robot'

export class RobotsError extends Error {}

class Robots {
  private readonly robots: Robot[] = []

  create(accountId: string, id: string, figi: string): void {
    if (this.robots.find((robot) => robot.isFor(accountId, figi))) {
      throw new RobotsError('Robot for this figi already exists')
    }
    this.robots.push(new Robot(id, accountId, figi))
  }

  getAll(accountId: string): Robot[] {
    return this.robots.filter((robot) => robot.getAccountId() === accountId)
  }
}

export default Robots
