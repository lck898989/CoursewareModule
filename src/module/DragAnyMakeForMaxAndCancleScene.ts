class DragAnyMakeForMaxAndCancleScene extends UIObject {
    // protected scene_Ani:egret.tween.TweenGroup;
    // protected scene_Ani_next:egret.tween.TweenGroup;

    protected ImgList: eui.Image[];
    protected rectCancle: eui.Rect;
    protected btnReset: eui.Image;
    protected group: eui.Group;

    protected numMax: number;

    protected targetList: eui.Image[];
    protected isNewItem: boolean = false;
    protected curMoveItemIndex: number;          // 如果isNew = true  index = itemList的索引, else  targetList 的索引
    protected curMoveItemObj: eui.Image;
    protected curMoveItemObjStudent: eui.Image;

    public constructor() {
        super();

        this.ImgList = [];
        this.numMax = 1;
        this.curMoveItemIndex = -2;
    }

    /** 每次进入 */
    public onAdd(): void {
        // this.scene_Ani.play(0);

        this.initData();
        this.initAddEvent();
    }

    /** 这里进行移出场景的处理 **/
    public onDestroy(): void {
        // this.scene_Ani_next.play(0);

        this.destoryEvent();
        this.destoryData();

    }


    public execMessage(data: any): void {
        if (data["reset"]) {
            this.resetData();
        } else if (data["touchBegin"]) {
            const isNewItem: string = data["touchBegin"]["isNewItem"];
            const curIndexStr: string = data["touchBegin"]["curIndexStr"];
            const targetX: number = parseInt(data["touchBegin"]["targetX"]);
            const targetY: number = parseInt(data["touchBegin"]["targetY"]);
            this.revStartHandle(isNewItem, curIndexStr, targetX, targetY);
        } else if (data["touchMove"]) {
            const targetX: number = parseInt(data["touchMove"]["targetX"]);
            const targetY: number = parseInt(data["touchMove"]["targetY"]);
            this.revMoveHandle(targetX, targetY);
        } else if (data["touchEndLayer"]) {
            const isCancelStr: string = data["touchEndLayer"]["isCancelStr"];
            const isNewItemStr: string = data["touchEndLayer"]["isNewItemStr"];
            const targetX: number = parseInt(data["touchEndLayer"]["targetX"]);
            const targetY: number = parseInt(data["touchEndLayer"]["targetY"]);
            const deleteIndex: number = parseInt(data["touchEndLayer"]["deleteIndex"]);
            this.revEndHandle(isCancelStr, isNewItemStr, targetX, targetY, deleteIndex);
        }

    }

    protected initData() {
        this.targetList = [];
    }

    protected initAddEvent(): void {

        for (const obj of this.ImgList) {
            obj.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBeginOriginalEvent, this);
        }

        this.btnReset.addEventListener(egret.TouchEvent.TOUCH_TAP, this.touchTapEvent, this);

        this.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEndLayerEvent, this);
        this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchMoveLayerEvent, this);
    }

    protected touchBeginOriginalEvent(event: egret.TouchEvent): void {

        const curIndex = this.ImgList.indexOf(event.target);
        if (curIndex >= -1) {

            // let childIndex = this.group.numChildren
            // this.group.setChildIndex(event.target, childIndex - 1)

            this.curMoveItemIndex = curIndex;
            this.isNewItem = true;
            this.curMoveItemObj = this.newObjForTouchBegin(event.target, event.stageX, event.stageY);

            const obj: Object = new Object();
            obj["isNewItem"] = "1";
            obj["curIndexStr"] = curIndex.toString();
            obj["targetX"] = event.stageX.toString();
            obj["targetY"] = event.stageY.toString();

            const msg = {method: "onFileMessage", keyName: "touchBegin", value: obj};
            lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));

        }
    }
    protected newObjForTouchBegin(obj: eui.Image, xGlobal: number, yGlobal: number): eui.Image {
        const localPos = this.group.globalToLocal(xGlobal, yGlobal);
        const path = obj.source;
        const img = new eui.Image(path);
        img.anchorOffsetX = obj.anchorOffsetX;
        img.anchorOffsetY = obj.anchorOffsetY;
        img.rotation = obj.rotation;
        img.x = localPos.x;
        img.y = localPos.y;

        this.group.addChild(img);
        img.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBeginMakedItemEvent, this);

        return img;
    }
    protected deleteObj(obj: eui.Image) {
        if (!obj) {
            return;
        }
        obj.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBeginMakedItemEvent, this);
        this.group.removeChild(obj);
    }
    protected touchBeginMakedItemEvent(event: egret.TouchEvent): void {

        let curIndex = 0;
        for (const index in this.targetList) {
            const obj = this.targetList[index];
            if (obj == event.currentTarget) {
                curIndex = parseInt(index);
            }
        }
        if (curIndex >= -1) {

            const childIndex = this.group.numChildren;
            this.group.setChildIndex(event.target, childIndex - 1);

            this.curMoveItemIndex = curIndex;
            this.isNewItem = false;
            this.curMoveItemObj = event.target;

            // 给学生发送信令  移动中
            const obj: Object = new Object();
            obj["isNewItem"] = "0";
            obj["curIndexStr"] = curIndex.toString();
            obj["targetX"] = event.stageX.toString();
            obj["targetY"] = event.stageY.toString();

            const msg = {method: "onFileMessage", keyName: "touchBegin", value: obj};
            lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));
        }
    }

    protected touchMoveLayerEvent(event: egret.TouchEvent): void {

        if (this.curMoveItemObj) {

            const target = this.curMoveItemObj;

            if (target) {
                const stageX = event.stageX;
                const stageY = event.stageY;

                const posTarget = this.globalToLocal(stageX, stageY);
                target.x = posTarget.x;
                target.y = posTarget.y;

                // 给学生发送信令  移动中
                const obj: Object = new Object();
                obj["targetX"] = target.x.toString();
                obj["targetY"] = target.y.toString();

                const msg = {method: "onFileMessage", keyName: "touchMove", value: obj};
                lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));

            }
        }
    }

    protected touchEndLayerEvent(event: egret.TouchEvent): void {
        let isCancelStr = 0;
        let isNewItemStr = 0;
        let stageXStr = 0;
        let stageYStr = 0;
        let deleteIndex = -2;
        if (this.curMoveItemIndex >= -1 && this.curMoveItemObj) {

            const target = this.curMoveItemObj;
            const stageX = event.stageX;
            const stageY = event.stageY;

            stageXStr = event.stageX;
            stageYStr = event.stageY;

            this.curMoveItemObj.x = stageX;
            this.curMoveItemObj.y = stageY;

            const isCancel = this.rectCancle.hitTestPoint(stageX, stageY);

            if (isCancel) {
                isCancelStr = 1;
                // 取消
                if (this.isNewItem) {
                    isNewItemStr = 1;
                    // 表示创建了一个新的 但是不需要了 需要删除
                    this.deleteObj(this.curMoveItemObj);
                    this.curMoveItemObj = null;
                } else {
                    isNewItemStr = 0;
                    // 表示 拖动的创建好的 需要删除数据
                    // let curIndex = this.targetList.indexOf(event.currentTarget)
                    let curIndex = 0;
                    for (const index in this.targetList) {
                        const _obj = this.targetList[index];
                        if (_obj == this.curMoveItemObj) {
                            curIndex = parseInt(index);
                        }
                    }
                    deleteIndex = curIndex;
                    this.targetList.splice(curIndex, 1);

                    this.deleteObj(this.curMoveItemObj);
                    this.curMoveItemObj = null;
                }
            } else {
                isCancelStr = 0;
                // 不是取消
                if (this.isNewItem) {
                    isNewItemStr = 1;
                    // 表示 创建了一个新的 需要保存到target列表
                    this.targetList.push(this.curMoveItemObj);
                    this.curMoveItemObj = null;
                } else {
                    isNewItemStr = 0;
                    // 表示 移动的是原来创建好的 , 只设置坐标就可以
                    this.curMoveItemObj = null;
                }
            }

        }


        // 给学生发送信令  移动中
        const obj: Object = new Object();
        obj["isCancelStr"] = isCancelStr.toString();
        obj["isNewItemStr"] = isNewItemStr.toString();
        obj["targetX"] = stageXStr.toString();
        obj["targetY"] = stageYStr.toString();
        obj["deleteIndex"] = deleteIndex.toString();

        const msg = {method: "onFileMessage", keyName: "touchEndLayer", value: obj};
        lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));

    }
    protected resetData() {
        if (this.targetList && this.targetList.length > 0) {
            for (const obj of this.targetList) {
                this.deleteObj(obj);
            }
            this.targetList = [];
        }
    }
    protected touchTapEvent(event: egret.TouchEvent): void {

        this.resetData();

        const msg = {method: "onFileMessage", keyName: "reset", value: 1};
        lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));

    }

    protected destoryData() {
        delete this.ImgList;
        this.ImgList = [];

        this.resetData();
    }
    protected destoryEvent() {
        for (const obj of this.ImgList) {
            obj.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBeginOriginalEvent, this);
        }

        this.btnReset.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.touchTapEvent, this);

        this.removeEventListener(egret.TouchEvent.TOUCH_END, this.touchEndLayerEvent, this);
        this.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchMoveLayerEvent, this);
    }

    protected revStartHandle(isNewItemStr: string, curIndexStr: string, targetX: number, targetY: number): void {

        if (isNewItemStr == "1") {
            const curIndex = parseInt(curIndexStr);
            const obj = this.ImgList[curIndex];
            if (obj) {
                this.curMoveItemObj = this.newObjForTouchBegin(obj, targetX, targetY);
            } else {
                Log.trace("DragAnyMakeForMaxAndCancleScene", "revStartHandle error  index to obj not find isNewItemStr = 1");
            }
        } else {
            const curIndex = parseInt(curIndexStr);
            const obj = this.targetList[curIndex];
            if (obj) {
                const childIndex = this.group.numChildren;
                this.group.setChildIndex(obj, childIndex - 1);
                this.curMoveItemObj = obj;
            } else {
                Log.trace("DragAnyMakeForMaxAndCancleScene", "revStartHandle error  index to obj not find isNewItemStr = 0");
            }
        }

    }
    protected revMoveHandle(targetX: number, targetY: number): void {
        const target = this.curMoveItemObj;

        if (target) {
            const posTarget = this.globalToLocal(targetX, targetY);
            target.x = posTarget.x;
            target.y = posTarget.y;
        }

    }
    protected revEndHandle(isCancelStr: string, isNewItemStr: string, targetX: number, targetY: number, deleteIndex: number): void {
        if (isCancelStr == "1") {
            // 取消
            if (isNewItemStr == "1") {
                // 表示创建了一个新的 但是不需要了 需要删除
                if (this.curMoveItemObj) {
                    this.deleteObj(this.curMoveItemObj);
                }
                this.curMoveItemObj = null;
            } else {
                if (deleteIndex >= -1) {
                    // 表示 拖动的创建好的 需要删除数据
                    const curIndex = deleteIndex;
                    this.targetList.splice(curIndex, 1);
                    if (this.curMoveItemObj) {
                        this.deleteObj(this.curMoveItemObj);
                    }
                    this.curMoveItemObj = null;


                } else {
                    Log.trace("DragAnyMakeForMaxAndCancleScene", "revEndHandle error  index to obj not find ");
                }

            }
        } else {
            // 不是取消
            if (isNewItemStr == "1") {
                // 表示 创建了一个新的 需要保存到target列表
                if (this.curMoveItemObj) {
                    this.targetList.push(this.curMoveItemObj);
                }
                this.curMoveItemObj = null;
            } else {
                // 表示 移动的是原来创建好的 , 只设置坐标就可以
                this.curMoveItemObj = null;
            }
        }
    }

}
