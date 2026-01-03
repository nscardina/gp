import type Circle from "./Circle";
import Point from "./Point";
import type Polygon from "./Polygon";
import type Rectangle from "./Rectangle";

export function PointInsideCircle(point: Point, circle: Circle): boolean {
    return point.distTo(circle.center) <= circle.radius
}

export function PointInsideRectangle(point: Point, rectangle: Rectangle): boolean {
    return point.x >= rectangle.x
    && point.x <= rectangle.x + rectangle.width
    && point.y >= rectangle.y
    && point.y <= rectangle.y + rectangle.height
}

export function CirclesIntersect(c1: Circle, c2: Circle): boolean {
    return c1.center.distTo(c2.center) < (c1.radius + c2.radius)
}

export function LineSegmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point): Point | null {
    const t = (
        (p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)
    ) / (
        (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x)
    )

    const u = (
        (p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)
    ) / (
        (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x)
    )

    if (0 <= t && t <= 1 && 0 <= u && u <= 1) {
        const xInt = p1.x + t * (p2.x - p1.x)
        const yInt = p1.y + t * (p2.y - p1.y)
        return new Point(xInt, yInt)
    } else {
        return null
    }
}

export function PointInsidePolygon(point: Point, polygon: Polygon): boolean {
    const points = polygon.points
    let point1: Point;
    let point2: Point;

    let intersectionCount = 0

    for (let i = 0; i < points.length; i++) {
        point1 = points[i];
        point2 = points[(i + 1) % points.length] // wrap around to 0 if it's the last point

        if (point1.y > point.y != point2.y > point.y) {
            const intersectX = (point.y - point1.y) * (point2.x - point1.x) / (point2.y - point1.y) + point1.x
            if (intersectX > point.x) {
                intersectionCount++
            }
        }
    }
    // odd number of intersections
    return intersectionCount % 2 == 1
}

export function PointDistanceToLineSegment(point: Point, point1: Point, point2: Point): number {
    const t = (
        (point.x - point1.x) * (point2.x - point1.x) + 
        (point.y - point1.y) * (point2.y - point1.y)
    ) / (
        Math.pow(point2.x - point1.x, 2)
        + Math.pow(point2.y - point1.y, 2)
    )

    if (t < 0) {
        return point.distTo(point1)
    }
    if (t > 1) {
        return point.distTo(point2)
    }

    const A = point1.y - point2.y
    const B = point2.x - point1.x
    return Math.abs(
        A * point.x + B * point.y + point1.x * point2.y - point2.x * point1.y
    ) / Math.sqrt(
        A * A + B * B
    )
}

export function PointDistanceToPolygon(point: Point, polygon: Polygon) {
    let minDist = Infinity
    for (let i = 0; i < polygon.points.length; i++) {
        const p1 = polygon.points[i]
        const p2 = polygon.points[(i + 1) % polygon.points.length]
        const dist = PointDistanceToLineSegment(point, p1, p2)
        if (dist < minDist) {
            minDist = dist
        }
    }
    return minDist
}