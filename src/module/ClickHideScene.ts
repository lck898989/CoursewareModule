class ClickHideScene extends UIObject {
    // protected scene_Ani:egret.tween.TweenGroup;
    // protected scene_Ani_next:egret.tween.TweenGroup;

    // 单选图片列表
    protected ImgSelectedList: eui.Image[];

    protected btnReset: eui.Image;

    private group: eui.Group;


    public constructor() {
        super();

        this.ImgSelectedList = [];
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

        this.destroyEvent();
        this.destroyData();

    }


    public execMessage(data: any): void {
        if (data["choose"]) {
            const chooseIndex: number = parseInt(data["choose"]["chooseIndex"]);
            this.revChooseHandle(chooseIndex);
        } else if (data["reset"]) {
             this.resetData();
        }
    }

    protected initData() {

        for (const index in this.ImgSelectedList) {
            const obj = this.ImgSelectedList[parseInt(index)];
            if (obj) {
                obj.visible = true;
            }
        }

    }

    protected initAddEvent(): void {
        if (this.ImgSelectedList) {
            for (const obj of this.ImgSelectedList) {
                obj.addEventListener(egret.TouchEvent.TOUCH_TAP, this.touchTapImgEvent, this);
            }
        }

        if (this.btnReset) {
            this.btnReset.addEventListener(egret.TouchEvent.TOUCH_TAP, this.touchTapResetEvent, this);
        }
    }

    protected resetData() {
        for (const index in this.ImgSelectedList) {
            const obj = this.ImgSelectedList[parseInt(index)];
            if (obj) {
                obj.visible = true;
            }
        }
    }

    protected touchTapImgEvent(event: egret.TouchEvent): void {

        const index = this.ImgSelectedList.indexOf(event.currentTarget);

        if (index > -1) {

            for (const indexTemp in this.ImgSelectedList) {
                const obj = this.ImgSelectedList[parseInt(indexTemp)];
                if (obj) {
                    if (parseInt(indexTemp) == index) {
                        obj.visible = false;
                    }

                }
            }

            const _obj: Object = new Object();
            _obj["chooseIndex"] = index.toString();
            const msg = {method: "onFileMessage", keyName: "choose", value: _obj};
            lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));

        } else {
            Log.trace("ClickHideScene", " touchTapChooseRectEvent error  index error ");
        }

    }
    protected destroyData() {

        this.resetData();

        delete this.ImgSelectedList;
        this.ImgSelectedList = [];

    }
    protected destroyEvent() {

        if (this.ImgSelectedList) {
            for (const obj of this.ImgSelectedList) {
                obj.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.touchTapImgEvent, this);
            }
        }

        if (this.btnReset) {
            this.btnReset.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.touchTapResetEvent, this);
        }

    }

    protected touchTapResetEvent(event: egret.TouchEvent): void {

        this.resetData();
        const msg = {method: "onFileMessage", keyName: "reset", value: "1"};
        lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));

    }

    protected revChooseHandle(chooseIndex: number): void {
        if (chooseIndex > -1) {

            for (const indexTemp in this.ImgSelectedList) {
                const obj = this.ImgSelectedList[parseInt(indexTemp)];
                if (obj) {
                    if (parseInt(indexTemp) == chooseIndex) {
                        obj.visible = false;
                    }

                }
            }
        }
    }

}
