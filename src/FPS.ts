export function showFPS(fpsDisplay: HTMLElement, frameCount: number, lastTime: number) {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    const fps = 1000 / deltaTime;
    fpsDisplay.textContent = `FPS: ${fps.toFixed(2)}`;
    frameCount++;
    if (frameCount % 60 === 0) { // Update FPS display every second
        lastTime = currentTime;
    }
    return { frameCount, lastTime };
}
