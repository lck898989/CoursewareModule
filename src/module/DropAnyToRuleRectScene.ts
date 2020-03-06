class DropAnyToRuleRectScene extends UIObject {
    // protected scene_Ani:egret.tween.TweenGroup;
    // protected scene_Ani_next:egret.tween.TweenGroup;

    // 初始上来有的图片, 需要拖动的图片
    protected ImgList: eui.Image[];
    // 初始图片的坐标
    protected imgPosList: egret.Point[];
    // 拖动规则的Rect
    protected ruleRectList: eui.Rect[];

    protected group: eui.Group;
    protected curMoveIndex: number;


    public constructor() {
        super();

        this.ImgList = [];
        this.ruleRectList = [];
        this.imgPosList = [];
        this.curMoveIndex = -1;

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
            const targetX: number = Number(data["touchEndLayer"]["targetX"]);
            const targetY: number = Number(data["touchEndLayer"]["targetY"]);
            const isResetStr: string = data["touchEndLayer"]["isResetStr"];

            this.revMoveEndLayerHandle(moveName, isResetStr, targetX, targetY);
        }
    }
    protected initData() {


        this.curMoveIndex = -1;

        this.imgPosList = [];
        for (let i = 0; i < this.ImgList.length; i++) {
            const obj = this.ImgList[i];
            if (obj) {
                this.imgPosList.push(new egret.Point(obj.x, obj.y));
            }
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
        let isResetStr = "true";
        if (this.curMoveIndex >= 0) {

            const target = this.ImgList[this.curMoveIndex];
            if (target) {

                // 2位以上 位点击的上边
                const stageX = event.stageX;
                const stageY = event.stageY;
                const siteIndex = this.getSiteIndexForGlobalPos(stageX, stageY);
                if (siteIndex >= 0) {

                    // 没有东西  放置数据
                    const posTarget = this.globalToLocal(stageX, stageY);
                    target.x = posTarget.x - target.width / 2;
                    target.y = posTarget.y - target.height / 2;

                    moveName = this.curMoveIndex.toString();
                    isResetStr = "false";

                } else {

                    if (this.imgPosList[this.curMoveIndex]) {
                        const pos = this.imgPosList[this.curMoveIndex];
                        target.x = pos.x;
                        target.y = pos.y;
                    }

                    moveName = this.curMoveIndex.toString();
                    isResetStr = "true";
                }
            }

            this.curMoveIndex = -1;


            // 给学生发送信令  移动中
            const obj: Object = new Object();
            obj["moveName"] = moveName;
            obj["targetX"] = target.x;
            obj["targetY"] = target.y;
            obj["isResetStr"] = isResetStr;

            const msg = {method: "onFileMessage", keyName: "touchEndLayer", value: obj};
            lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));

        }

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
    protected revMoveingHandle(name: string, targetX: number, targetY: number): void {

        if (name && name.length > 0) {

            if (this.ImgList[name]) {
                const targetObj = this.ImgList[name];

                if (targetObj) {
                    targetObj.x = targetX;
                    targetObj.y = targetY;

                    const childIndex = this.group.numChildren;
                    this.group.setChildIndex(targetObj, childIndex - 1);
                } else {
                    Log.trace("DropAnyToRuleRectScene", "revMoveingHandle data error please check");
                }
            }
        } else {
            Log.trace("DropAnyToRuleRectScene", "revMoveingHandle data error please check");
        }

    }

    /** 接收停止移动 */
    protected revMoveEndLayerHandle(moveIndex: string, isResetStr: string, targetX: number, targetY: number): void {


        const target = this.ImgList[moveIndex];
        if (target) {

            // 2位以上 位点击的上边
            const stageX = targetX;
            const stageY = targetY;
            if (isResetStr == "false") {

                // 没有东西  放置数据
                const posTarget = this.globalToLocal(stageX, stageY);
                target.x = posTarget.x;
                target.y = posTarget.y;

            } else {

                if (this.imgPosList[moveIndex]) {
                    const pos = this.imgPosList[moveIndex];
                    target.x = pos.x;
                    target.y = pos.y;
                }

            }
        } else {
            Log.trace("DropAnyToRuleRectScene", "revMoveEndLayerHandle data error please check");
        }

    }
}
