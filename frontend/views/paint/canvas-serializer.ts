export function serializeCanvas(canvas: HTMLCanvasElement):string {
    return canvas.toDataURL();
}

export function deserializeCanvas(data: string, canvas: HTMLCanvasElement):void {
    const img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        // @ts-ignore
        canvas.getContext("2d").drawImage(img, 0, 0);
    };
    img.src = data;
}
