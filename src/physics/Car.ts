import Circle from "../geometry/Circle";
import Point from "../geometry/Point";
import type { KeybindMap, KeyPressedMap } from "../keybind/Keyboard";
import PhysicsObject from "./PhysicsObject";

export default class Car extends PhysicsObject {



    constructor() {
        super(new Circle(new Point(100, 100), 6), 0.4)
    }

    carUpdate(keybindMap: KeybindMap, keyPressedMap: KeyPressedMap) {
        
        const accel = keyPressedMap.get(keybindMap.get("ACCELERATE")!)
        const decel = keyPressedMap.get(keybindMap.get("DECELERATE")!)

        if (accel) {
            this.velocity += 0.005
        }

        if (decel) {
            this.velocity -= 0.005
        }

        if (!accel && !decel) {
            if (this.velocity > 0.005) {
                this.velocity -= 0.005
            } else if (this.velocity < -0.005) {
                this.velocity += 0.005
            } else {
                this.velocity = 0
            }
        }

        if (keyPressedMap.get(keybindMap.get("LEFT")!)) {
            this.angle -= 0.0075
        }

        if (keyPressedMap.get(keybindMap.get("RIGHT")!)) {
            this.angle += 0.0075
        }

        super.update()

    }

}