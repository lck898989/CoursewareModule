/**
 * by zheng
 * 点击任意组件显示下一阶段
 * @param clickItemArr  点击的组件数组
 * @param showPhaseArr  显示下一场景数组
 * @param showIndexArr  显示阶段索引
 * 请一一对应
 */
class ClickItemForShowPhaseScene extends UIObject {
    protected clickItemArr: egret.DisplayObject[];
    protected showPhaseArr: egret.DisplayObject[][];
    protected showIndexArr: number[];
    protected backImg: eui.Image;

    public constructor() {
        super();

        this.clickItemArr = new Array<egret.DisplayObject>();
        this.showPhaseArr = new Array<egret.DisplayObject[]>();
        this.showIndexArr = new Array<number>();
    }

    /** 这里进行移出场景的处理 **/
    public onDestroy(): void {
        for (let i: number = 0; i < this.clickItemArr.length; i++) {
            this.clickItemArr[i].removeEventListener(egret.TouchEvent.TOUCH_TAP, this.doShowNextPhaseItemHandle, this);
        }

        for (let i: number = 0; i < this.showPhaseArr.length; i++) {
            for (let j: number = 0; j < this.showPhaseArr[i].length; j++) {
                this.showPhaseArr[i][j].visible = false;
            }
            this.showIndexArr[i] = 0;
        }
        if (this.backImg) {
            this.backImg.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.doBackInitHandle, this);
        }
    }

    /** 接收信令 */
    public execMessage(data: any): void {
        if (data["showPhase"]) {
            const nIndex: number = Number(data["showPhase"]["name"]);
            const phase: number = Number(data["showPhase"]["phase"]);
            this.showPhaseArr[nIndex - 1][phase].visible = true;
            this.showIndexArr[nIndex - 1] = phase;
        } else if (data["backInit"]) {
            this.initScene();
        }
    }

    /** 初始化场景 */
    protected initScene(): void {
        if (this.clickItemArr.length <= 0 || this.showPhaseArr.length <= 0) {
            return;
        }

        this.showIndexArr = [];

        for (let i: number = 0; i < this.clickItemArr.length; i++) {
            this.clickItemArr[i].addEventListener(egret.TouchEvent.TOUCH_TAP, this.doShowNextPhaseItemHandle, this);
            this.clickItemArr[i].name = String(i + 1);
        }

        for (let i: number = 0; i < this.showPhaseArr.length; i++) {
            for (let j: number = 0; j < this.showPhaseArr[i].length; j++) {
                this.showPhaseArr[i][j].name = String(i + 1) + "_" + String(j);
                this.showPhaseArr[i][j].visible = false;
            }
            const index: number = 0;
            this.showIndexArr.push(index);
        }

        if (this.backImg) {
            this.backImg.addEventListener(egret.TouchEvent.TOUCH_TAP, this.doBackInitHandle, this);
        }
    }

    /** 点击显示下一阶段 */
    protected doShowNextPhaseItemHandle(e: egret.TouchEvent): void {
        const nIndex: string = e.currentTarget.name;
        if (this.showIndexArr[Number(nIndex) - 1] > this.showPhaseArr[Number(nIndex) - 1].length - 1) {
            return;
        }
        this.showPhaseArr[Number(nIndex) - 1][this.showIndexArr[Number(nIndex) - 1]].visible = true;
        this.showIndexArr[Number(nIndex) - 1]++;

        const obj: Object = new Object();
        obj["name"] = nIndex;
        obj["phase"] = this.showIndexArr[Number(nIndex) - 1] - 1;
        const msg = {method: "onFileMessage", keyName: "showPhase", value: obj};
        lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));

    }

    /** 返回初始状态 */
    private doBackInitHandle(): void {
        this.initScene();
        const msg = {method: "onFileMessage", keyName: "backInit", value: 1};
        lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));
    }
}
