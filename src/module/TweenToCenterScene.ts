class TweenToCenterScene extends UIObject {
    // protected scene_Ani:egret.tween.TweenGroup;
    // protected scene_Ani_next:egret.tween.TweenGroup;

    // 初始左边 需要移动的图片
    protected ImgLeftList: eui.Image[];
    protected posLeftList: egret.Point[];
    // 初始右边需要移动的图片
    protected ImgRightList: eui.Image[];
    protected posRightList: egret.Point[];

    // 左侧动画 偏移量
    protected posLeftOff: egret.Point;
    // 右侧动画 偏移量
    protected posRightOff: egret.Point;

    protected ImgHideList: eui.Image[];
    protected ImgShowList: eui.Image[];

    protected numTweenTime: number;
    protected numCurTween: number;

    protected btnMerge: eui.Image;


    public constructor() {
        super();

        this.ImgLeftList = [];
        this.ImgRightList = [];
        this.ImgHideList = [];
        this.ImgShowList = [];

        this.numTweenTime = 1000;
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
        this.resetData();
        this.destoryData();

    }

    public execMessage(data: any): void {
        if (data["startTweenMerge"]) {
            this.startTweenMerge();
        }
    }
    protected initData() {

        this.numCurTween = 0;

        this.posLeftList = [];
        for (const index in this.ImgLeftList) {
            const obj = this.ImgLeftList[index];
            if (obj) {
                this.posLeftList[parseInt(index)] = new egret.Point(obj.x, obj.y);
            }
        }
        this.posRightList = [];
        for (const index in this.ImgRightList) {
            const obj = this.ImgRightList[index];
            if (obj) {
                this.posRightList[parseInt(index)] = new egret.Point(obj.x, obj.y);
            }
        }

        this.resetAllTweenAndPos();
    }
    protected initAddEvent(): void {
        this.btnMerge.addEventListener(egret.TouchEvent.TOUCH_TAP, this.touchTapEvent, this);
    }

    protected touchTapEvent(event: egret.TouchEvent): void {

        this.startTweenMerge();

        const msg = {method: "onFileMessage", keyName: "startTweenMerge", value: 1};
        lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));

    }
    protected startTweenMerge() {
        const self = this;
        this.numCurTween = 0;
        this.resetAllTweenAndPos();

        const tweenBackFunc = function() {
            self.removeNumCurTween();
            if (self.numCurTween <= 0) {
                // 全部移动完成
                self.endTweenMerge();
            }
        };

        const tweenStartFunc = function(obj: eui.Image, posOff: egret.Point) {
            self.addNumCurTween();
            const posX = obj.x + posOff.x;
            const posY = obj.y + posOff.y;
            egret.Tween.get(obj).to({ x: posX, y: posY}, self.numTweenTime).call(tweenBackFunc);
        };

        for (const obj of this.ImgLeftList) {
            tweenStartFunc(obj, this.posLeftOff);
        }
        for (const obj of this.ImgRightList) {
            tweenStartFunc(obj, this.posRightOff);
        }
    }
    protected resetAllTweenAndPos() {
        for (const index in this.ImgLeftList) {
            const obj = this.ImgLeftList[index];
            const pos = this.posLeftList[index];
            if (obj && pos) {
                obj.x = pos.x;
                obj.y = pos.y;

                egret.Tween.removeTweens(obj);
            }
        }
        for (const index in this.ImgRightList) {
            const obj = this.ImgRightList[index];
            const pos = this.posRightList[index];
            if (obj && pos) {
                obj.x = pos.x;
                obj.y = pos.y;

                egret.Tween.removeTweens(obj);
            }
        }
        for (const obj of this.ImgShowList) {
            obj.visible = false;
        }
        for (const obj of this.ImgHideList) {
            obj.visible = true;
        }
    }
    protected addNumCurTween() {
        this.numCurTween++;
    }
    protected removeNumCurTween() {
        this.numCurTween--;
    }
    protected endTweenMerge() {
        for (const obj of this.ImgHideList) {
            obj.visible = false;
        }
        for (const obj of this.ImgShowList) {
            obj.visible = true;
        }
    }

    protected resetData() {
        this.resetAllTweenAndPos();
    }
    protected destoryData() {

        delete this.ImgLeftList;
        this.ImgLeftList = [];

        delete this.posLeftList;
        this.posLeftList = [];

        delete this.ImgRightList;
        this.ImgRightList = [];

        delete this.posRightList;
        this.posRightList = [];

        delete this.ImgHideList;
        this.ImgHideList = [];

        delete this.ImgShowList;
        this.ImgShowList = [];

    }
    protected destoryEvent() {
        this.btnMerge.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.touchTapEvent, this);
    }

}
