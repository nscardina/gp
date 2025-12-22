import type Circle from "./Circle";
import Point from "./Point";
import type Polygon from "./Polygon";

export function PointInsideCircle(point: Point, circle: Circle): boolean {
    return point.distTo(circle.center) <= circle.radius
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


        if (
            point.y >= Math.min(point1.y, point2.y)
            && point.y <= Math.max(point1.y, point2.y)
            && (point1.x + (point.y - point1.y) * (point2.x - point1.x) / (point2.y - point1.y) > point.x)
        ) {
            intersectionCount++
        }
    }
    // odd number of intersections
    return intersectionCount % 2 == 1
}