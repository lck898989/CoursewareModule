/**
 *
 */
class MakeNewToTargetScene extends UIObject {
    protected clickItemArr: eui.Image[];
    protected newItemSrcArr: string[];
    protected comparisonArr: eui.Image[];
    protected moveGroup: eui.Group;
    protected completeImg: eui.Image;
    protected backImg: eui.Image;

    protected _touchImg: eui.Image;
    protected _offsetX: number;
    protected _offsetY: number;
    private _newIndex: number;

    public constructor() {
        super();
        this.clickItemArr = [];
        this.newItemSrcArr = [];
        this.comparisonArr = [];
    }

    /** 每次进入 */
    public onAdd(): void {
        this.initScene();
        this.initAddEvent();
    }

    /** 移除场景销毁 */
    public onDestory(): void {
        for (let i: number = 0; i < this.clickItemArr.length; i++) {
            this.clickItemArr[i].removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.doTouchBeginHandle, this);
        }
        this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.doTouchMoveHandle, this);
        this.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.doTouchEndHandle, this);
        this.backImg.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.doBackInitHandle, this);
    }

    /** 接收信令 */
    public execMessage(data: any): void {
        if (!DEBUG) {
            if (data["moveBegin"]) {
                const name: string = data["moveBegin"]["name"];
                const src: string = data["moveBegin"]["src"];
                const targetX: number = Number(data["moveBegin"]["targetX"]);
                const targetY: number = Number(data["moveBegin"]["targetY"]);
                this.revMoveBeginHandle(name, src, targetX, targetY);
            } else if (data["moveIng"]) {
                const name: string = data["moveIng"]["name"];
                const targetX: number = Number(data["moveIng"]["targetX"]);
                const targetY: number = Number(data["moveIng"]["targetY"]);
                this.revMoveingHandle(name, targetX, targetY);
            } else if (data["moveEnd"]) {
                const name: string = data["moveEnd"]["name"];
                const targetX: number = Number(data["moveEnd"]["targetX"]);
                const targetY: number = Number(data["moveEnd"]["targetY"]);
                const del: number = Number(data["moveEnd"]["del"]);
                this.revMoveEndHandle(name, targetX, targetY, del);
            } else if (data["backInit"]) {
                this.initScene();
            }
        }
    }

    /** 初始化场景 */
    protected initScene(): void {
        this._newIndex = 1;
        this.completeImg.visible = false;
        for (let i: number = 0; i < this.clickItemArr.length; i++) {
            this.clickItemArr[i].name = String(i + 1);
        }
        for (let i: number = 0; i < this.comparisonArr.length; i++) {
            this.comparisonArr[i].visible = false;
        }
    }

    /** 初始化监听 */
    protected initAddEvent(): void {
        for (let i: number = 0; i < this.clickItemArr.length; i++) {
            this.clickItemArr[i].addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.doTouchBeginHandle, this);
        }
        this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.doTouchMoveHandle, this);
        this.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.doTouchEndHandle, this);
        this.backImg.addEventListener(egret.TouchEvent.TOUCH_TAP, this.doBackInitHandle, this);
    }

    /** 开始点击图片 */
    protected doTouchBeginHandle(e: egret.TouchEvent): void {
        if (this.completeImg.visible) {
            return;
        }
        const nIndex: number = Number(e.currentTarget.name);
        const newImg: eui.Image = new eui.Image();
        this.moveGroup.addChild(newImg);
        this.moveGroup.setChildIndex(newImg, this.moveGroup.numChildren - 1);
        newImg.source = this.newItemSrcArr[nIndex - 1];
        newImg.x = e.stageX;
        newImg.y = e.stageY;
        newImg.scaleX = 2.3;
        newImg.scaleY = 2.3;
        newImg.anchorOffsetX = newImg.width / 2;
        newImg.anchorOffsetY = newImg.height / 2;
        newImg.name = "newImg" + String(this._newIndex);
        this._newIndex++;

        this._touchImg = newImg;
        this._offsetX = e.stageX - this._touchImg.x;
        this._offsetY = e.stageY - this._touchImg.y;

        const obj: Object = new Object();
        obj["name"] = newImg.name;
        obj["src"] = newImg.source;
        obj["targetX"] = this._touchImg.x;
        obj["targetY"] = this._touchImg.y;

        const msg = {method: "onFileMessage", keyName: "moveBegin", value: obj};
        lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));
    }

    /** 开始移动 */
    protected doTouchMoveHandle(e: egret.TouchEvent): void {
        const tempImg: eui.Image = this._touchImg;
        if (!tempImg) {
            return;
        }

        if (this._touchImg) {
            this._touchImg.x = e.stageX - this._offsetX;
            this._touchImg.y = e.stageY - this._offsetY;

            // 不能移除边界
            if (this._touchImg.y - this._touchImg.height / 2 < 0) {
                this._touchImg.y = this._touchImg.height / 2;
            }
            if (this._touchImg.y + this._touchImg.height / 2 > 1348) {
                this._touchImg.y = 1348 - this._touchImg.height / 2;
            }
            if (this._touchImg.x - this._touchImg.width / 2 < 0) {
                this._touchImg.x = this._touchImg.width / 2;
            }
            if (this._touchImg.x + this._touchImg.width / 2 > 1562) {
                this._touchImg.x = 1562 - this._touchImg.width / 2;
            }

            // 给学生发送信令  移动中
            const obj: Object = new Object();
            obj["name"] = this._touchImg.name;
            obj["targetX"] = this._touchImg.x;
            obj["targetY"] = this._touchImg.y;

            const msg = {method: "onFileMessage", keyName: "moveIng", value: obj};
            lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));
        }
    }

    /** 结束移动 */
    protected doTouchEndHandle(e: egret.TouchEvent): void {
        if (!this._touchImg) {
            return;
        }

        const n: number = this.isBingoCoordinateTarget(this._touchImg);
        if (n > 0) {
            if (!this.completeImg.visible) {
                this.comparisonArr[n - 1].visible = true;
            }
            let b: boolean = false;
            for (let i: number = 0; i < this.comparisonArr.length; i++) {
                if (!this.comparisonArr[i].visible) {
                    b = true;
                    break;
                }
            }
            if (!b) {
                this.completeImg.visible = true;
                for (let i: number = 0; i < this.comparisonArr.length; i++) {
                    this.comparisonArr[i].visible = false;
                }
            }
        }
        this.moveGroup.removeChild(this._touchImg);

        const obj: Object = new Object();
        obj["name"] = this._touchImg.name;
        obj["targetX"] = this._touchImg.x;
        obj["targetY"] = this._touchImg.y;
        obj["del"] = n;
        const msg = {method: "onFileMessage", keyName: "moveEnd", value: obj};
        lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));

        this._touchImg = null;
    }

    /** 判断是否贴合 */
    protected isBingoCoordinateTarget(item: eui.Image): number {
        for (let i: number = 0; i < this.comparisonArr.length; i++) {
            if (this.comparisonArr[i].hitTestPoint(item.x, item.y)) {
                if (item.source === this.comparisonArr[i].source) {
                    return i + 1;
                }
            }
        }
        return -1;
    }

    /** 处理返回初始状态 */
    private doBackInitHandle(): void {
        const msg = {method: "onFileMessage", keyName: "backInit", value: 1};
        lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));
        this.initScene();
    }

    /** 接收开始移动 */
    private revMoveBeginHandle(name: string, src: string, x: number, y: number): void {
        const newImg: eui.Image = new eui.Image();
        this.moveGroup.addChild(newImg);
        this.moveGroup.setChildIndex(newImg, this.moveGroup.numChildren - 1);
        newImg.source = src;
        newImg.x = x;
        newImg.y = y;
        newImg.scaleX = 2.3;
        newImg.scaleY = 2.3;
        newImg.anchorOffsetX = newImg.width / 2;
        newImg.anchorOffsetY = newImg.height / 2;
        newImg.name = name;
        this._touchImg = newImg;
    }

    /** 接收移动中 */
    private revMoveingHandle(name: string, x: number, y: number): void {
        this._touchImg = this.moveGroup.getChildByName(name) as eui.Image;
        if (!this._touchImg) {
            return;
        }

        this._touchImg.x = x;
        this._touchImg.y = y;
    }

    /** 接收移动结束 */
    private revMoveEndHandle(name: string, x: number, y: number, del: number): void {
        this._touchImg = this.moveGroup.getChildByName(name) as eui.Image;
        if (!this._touchImg) {
            return;
        }

        if (del > 0) {
            if (!this.completeImg.visible) {
                this.comparisonArr[del - 1].visible = true;
            }
            let b: boolean = false;
            for (let i: number = 0; i < this.comparisonArr.length; i++) {
                if (!this.comparisonArr[i].visible) {
                    b = true;
                    break;
                }
            }
            if (!b) {
                this.completeImg.visible = true;
                for (let i: number = 0; i < this.comparisonArr.length; i++) {
                    this.comparisonArr[i].visible = false;
                }
            }
        }

        this.moveGroup.removeChild(this._touchImg);
        this._touchImg = null;
    }
}
