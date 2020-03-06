/* tslint:disable:no-shadowed-variable variable-name no-for-in-array*/
// 不允许子作用域与外层作用域声明同名变量  驼峰  不允许对Array使用for-in
class DragAnyMakeRuleListCommonScene extends UIObject {
    // protected scene_Ani:egret.tween.TweenGroup;
    // protected scene_Ani_next:egret.tween.TweenGroup;

    protected ImgList: eui.Image[];
    protected countImgList: number[];            // img可以放置的数量  默认 9999
    protected curNumImgList: number[];            // img可以当前放置的数量
    protected rectCanSetList: eui.Rect[];
    protected btnReset: eui.Image;
    protected group: eui.Group;

    protected numMax: number;

    protected targetList: eui.Image[];
    protected targetDataMap = {};                  // key index  value [{obj, index}]   target对应位置的列表 map example {1:[{obj:obj, index:index}], 2:[{obj:obj, index:index}]}
    protected isNewItem: boolean = false;
    protected curMoveItemIndex: number;          // 如果isNew = true  index = itemList的索引, else  targetList 的索引
    protected curMoveItemObj: eui.Image;
    protected curMoveItemObjStudent: eui.Image;

    public constructor() {
        super();

        this.ImgList = [];
        this.rectCanSetList = [];
        this.numMax = 1;
        this.curMoveItemIndex = -2;
        this.countImgList = [];
        this.curNumImgList = [];
    }

    /** 每次进入 */
    public onAdd(): void {
        // this.scene_Ani.play(0);

        this.initData();
        this.initAddEvent();

        this.instanceDataForInitAll()

        this.refreshForListTouchEnd();
    }

    /** 这里进行移出场景的处理 **/
    public onDestroy(): void {
        // this.scene_Ani_next.play(0);

        this.destoryEvent();
        this.destoryData();

    }


    public execMessage(data: any): void {

        if (DEBUG) {
            return;
        }

        if (data["reset"]) {
            this.resetData();
            this.instanceDataForInitAll()
            this.refreshForListTouchEnd();
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
            const targetListIndex: number = parseInt(data["touchEndLayer"]["targetListIndex"]);
            this.revEndHandle(isCancelStr, isNewItemStr, targetX, targetY, deleteIndex, targetListIndex);
        }

    }

