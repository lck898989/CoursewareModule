/**
 * 时钟可触摸旋转
 */
class ClockTouchScene extends UIObject {
    protected clockImgArr: eui.Image[];

    protected group: eui.Group;
    protected _touchImg: eui.Image;
    private _offsetX: number;
    private _offsetY: number;
    private _initPosArr: number[];

    public constructor() {
        super();
        this.clockImgArr = [];
        this._initPosArr = [];
    }

    /** 每次进入 */
    public onAdd(): void {
        this.initScene();
        this.initAddEvent();
    }

    /** 这里进行移除场景处理 */
    public onDestroy(): void {
        for (let i: number = 0; i < this.clockImgArr.length; i++) {
            if (this.clockImgArr[i].hasEventListener(egret.TouchEvent.TOUCH_BEGIN)) {
                this.clockImgArr[i].removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.doTouchBeginHandle, this);
            }
        }
        this.clockImgArr = [];
    }

    /** 接收信令 */
    public execMessage(data: any): void {
        if (data["moveIng"]) {
            const name: string = data["moveIng"]["itemName"];
            const ro: number = Number(data["moveIng"]["itemRotation"]);
            this.revMoveingHandle(name, ro);
        } else if (data["moveEnd"]) {
            const name: string = data["moveEnd"]["itemName"];
            const ro: number = Number(data["moveEnd"]["itemRotation"]);
            this.revMoveEndHandle(name, ro);
        }
    }

    /** 初始化场景 */
    protected initScene(): void {
        if (this._initPosArr.length <= 0) {
            for (let i: number = 0; i < this.clockImgArr.length; i++) {
                this._initPosArr.push(this.clockImgArr[i].x);
                this._initPosArr.push(this.clockImgArr[i].y);
            }
        } else {
            for (let i: number = 0; i < this.clockImgArr.length; i++) {
                this.clockImgArr[i].x = this._initPosArr[i * 2];
                this.clockImgArr[i].y = this._initPosArr[i * 2 + 1];
            }
        }

        for (let i: number = 0; i < this.clockImgArr.length; i++) {
            this.clockImgArr[i].pixelHitTest = true;
            this.clockImgArr[i].name = String(i);
        }
    }

    /** 初始添加监听 */
    protected initAddEvent(): void {
        for (let i: number = 0; i < this.clockImgArr.length; i++) {
            this.clockImgArr[i].addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.doTouchBeginHandle, this);
        }
    }

    /** 处理开始点击 */
    protected doTouchBeginHandle(e: egret.TouchEvent): void {
        this._touchImg = e.currentTarget as eui.Image;
        if (!this._touchImg) {
            return;
        }

        this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.doTouchMoveHandle, this);
        this.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.doTouchEndHandle, this);
    }

    /** 处理移动中 */
    protected doTouchMoveHandle(e: egret.TouchEvent): void {
        if (!this._touchImg) {
            this.stop();
            return;
        }

        const dx: number = e.stageX - this._touchImg.x;
        const dy: number = e.stageY - this._touchImg.y;
        this._touchImg.rotation = Math.atan2(dy, dx) / Math.PI * 180 + 90;

        const obj: Object = new Object();
        obj["itemName"] = this._touchImg.name;
        obj["itemRotation"] = this._touchImg.rotation;
        CommunicationManager.getInstance().makePostMessage("onFileMessage", "moveIng", obj);
    }

    protected stop(): void {
        if (this.stage.hasEventListener(egret.TouchEvent.TOUCH_MOVE)) {
            this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.doTouchMoveHandle, this);
        }
        if (this._touchImg.hasEventListener(egret.TouchEvent.TOUCH_BEGIN)) {
            this._touchImg.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.doTouchBeginHandle, this);
        }
        if (this.stage.hasEventListener(egret.TouchEvent.TOUCH_END)) {
            this.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.doTouchEndHandle, this);
        }
    }

    /** 处理移动结束 */
    protected doTouchEndHandle(e: egret.TouchEvent): void {
        if (!this._touchImg) {
            return;
        }

        if (this.stage.hasEventListener(egret.TouchEvent.TOUCH_MOVE)) {
            this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.doTouchMoveHandle, this);
        }
        if (this.stage.hasEventListener(egret.TouchEvent.TOUCH_END)) {
            this.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.doTouchEndHandle, this);
        }

        const obj: Object = new Object();
        obj["itemName"] = this._touchImg.name;
        obj["itemRotation"] = this._touchImg.rotation;
        CommunicationManager.getInstance().makePostMessage("onFileMessage", "moveEnd", obj);
    }

    /** 接收移动中 */
    protected revMoveingHandle(itemName: string, itemRotation: number): void {
        this._touchImg = this.group.getChildByName(itemName) as eui.Image;
        if (!this._touchImg) {
            return;
        }

        this._touchImg.rotation = itemRotation;
    }

    /** 接收鼠标抬起 */
    protected revMoveEndHandle(itemName: string, itemRotation: number): void {
        this._touchImg = this.group.getChildByName(itemName) as eui.Image;
        if (!this._touchImg) {
            return;
        }

        this._touchImg.rotation = itemRotation;
    }
}
