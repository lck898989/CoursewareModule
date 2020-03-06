class OnlyClickForBtnScene extends UIObject {
    // protected scene_Ani:egret.tween.TweenGroup;
    // protected scene_Ani_next:egret.tween.TweenGroup;

    protected ImgList: eui.Image[];
    protected btnNext: eui.Image;

    protected CurState: number = 0;

    public constructor() {
        super();

        this.ImgList = [];
    }

    /** 每次进入 */
    public onAdd(): void {
        // this.scene_Ani.play(0);

        this.CurState = 0;

        this.refreshStateView();

        this.initAddEvent();
    }

    /** 这里进行移出场景的处理 **/
    public onDestroy(): void {
        // this.scene_Ani_next.play(0);
        delete this.ImgList;
        this.ImgList = [];
        this.btnNext.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.touchTapEvent, this);
    }

    public execMessage(data: any): void {
        if (data["next"]) {
            this.revNextLayerHandle();
        }
    }

    protected initAddEvent(): void {
        this.btnNext.addEventListener(egret.TouchEvent.TOUCH_TAP, this.touchTapEvent, this);
    }

    protected touchTapEvent(event: egret.TouchEvent): void {

        if (this.CurState < this.ImgList.length) {
            this.CurState ++;
        }

        this.refreshStateView();

        const msg = {method: "onFileMessage", keyName: "next", value: 1};
        lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));

    }

    protected refreshStateView() {

        for (const i in this.ImgList) {
            const index = parseInt(i);
            const obj = this.ImgList[index];
            if (obj) {
                if (this.CurState <= index) {
                    obj.visible = false;
                } else {
                    obj.visible = true;
                }
            }
        }
    }
    protected revNextLayerHandle(): void {
        this.CurState++;
        this.refreshStateView();
    }
}
