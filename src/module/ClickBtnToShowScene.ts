class ClickBtnToShowScene extends UIObject {
    // protected scene_Ani:egret.tween.TweenGroup;
    // protected scene_Ani_next:egret.tween.TweenGroup;

    protected ImgList: egret.DisplayObject[][];
    protected btnList: egret.DisplayObject[];

    protected CurState: number = -1;

    protected rect_bg: egret.DisplayObject;

    public constructor() {
        super();

        this.btnList = [];
        this.ImgList = [];
    }

    /** 每次进入 */
    public onAdd(): void {
        // this.scene_Ani.play(0);

        this.CurState = -1;

        this.refreshStateView();

        this.initAddEvent();
    }

    /** 这里进行移出场景的处理 **/
    public onDestroy(): void {
        // this.scene_Ani_next.play(0);

        for (const obj of this.btnList) {
            obj.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.touchTapEvent, this);
        }
        if (this.rect_bg) {
            this.rect_bg.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.touchTapBgEvent, this);
        }

        delete this.btnList;
        this.btnList = [];
        delete this.ImgList;
        this.ImgList = [];
    }

    public execMessage(data: any): void {
        if (data["refreshState"] != null) {

            this.revNextLayerHandle(data["refreshState"]);
        }
    }

    protected initAddEvent(): void {
        for (const obj of this.btnList) {
            obj.addEventListener(egret.TouchEvent.TOUCH_TAP, this.touchTapEvent, this);
        }
        if (this.rect_bg) {
            this.rect_bg.addEventListener(egret.TouchEvent.TOUCH_TAP, this.touchTapBgEvent, this);
        }
    }

    protected touchTapEvent(event: egret.TouchEvent): void {

        const index = this.btnList.indexOf(event.currentTarget);
        if (index <= -1) {
            return;
        }

        this.CurState = index;
        this.refreshStateView();

        CommunicationManager.getInstance().makePostMessage("onFileMessage", "refreshState", this.CurState);
    }

    protected touchTapBgEvent(event: egret.TouchEvent): void {

        this.CurState = -1;
        this.refreshStateView();

        CommunicationManager.getInstance().makePostMessage("onFileMessage", "refreshState", this.CurState);
    }

    protected refreshStateView() {

        if (this.CurState <= -1) {
            for (const tempList of this.ImgList) {
                if (tempList && tempList.length > 0) {
                    for (const obj of tempList) {
                        obj.visible = false;
                    }
                }
            }
        } else {
            for (const tempList of this.ImgList) {
                if (tempList && tempList.length > 0) {
                    for (const obj of tempList) {
                        obj.visible = false;
                    }
                }
            }

            if (this.ImgList[this.CurState]) {
                const tempList = this.ImgList[this.CurState];

                if (tempList.length > 0) {
                    for (const obj of tempList) {
                        obj.visible = true;
                    }
                }
            }
        }

    }
    protected revNextLayerHandle(index: number): void {

        this.CurState = index;

        this.refreshStateView();
    }
}
