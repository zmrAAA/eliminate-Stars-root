cc.Class({
    extends: cc.Slider,

    properties: {
        max_Num: 10,                //最大值
        editBox_Num: cc.EditBox,    //显示框
        callback: [cc.Component.EventHandler]
    },

    start() {
        this.editBox_Num.placeholder = '';
        this.updateProgress();
    },

    updateProgress() {
        var self = this,
            num = parseInt(self.editBox_Num.string);
        if (isNaN(num)) {
            self.editBox_Num.string = '';
            return;
        }
        var progress = num / self.max_Num;
        if (progress > 1) {
            progress = 1;
            num = self.max_Num;
        }
        self.progress = progress;
        self.editBox_Num.string = num;
        self.call();
    },

    updateEditBox() {
        var self = this, progress = self.progress;
        self.editBox_Num.string = parseInt(self.max_Num * progress);
        self.updateProgress();
        self.call();
    },

    /**监听触摸节点内松开
     *
     * @param e 触摸事件
     */
    call(e) {
        var self = this,
            callback = self.callback,
            i = 0,
            len = callback.length,
            event = null;
        for (; i < len; i++) {
            event = self.analysisEventHandler(callback[i]);
            event.callback.call(event.target, callback[i].customEventData);
            event = null;
        }
        callback = null;
    },

    /**解析回调信息
     *
     */
    analysisEventHandler(eventHandler) {
        var target = eventHandler.target.getComponent(eventHandler.component);
        return {
            target: target,
            callback: target[eventHandler.handler],
        };
    },

    setMax_Num(num) {
        this.max_Num = num;
        this.updateProgress();
    },

    getNum() {
        var num = parseInt(this.editBox_Num.string);
        return isNaN(num) ? 0 : num;
    }
});
