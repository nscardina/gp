export const Delay = (milliseconds: number) => 
    new Promise(resolve => setTimeout(resolve, milliseconds))