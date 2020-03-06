class BalanceComponent {

    // 两侧的固定列表  图片 && rect
    public imgListLeft: egret.DisplayObject[];
    public imgListRight: egret.DisplayObject[];

    // 中间旋转的列表
    public imgListBalanceLine: eui.Image[];

    // 数据
    // 重量
    public numWeightLeftInit: number;
    public numWeightRightInit: number;
    public numWeightLeftCur: number;
    public numWeightRightCur: number;
    // 旋转最大角度
    public rotMax = 30;
    // 旋转最大角度 所需要的左右差值
    public numWeightRotMax = 30;
    // 中心点
    public pointCenter: egret.Point;

    public constructor() {

    }

    public initData(): void {
        this.imgListLeft = [];
        this.imgListRight = [];
        this.imgListBalanceLine = [];

        this.numWeightLeftInit = 0;
        this.numWeightRightInit = 0;
        this.numWeightLeftCur = 0;
        this.numWeightRightCur = 0;

        this.rotMax = 30;
        this.numWeightRotMax = 30;
        this.pointCenter = new egret.Point(0, 0);
    }

    public onInit(): void {
        this.startRotTween(0, 0, true);
    }

    public onDestroy(): void {

    }

    public setLeftItemObjList(time: number = null, xTemp: number = null, yTemp: number = null) {

    }
    public setRightItemObjList(time: number = null, xTemp: number = null, yTemp: number = null) {

    }

    public startRotTween(numWeightLeftNew: number, numWeightRightNew: number, isInit: boolean = false) {

        let isReturn = false;
        if (numWeightLeftNew == this.numWeightLeftCur && numWeightRightNew == this.numWeightRightCur) {
            // 和上次的数据相同 return
            isReturn = true;
        }
        if (this.numWeightLeftCur + this.numWeightLeftInit - this.numWeightRightCur - this.numWeightRightInit >= this.numWeightRotMax
            && numWeightLeftNew + this.numWeightLeftInit - numWeightRightNew - this.numWeightRightInit >= this.numWeightRotMax) {
            // 超过旋转上限 return  左侧
            isReturn = true;
        }
        if (this.numWeightRightCur + this.numWeightRightInit - this.numWeightLeftCur - this.numWeightLeftInit >= this.numWeightRotMax
            && numWeightRightNew + this.numWeightRightInit - numWeightLeftNew - this.numWeightLeftInit >= this.numWeightRotMax) {
            // 超过旋转上限 return  右侧
            isReturn = true;
        }
        if (isReturn && !isInit) {
            // left item
            this.setLeftItemObjList();

            // right item
            this.setRightItemObjList();
            return;
        }

        this.numWeightLeftCur = numWeightLeftNew;
        this.numWeightRightCur = numWeightRightNew;

        let time = 200;
        if (isInit) {
            time = 0;
        }
        // 开始旋转
        let ro: number = 0;
        if (this.numWeightLeftCur + this.numWeightLeftInit == this.numWeightRightCur + this.numWeightRightInit) {
            ro = 0;
        } else if (this.numWeightLeftCur + this.numWeightLeftInit == 0) {
            ro = this.rotMax;
        } else if (this.numWeightRightCur + this.numWeightRightInit == 0) {
            ro = - this.rotMax;
        } else {
            let percent = (- this.numWeightLeftCur - this.numWeightLeftInit + this.numWeightRightCur + this.numWeightRightInit) / this.numWeightRotMax;
            if (percent < -1) {
                percent = -1;
            }
            if (percent > 1) {
                percent = 1;
            }
            ro = this.rotMax * percent;
        }
        for (const obj of this.imgListBalanceLine) {
            egret.Tween.removeTweens(obj);
            egret.Tween.get(obj).to({rotation : ro}, time);
        }

        // const half: number = this.baseImg.width / 2 - 33;
        // left
        let leftXTemp = null;
        let leftYTemp = null;
        for (const obj of this.imgListLeft) {
            const half = egret.Point.distance(this.pointCenter, new egret.Point(obj.x, obj.y));
            const leftX: number = this.pointCenter.x - Math.cos(ro * Math.PI / 180) * half;
            const leftY: number = this.pointCenter.y - Math.sin(ro * Math.PI / 180) * half;
            egret.Tween.removeTweens(obj);
            egret.Tween.get(obj).to({x : leftX, y : leftY}, time);
            if (leftXTemp == null) {
                leftXTemp = leftX;
            }
            if (leftYTemp == null) {
                leftYTemp = leftY;
            }
        }

        // right
        let rightXTemp = null;
        let rightYTemp = null;
        for (const obj of this.imgListRight) {
            const half = egret.Point.distance(this.pointCenter, new egret.Point(obj.x, obj.y));
            const rightX: number = this.pointCenter.x + Math.cos(ro * Math.PI / 180) * half;
            const rightY: number = this.pointCenter.y + Math.sin(ro * Math.PI / 180) * half;
            egret.Tween.removeTweens(obj);
            egret.Tween.get(obj).to({x : rightX, y : rightY}, time);
            if (rightXTemp == null) {
                rightXTemp = rightX;
            }
            if (rightYTemp == null) {
                rightYTemp = rightY;
            }
        }


        // left item
        this.setLeftItemObjList(time, leftXTemp, leftYTemp);

        // right item
        this.setRightItemObjList(time, rightXTemp, rightYTemp);

    }

}
