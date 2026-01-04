import { loadImage } from "./util/Load"

export type ImageResources = {
    Countdown: {
        One: ImageBitmap,
        Two: ImageBitmap,
        Three: ImageBitmap,
        Go: ImageBitmap
    }
}

export const LoadImageResources = async(): Promise<ImageResources> => {
    const Countdown = {
        One: loadImage("/countdown/countdown_1.png"),
        Two: loadImage("/countdown/countdown_2.png"),
        Three: loadImage("/countdown/countdown_3.png"),
        Go: loadImage("/countdown/countdown_go.png")
    }

    await Promise.allSettled([...Object.values(Countdown)])

    return {
        Countdown: {
            One: await Countdown.One,
            Two: await Countdown.Two,
            Three: await Countdown.Three,
            Go: await Countdown.Go
        }
    }
}