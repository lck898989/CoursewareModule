class DropToRuleRectScene extends UIObject {
    // protected scene_Ani:egret.tween.TweenGroup;
    // protected scene_Ani_next:egret.tween.TweenGroup;

    // 初始上来有的图片, 需要拖动的图片
    protected ImgList: eui.Image[];
    // 初始图片的坐标
    protected imgPosList: egret.Point[];
    // 拖动规则的Rect
    protected ruleRectList: eui.Rect[];

    protected objIndexToSiteIndexMap;         // obj对应site
    protected siteIndexToObjIndexMap;         // site 对应obj

    private group: eui.Group;
    protected curMoveIndex: number;

    public constructor() {
        super();

        this.ImgList = [];
        this.ruleRectList = [];
        this.imgPosList = [];
        this.curMoveIndex = -1;
        this.objIndexToSiteIndexMap = {};
        this.siteIndexToObjIndexMap = {};

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
        this.resetImgPosForList();
        this.destoryEvent();
        this.destoryData();

    }


    /** 收到信令消息 */
    public execMessage(data: any): void {
        if (data["touchMove"]) {
            const name: string = data["touchMove"]["name"];
            const targetX: number = Number(data["touchMove"]["targetX"]);
            const targetY: number = Number(data["touchMove"]["targetY"]);
            this.revMoveingHandle(name, targetX, targetY);
        } else if (data["touchEndLayer"]) {
            const moveName: string = data["touchEndLayer"]["moveName"];
            const moveSite: string = data["touchEndLayer"]["moveSite"];
            this.revMoveEndLayerHandle(moveName, moveSite);
        }
    }
    protected initData() {

        this.siteIndexToObjIndexMap = {};
        this.objIndexToSiteIndexMap = {};

        this.curMoveIndex = -1;

        this.imgPosList = [];
        for (let i = 0; i < this.ImgList.length; i++) {
            const obj = this.ImgList[i];
            if (obj) {
                this.imgPosList.push(new egret.Point(obj.x, obj.y));
            }
            this.objIndexToSiteIndexMap[i] = -1;
        }
        for (let i = 0; i < this.ruleRectList.length; i++) {
            this.siteIndexToObjIndexMap[i] = -1;
        }
    }

    protected initAddEvent(): void {
        for (const obj of this.ImgList) {
            obj.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBeginEvent, this);
        }
        for (const rectObj of this.ruleRectList) {
            rectObj.touchEnabled = false;
        }

        this.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEndLayerEvent, this);
        this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchMoveLayerEvent, this);

    }
    protected resetImgPosForList() {
        for (const index in this.ImgList) {
            const obj = this.ImgList[index];
            const pos = this.imgPosList[index];
            if (obj && pos) {
                obj.x = pos.x;
                obj.y = pos.y;
            }
        }
    }
    protected destoryData() {

        this.curMoveIndex = -1;

        delete this.siteIndexToObjIndexMap;
        this.siteIndexToObjIndexMap = {};

        delete this.objIndexToSiteIndexMap;
        this.objIndexToSiteIndexMap = {};

        delete this.ImgList;
        this.ImgList = [];

        delete this.ruleRectList;
        this.ruleRectList = [];

        delete this.imgPosList;
        this.imgPosList = [];
    }
    protected destoryEvent() {
        for (const obj of this.ImgList) {
            obj.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBeginEvent, this);
        }
        for (const rectObj of this.ruleRectList) {
            rectObj.touchEnabled = false;
        }

        this.removeEventListener(egret.TouchEvent.TOUCH_END, this.touchEndLayerEvent, this);
        this.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchMoveLayerEvent, this);

    }

    protected touchBeginEvent(event: egret.TouchEvent): void {

        const curIndex = this.ImgList.indexOf(event.target);
        if (curIndex >= 0) {

            const childIndex = this.group.numChildren;
            this.group.setChildIndex(event.target, childIndex - 1);

            this.curMoveIndex = curIndex;
        }

    }

    protected touchMoveLayerEvent(event: egret.TouchEvent): void {

        if (this.curMoveIndex >= 0) {

            const target = this.ImgList[this.curMoveIndex];

            if (target) {
                const stageX = event.stageX;
                const stageY = event.stageY;

                const posTarget = this.globalToLocal(stageX, stageY);
                target.x = posTarget.x - target.width / 2;
                target.y = posTarget.y - target.height / 2;

                // 给学生发送信令  移动中
                const obj: Object = new Object();
                obj["name"] = this.curMoveIndex.toString();
                obj["targetX"] = target.x;
                obj["targetY"] = target.y;

                const msg = {method: "onFileMessage", keyName: "touchMove", value: obj};
                lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));


            }
        }
    }

    protected touchEndLayerEvent(event: egret.TouchEvent): void {
        let moveName = "";
        let moveSite = "";
        if (this.curMoveIndex >= 0) {

            const target = this.ImgList[this.curMoveIndex];
            if (target) {

                // 2位以上 位点击的上边
                const stageX = event.stageX;
                const stageY = event.stageY;
                const siteIndex = this.getSiteIndexForGlobalPos(stageX, stageY);
                if (siteIndex >= 0) {
                    if (this.isCanSetForSiteIndex(siteIndex)) {
                        // 没有东西  放置数据
                        const oldSiteIndex = this.objIndexToSiteIndexMap[this.curMoveIndex];
                        if (oldSiteIndex >= 0) {
                            this.siteIndexToObjIndexMap[oldSiteIndex] = -1;
                        }

                        this.siteIndexToObjIndexMap[siteIndex] = this.curMoveIndex;
                        this.objIndexToSiteIndexMap[this.curMoveIndex] = siteIndex;

                        moveName = this.curMoveIndex.toString();
                        moveSite = siteIndex.toString();
                    }
                } else {
                    const oldSiteIndex = this.objIndexToSiteIndexMap[this.curMoveIndex];
                    if (oldSiteIndex >= 0) {
                        this.siteIndexToObjIndexMap[oldSiteIndex] = -1;
                    }

                    this.objIndexToSiteIndexMap[this.curMoveIndex] = -1;

                    moveName = this.curMoveIndex.toString();
                    moveSite = "-1";
                }
            }

        }

        this.curMoveIndex = -1;

        this.refreshView();


        // 给学生发送信令  移动中
        const obj: Object = new Object();
        obj["moveName"] = moveName;
        obj["moveSite"] = moveSite;

        const msg = {method: "onFileMessage", keyName: "touchEndLayer", value: obj};
        lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));


    }

    protected isCanSetForSiteIndex(siteIndex: number): boolean {
        if (this.siteIndexToObjIndexMap[siteIndex] != null && this.siteIndexToObjIndexMap[siteIndex] >= 0) {
            return false;
        }
        return true;
    }

    protected getSiteIndexForGlobalPos(xGlobal: number, yGlobal: number): number {
        const localPos = this.globalToLocal(xGlobal, yGlobal);
        const curX = localPos.x;
        const curY = localPos.y;

        for (const siteIndex in this.ruleRectList) {
            const rectObj = this.ruleRectList[siteIndex];
            if (rectObj) {
                if (rectObj.hitTestPoint(curX, curY)) {
                    return parseInt(siteIndex);
                }
            }
        }
        return -1;
    }

    protected refreshView() {

        for (const objIndex in this.ImgList) {
            const obj = this.ImgList[objIndex];
            if (obj) {
                if (this.objIndexToSiteIndexMap[objIndex] != null && this.objIndexToSiteIndexMap[objIndex] >= 0) {
                    // 位置不在初始位置
                    const siteIndex = this.objIndexToSiteIndexMap[objIndex];
                    if (this.ruleRectList[siteIndex]) {
                        const rectObj = this.ruleRectList[siteIndex];
                        obj.x = rectObj.x + rectObj.width / 2 -  obj.width / 2;
                        obj.y = rectObj.y + rectObj.height / 2 -  obj.height / 2;
                    }
                } else {
                    // 位置在初始位置
                    if (this.imgPosList[objIndex]) {
                        const pos = this.imgPosList[objIndex];
                        obj.x = pos.x;
                        obj.y = pos.y;
                    }
                }
            }
        }

    }
    protected revMoveingHandle(name: string, targetX: number, targetY: number): void {

        if (name && name.length > 0) {

            const objIndex = parseInt(name);
            if (objIndex != null && this.ImgList[objIndex]) {
                const targetObj = this.ImgList[objIndex];

                if (targetObj) {
                    targetObj.x = targetX;
                    targetObj.y = targetY;

                    const childIndex = this.group.numChildren;
                    this.group.setChildIndex(targetObj, childIndex - 1);
                } else {
                    Log.trace("DropToRuleRectScene", "revMoveingHandle data error please check");
                }
            }
        } else {
            Log.trace("DropToRuleRectScene", "revMoveingHandle data error please check");
        }

    }

    /** 接收停止移动 */
    protected revMoveEndLayerHandle(moveName: string, moveSite: string): void {
        if (moveName && moveSite && moveSite.length > 0 && moveName.length > 0) {
            const objIndex = parseInt(moveName);
            const siteIndex = parseInt(moveSite);

            if (siteIndex >= 0) {
                const oldSiteIndex = this.objIndexToSiteIndexMap[objIndex];
                if (oldSiteIndex >= 0) {
                    this.siteIndexToObjIndexMap[oldSiteIndex] = -1;
                }

                this.siteIndexToObjIndexMap[siteIndex] = objIndex;
                this.objIndexToSiteIndexMap[objIndex] = siteIndex;
            } else {
                const oldSiteIndex = this.objIndexToSiteIndexMap[objIndex];
                if (oldSiteIndex >= 0) {
                    this.siteIndexToObjIndexMap[oldSiteIndex] = -1;
                }

                this.objIndexToSiteIndexMap[objIndex] = -1;
            }

        } else {
            Log.trace("DropToRuleRectScene", "revMoveEndHandle data error please check");
        }

        this.refreshView();

    }
}
