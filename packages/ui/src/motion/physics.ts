export interface SpringState { position: number; velocity: number }
export interface SpringOptions { stiffness?: number; damping?: number; mass?: number }
export function springStep(state: SpringState, target: number, dt: number, { stiffness = 210, damping = 24, mass = 1 }: SpringOptions = {}) {
  const displacement = state.position - target;
  const force = -stiffness * displacement - damping * state.velocity;
  const acceleration = force / mass;
  const velocity = state.velocity + acceleration * dt;
  return { position: state.position + velocity * dt, velocity };
}
export function magneticStrength(distance: number, radius = 72, power = 2) { if (radius <= 0 || distance >= radius) return 0; return Math.pow(1 - distance / radius, power); }
export function velocityPrecision(velocity: number, { min = .28, fullPrecisionAt = 90, coarseAt = 1400 } = {}) {
  const speed = Math.abs(velocity); if (speed <= fullPrecisionAt) return 1; if (speed >= coarseAt) return min;
  return 1 - (1 - min) * ((speed - fullPrecisionAt) / (coarseAt - fullPrecisionAt));
}
export function exponentialDecay(velocity: number, friction: number, dt: number) { return velocity * Math.exp(-Math.max(0, friction) * dt); }