    protected initData() {
        this.targetList = [];

        this.targetDataMap = {};

        this.curNumImgList = [];
        if (this.countImgList.length <= 0) {
            for (let i = 0; i < this.ImgList.length; i++) {
                this.countImgList[i] = 9999;
                this.curNumImgList[i] = 0;
            }
        } else {
            for (let i = 0; i < this.ImgList.length; i++) {
                this.curNumImgList[i] = 0;
            }
        }
    }
    //初始化rect中自带物品 
    protected instanceDataForInitAll(){

    }
    protected instanceForInit(sourcePath:string, indexItem:number, rectIndex:number):eui.Image{
        let img = this.getItemForInit(sourcePath)
        this.instanceDataForInit(img, indexItem, rectIndex)
        return img;
    }
    protected getItemForInit(sourcePath:string):eui.Image{
        const img = new eui.Image(sourcePath);
        this.group.addChild(img);
        return img;
    }
    protected instanceDataForInit(obj:eui.Image, indexItem:number, rectIndex:number){

        if(obj && indexItem != null && rectIndex != null){
            this.targetList.push(obj);
            this.pushToTarget(obj, indexItem, rectIndex);

            obj.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBeginMakedItemEvent, this);
        }

    }

    protected initAddEvent(): void {

        for (const obj of this.ImgList) {
            obj.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBeginOriginalEvent, this);
        }
        if (this.btnReset) {
            this.btnReset.addEventListener(egret.TouchEvent.TOUCH_TAP, this.touchTapEvent, this);
        }

        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBeginLayerEvent, this);
        this.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEndLayerEvent, this);
        this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchMoveLayerEvent, this);
    }
    protected touchBeginOriginalEvent(event: egret.TouchEvent): void {

        // 错误兼容处理 ( 如果点击的不是临时的..说明上次临时的没用.兼容处理 )
        this.errorEndEventFunc();
        event.stopPropagation();
        // event.stopImmediatePropagation()

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

            // 刷新 是否超过可拖动的上限
            this.refreshToIsHideTouchBegin(curIndex);
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
        egret.Tween.removeTweens(obj);
        this.group.removeChild(obj);
    }
    protected touchBeginMakedItemEvent(event: egret.TouchEvent): void {

        // 错误兼容处理 ( 如果点击的是临时的..如果点击的不是上次点击的.兼容处理)
        if (this.curMoveItemIndex >= -1 && this.curMoveItemObj) {
            if (this.curMoveItemObj == event.currentTarget) {
                // 如果是上次点击的 数据不变, return
                return;
            } else {
                // 如果不是上次点击的 数据清除 继续正常逻辑
                this.errorEndEventFunc();
            }
        }
        event.stopPropagation();


        let curIndex = -1;
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

    protected touchBeginLayerEvent(event: egret.TouchEvent): void {
        // 错误兼容处理 ( 如果点击的不是临时的..说明上次临时的没用.兼容处理 )
        this.errorEndEventFunc();
    }

    protected touchEndLayerEvent(event: egret.TouchEvent): void {
        let isCancelStr = 0;
        let isNewItemStr = 0;
        let stageXStr = 0;
        let stageYStr = 0;
        let deleteIndex = -2;
        let index = -1;
        if (this.curMoveItemIndex >= -1 && this.curMoveItemObj) {

            const target = this.curMoveItemObj;
            const stageX = event.stageX;
            const stageY = event.stageY;

            stageXStr = event.stageX;
            stageYStr = event.stageY;

            this.curMoveItemObj.x = stageX;
            this.curMoveItemObj.y = stageY;

            index = this.getRectIndexCanSet(stageX, stageY);

            if (!this.isCanSetToRect(this.curMoveItemIndex, index, this.curMoveItemObj, this.isNewItem)) {
                index = -1;
            }

            if (index <= -1) {
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
                        const obj = this.targetList[index];
                        if (obj == this.curMoveItemObj) {
                            curIndex = parseInt(index);
                        }
                    }
                    deleteIndex = curIndex;
                    this.targetList.splice(curIndex, 1);
                    this.removeToTarget(this.curMoveItemObj);

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
                    this.pushToTarget(this.curMoveItemObj, this.curMoveItemIndex, index);
                    this.curMoveItemObj = null;
                } else {
                    isNewItemStr = 0;
                    // 表示 移动的是原来创建好的 , 只设置坐标就可以
                    this.refreshToTarget(this.curMoveItemObj, index);

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
        obj["targetListIndex"] = index.toString();

        const msg = {method: "onFileMessage", keyName: "touchEndLayer", value: obj};
        lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));

        this.refreshForListTouchEnd();

    }
    protected resetData() {
        if (this.targetList && this.targetList.length > 0) {
            for (const obj of this.targetList) {
                this.deleteObj(obj);
            }
            this.targetList = [];
        }

        this.targetDataMap = {};

        for (let i = 0; i < this.curNumImgList.length; i++) {
            this.curNumImgList[i] = 0;
        }

    }
    protected touchTapEvent(event: egret.TouchEvent): void {

        this.resetData();
        this.instanceDataForInitAll()
        this.refreshForListTouchEnd();

        const msg = {method: "onFileMessage", keyName: "reset", value: 1};
        lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));

    }

    protected destoryData() {
        delete this.ImgList;
        this.ImgList = [];
        delete this.rectCanSetList;
        this.rectCanSetList = [];

        delete this.targetDataMap;
        this.targetDataMap = {};

        delete this.countImgList;
        this.countImgList = [];

        delete this.curNumImgList;
        this.curNumImgList = [];

        this.resetData();
    }
    protected destoryEvent() {
        for (const obj of this.ImgList) {
            obj.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBeginOriginalEvent, this);
        }

        if (this.btnReset) {
            this.btnReset.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.touchTapEvent, this);
        }

        this.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBeginLayerEvent, this);
        this.removeEventListener(egret.TouchEvent.TOUCH_END, this.touchEndLayerEvent, this);
        this.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchMoveLayerEvent, this);
    }

    protected revStartHandle(isNewItemStr: string, curIndexStr: string, targetX: number, targetY: number): void {
        this.curMoveItemIndex = -2;

        if (isNewItemStr == "1") {
            const curIndex = parseInt(curIndexStr);
            const obj = this.ImgList[curIndex];
            if (obj) {
                this.curMoveItemObj = this.newObjForTouchBegin(obj, targetX, targetY);
                this.isNewItem = true;
                this.curMoveItemIndex = parseInt(curIndexStr);
            } else {
                Log.trace("DragAnyMakeForMaxAndCancleScene", "revStartHandle error  index to obj not find isNewItemStr = 1");
            }

            // 刷新 是否超过可拖动的上限(新拖动出来的才需要判断)
            this.refreshToIsHideTouchBegin(curIndex);
        } else {
            const curIndex = parseInt(curIndexStr);
            const obj = this.targetList[curIndex];
            if (obj) {
                this.isNewItem = false;
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
    protected revEndHandle(isCancelStr: string, isNewItemStr: string, targetX: number, targetY: number, deleteIndex: number, targetListIndex: number): void {
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
                        this.removeToTarget(this.curMoveItemObj);
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
                    if (targetListIndex > -1) {
                        this.pushToTarget(this.curMoveItemObj, this.curMoveItemIndex, targetListIndex);
                    }
                }
                this.curMoveItemIndex = -2;
                this.curMoveItemObj = null;
            } else {
                // 表示 移动的是原来创建好的 , 只设置坐标就可以
                this.refreshToTarget(this.curMoveItemObj, targetListIndex);
                this.curMoveItemObj = null;
            }
        }

        this.refreshForListTouchEnd();
    }

    // 获取rect的index 如果嫌效率低.可以不用rect 重写此方法 手动控制index
    protected getRectIndexCanSet(stageX: number, stageY: number): number {
        for (const indexCur in this.rectCanSetList) {
            const obj = this.rectCanSetList[indexCur];
            if (obj.hitTestPoint(stageX, stageY)) {
                return parseInt(indexCur);
            }
        }
        return -1;
    }

    // indexForImgList 图片索引(new = true为图片索引 为false 为target索引 需要getDataFromTargetDataMap 通过图片获取索引),
    // indexRect 目标方框索引
    // obj 当前拖动的对象
    // isNewItem 是否是新建的对象(新产生的=true  已经产生的二次拖动=false)
    protected isCanSetToRect(indexForImgList: number, indexRect: number, obj: eui.Image, isNewItem: boolean): boolean {
        if (isNewItem) {
            return this.isCanSetToRectForReal(indexForImgList, indexRect, obj, isNewItem);
        } else {
            const dataTemp = this.getDataFromTargetDataMap(obj);
            if (dataTemp) {
                return this.isCanSetToRectForReal(dataTemp.index, indexRect, obj, isNewItem);
            }
        }
        return true;
    }
    // indexForImgList 图片索引
    // indexRect 目标方框索引
    // obj 当前拖动的对象
    // isNewItem 是否是新建的对象(新产生的=true  已经产生的二次拖动=false)
    protected isCanSetToRectForReal(indexForImgList: number, indexRect: number, obj: eui.Image, isNewItem: boolean): boolean {
        return true;
    }
    // 扩展方法
    // 每个方框里只能放 numMax 张图片
    protected isCanSetToRectForRectMax(indexRect: number, obj: eui.Image, numMax: number): boolean {

        if (this.targetDataMap[indexRect] && this.targetDataMap[indexRect].length > 0) {

            if (this.targetDataMap[indexRect].length < numMax) {
                return true;
            } else if (this.targetDataMap[indexRect].length == numMax) {
                for (const data of this.targetDataMap[indexRect]) {
                    if (data.obj == obj) {
                        return true;
                    }
                }
                return false;
            } else {
                return false;
            }
        }

        return true;
    }


    // 临时map对象 数据
    protected pushToTarget(obj: eui.Image, indexForImgList: number, indexRect: number) {

        let dataList = null;
        if (this.targetDataMap[indexRect]) {
            dataList = this.targetDataMap[indexRect];
            const data = {obj, index: indexForImgList};
            dataList.push(data);
        } else {
            dataList = [{obj, index: indexForImgList}];
            this.targetDataMap[indexRect] = dataList;
        }

        this.curNumImgList[indexForImgList] ++;
    }
    protected removeToTarget(objCur: eui.Image) {

        for (const key in this.targetDataMap) {
            const dataList = this.targetDataMap[key];
            if (dataList) {
                for (const i in dataList) {
                    const data = dataList[parseInt(i)];
                    if (data) {
                        if (data.obj == objCur) {
                            dataList.splice(i, 1);

                            this.curNumImgList[data.index] --;
                            return;
                        }
                    }
                }
            }
        }
    }
    // 需要test
    protected refreshToTarget(objCur: eui.Image, indexRect: number) {
        for (const key in this.targetDataMap) {
            const dataList = this.targetDataMap[key];
            if (dataList) {
                for (const i in dataList) {
                    const data = dataList[parseInt(i)];
                    if (data) {
                        if (data.obj == objCur) {

                            this.removeToTarget(objCur);
                            this.pushToTarget(data.obj, data.index, indexRect);

                            return;
                        }
                    }
                }
            }
        }
    }
    // 需要判空
    protected getDataFromTargetDataMap(objCur: eui.Image): {obj: eui.Image, index: number} {
        for (const key in this.targetDataMap) {
            const dataList = this.targetDataMap[key];
            if (dataList) {
                for (const i in dataList) {
                    const data = dataList[parseInt(i)];
                    if (data) {
                        if (data.obj == objCur) {
                            return data;
                        }
                    }
                }
            }
        }
        return null;
    }

    protected refreshToIsHideTouchBegin(imgIndex: number) {
        for (const i in this.ImgList) {
            const index = parseInt(i);
            const obj = this.ImgList[index];
            let numCurTake = 0;
            if (index == imgIndex) {
                numCurTake = 1;
            }
            if (obj) {
                if (this.curNumImgList[index] + numCurTake < this.countImgList[index]) {
                    // 数量没超上限
                    obj.visible = true;
                } else {
                    // 数量超过上限
                    obj.visible = false;
                }
            }
        }
    }
    // 每次点击结束都调用
    protected refreshForListTouchEnd() {
        for (const i in this.ImgList) {
            const index = parseInt(i);
            const obj = this.ImgList[index];
            if (obj) {
                if (this.curNumImgList[index] < this.countImgList[index]) {
                    // 数量没超上限
                    obj.visible = true;
                } else {
                    // 数量超过上限
                    obj.visible = false;
                }
            }
        }
    }
    private errorEndEventFunc() {

        if (this.curMoveItemIndex >= -1 && this.curMoveItemObj) {
            // 错误兼容处理 如果上次的没释放.并且错误 .重新处理end
            const errorEndEvent = new egret.TouchEvent(egret.TouchEvent.TOUCH_END, null, null, 999999, 999999);
            this.touchEndLayerEvent(errorEndEvent);
        }
    }

}

