class ClickMoveFromPathScene extends UIObject {
    // protected scene_Ani:egret.tween.TweenGroup;
    // protected scene_Ani_next:egret.tween.TweenGroup;

    // 图片列表
    protected ImgSelectedList: egret.DisplayObject[];

    protected posList: egret.Point[];                   // pos 0 为初始坐标 1 开始为点击坐标   posList 比ImgSelectedList 多1

    protected ImgIndexToPosIndex: number[];

    protected rightRot: number;
    protected isRotation: boolean;
    protected initRot: number;

    protected curPosIndex = 0;
    protected curMoveObj: eui.Image;
    protected curSpeed = 300 / 1000;


    private group: eui.Group;


    public constructor() {
        super();

        this.ImgSelectedList = [];
        this.posList = [];
        this.ImgIndexToPosIndex = [];
        this.rightRot = 0;

        this.isRotation = true;
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

        if (data["moveToPosForIndex"]) {
            const index: number = Number(data["moveToPosForIndex"]["index"]);
            this.moveToPosForIndex(index);
        }
    }

    protected initData() {

        this.curPosIndex = 0;

        if (this.curMoveObj) {
            this.initRot = this.curMoveObj.rotation;
            if (this.posList[0]) {
                const pos = this.posList[0];
                const obj = this.curMoveObj;

                obj.x = pos.x;
                obj.y = pos.y;

                this.curPosIndex = 0;
            }
        }

    }
    protected getAngle(px1: number, py1: number, px2: number, py2: number) {
        // 两点的x、y值
        const x = px2 - px1;
        const y = py2 - py1;
        const hypotenuse = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        // 斜边长度
        const cos = x / hypotenuse;
        const radian = Math.acos(cos);
        // 求出弧度
        let angle = 180 / (Math.PI / radian);
        // 用弧度算出角度
        if (y < 0) {
            angle = -angle;
        } else if ((y == 0) && (x < 0)) {
            angle = 180;
        }
        return angle;
    }
    protected moveToPosForIndex(imgIndex: number) {

        if (!this.curMoveObj) {
            return;
        }

        const setRotFunc = function(pos: egret.Point, index: number) {

            this.setPosIndex(index);

            const obj = this.curMoveObj;

            const angle = this.getAngle(obj.x, obj.y, pos.x, pos.y);
            if (this.isRotation) {
                obj.rotation = angle + this.rightRot;
            }
        };

        const posList = [];
        let oldPosIndex = 0;
        let newPosIndex = 1;
        if (this.curPosIndex == 0) {
            oldPosIndex = 0;
        } else {
            oldPosIndex = this.curPosIndex;
        }
        newPosIndex = this.ImgIndexToPosIndex[imgIndex];

        if (oldPosIndex < newPosIndex) {
            for (let i = oldPosIndex + 1; i <= newPosIndex; i++) {
                const pos = this.posList[i];
                if (pos) {
                    posList.push(pos);
                }
            }
        } else if (oldPosIndex > newPosIndex) {
            for (let i = oldPosIndex - 1; i >= newPosIndex; i--) {
                const pos = this.posList[i];
                if (pos) {
                    posList.push(pos);
                }
            }
        } else {
            this.moveCallBack(imgIndex);
            return;
        }

        if (posList.length > 0) {
            egret.Tween.removeTweens(this.curMoveObj);

            const timeStart = egret.Point.distance(new egret.Point(this.curMoveObj.x, this.curMoveObj.y), posList[0]) / this.curSpeed;
            let curTween = egret.Tween.get(this.curMoveObj).call(setRotFunc, this, [posList[0], oldPosIndex + 0]).to({x: posList[0].x, y: posList[0].y}, timeStart);
            if (posList.length > 1) {
                for (let i = 1; i < posList.length; i++) {
                    const index = i;
                    const timeTemp = egret.Point.distance(posList[index - 1], posList[index]) / this.curSpeed;
                    const tempTween = curTween.call(setRotFunc, this, [posList[index], oldPosIndex + index]).to({x: posList[index].x, y: posList[index].y}, timeTemp);
                    curTween = tempTween;
                }
            }
            curTween.call(this.moveCallBack, this, [imgIndex]);

        }

    }
    protected setPosIndex(posIndex: number) {
        this.curPosIndex = posIndex;
    }
    // 没有 0
    protected moveCallBack(imgIndex: number) {

        this.curPosIndex = this.ImgIndexToPosIndex[imgIndex];

    }

    protected initAddEvent(): void {
        if (this.ImgSelectedList) {
            for (const obj of this.ImgSelectedList) {
                obj.addEventListener(egret.TouchEvent.TOUCH_TAP, this.touchTapImgEvent, this);
            }
        }

    }

    protected resetData() {
        // for(let index in this.ImgSelectedList){
        //     let obj = this.ImgSelectedList[parseInt(index)]
        //     if(obj){
        //         obj.visible = true
        //     }
        // }
    }

    protected touchTapImgEvent(event: egret.TouchEvent): void {

        const index = this.ImgSelectedList.indexOf(event.currentTarget);

        if (index > -1) {

            this.moveToPosForIndex(index);

            const obj: Object = new Object();
            obj["index"] = (index).toString();
            const msg = {method: "onFileMessage", keyName: "moveToPosForIndex", value: obj};
            lcp.LListener.getInstance().dispatchEvent(new lcp.LEvent("tky_makepost", msg, false));

        } else {
            Log.trace("ClickMoveFromPathScene", " touchTapChooseRectEvent error  index error ");
        }

    }
    protected destroyData() {

        this.resetData();

        if (this.curMoveObj) {
            this.curMoveObj.rotation = this.initRot;
            egret.Tween.removeTweens(this.curMoveObj);
        }

        delete this.ImgSelectedList;
        this.ImgSelectedList = [];

        delete this.posList;
        this.posList = [];

        delete this.ImgIndexToPosIndex;
        this.ImgIndexToPosIndex = [];

        this.rightRot = 0;
    }
    protected destroyEvent() {

        if (this.ImgSelectedList) {
            for (const obj of this.ImgSelectedList) {
                obj.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.touchTapImgEvent, this);
            }
        }

    }

}
