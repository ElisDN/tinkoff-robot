import Robot from './robot'

export class RobotsError extends Error {}

class Robots {
  private readonly robots: Robot[] = []

  create(accountId: string, figi: string): void {
    if (this.robots.find((robot) => robot.isFor(accountId, figi))) {
      throw new RobotsError('Robot for this figi already exists')
    }
    this.robots.push(new Robot(accountId, figi))
  }

  getRobots(): Robot[] {
    return this.robots
  }
}

export default Robots
