/**
 * by 郑岩
 * 需要显示选择状态的场景
 * @param arr : Array<Array<eui.Image>>
 * 当传入一个数组时，只显示点击选择状态
 * 当多个数组时，请把相同类型状态放入同一个数组 例如: A B  分别放入两个数组
 */
class OnlySelectedScene extends UIObject {
    protected _arr: eui.Image[][];

    public constructor() {
        super();

        this._arr = new Array<eui.Image[]>();
    }

    /** 移除场景处理 */
    public onDestroy(): void {
        for (let i: number = 0; i < this._arr.length; i++) {
            for (let j: number = 0; j < this._arr[i].length; j++) {
                this._arr[i][j].removeEventListener(egret.TouchEvent.TOUCH_TAP, this.doSelectedTouchHandle, this);
            }
        }

        delete this._arr;
        this._arr = [];
    }

    /** 接收信令 */
    public execMessage(data: any): void {
        if (data["selected"]) {
            const imgName: string = String(data["selected"]);
            if (this._arr.length == 1) {
                for (let i: number = 0; i < this._arr.length; i++) {
                    for (let j: number = 0; j < this._arr[i].length; j++) {
                        if (this._arr[i][j].name === imgName) {
                            this._arr[i][j].alpha = 1;
                        } else {
                            this._arr[i][j].alpha = 0;
                        }
                    }
                }
            } else {
                for (let i: number = 0; i < this._arr.length; i++) {
                    for (let j: number = 0; j < this._arr[i].length; j++) {
                        if (this._arr[i][j].name === imgName) {
                            this._arr[i][j].alpha = 1;
                            for (let n: number = 0; n < this._arr.length; n++) {
                                if (this._arr[n][j] === this._arr[i][j]) {
                                    continue;
                                }
                                this._arr[n][j].alpha = 0;
                            }
                            break;
                        }
                    }
                }
            }
        }
    }

    /** 初始化 */
    protected initScene(arr: eui.Image[][]): void {
        if (arr.length <= 0) {
            Log.trace("onlySelectedScene", "image arr error!!!");
            return;
        }

        this._arr = arr;
        let nameIndex: number = 1;
        for (let i: number = 0; i < this._arr.length; i++) {
            for (let j: number = 0; j < this._arr[i].length; j++) {
                this._arr[i][j].alpha = 0;
                this._arr[i][j].addEventListener(egret.TouchEvent.TOUCH_TAP, this.doSelectedTouchHandle, this);
                this._arr[i][j].name = "image" + String(nameIndex) + String(j);
                nameIndex++;
            }
        }
    }

    /** 处理点击选中 */
    protected doSelectedTouchHandle(e: egret.TouchEvent): void {
        if (this._arr.length == 1) {
            for (let i: number = 0; i < this._arr.length; i++) {
                for (let j: number = 0; j < this._arr[i].length; j++) {
                    if (this._arr[i][j] === e.currentTarget) {
                        this._arr[i][j].alpha = 1;

                        const msg = {method: "onFileMessage", keyName: "selected", value: this._arr[i][j].name};
                        lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));

                    } else {
                        this._arr[i][j].alpha = 0;
                    }
                }
            }
        } else {
            for (let i: number = 0; i < this._arr.length; i++) {
                for (let j: number = 0; j < this._arr[i].length; j++) {
                    if (this._arr[i][j] === e.currentTarget) {
                        this._arr[i][j].alpha = 1;
                        const msg = {method: "onFileMessage", keyName: "selected", value: this._arr[i][j].name};
                        lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));

                        for (let n: number = 0; n < this._arr.length; n++) {
                            if (this._arr[n][j] === this._arr[i][j]) {
                                continue;
                            }
                            this._arr[n][j].alpha = 0;
                        }
                        break;
                    }
                }
            }
        }
    }
}
