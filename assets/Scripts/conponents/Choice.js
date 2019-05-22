var option = cc.Class({
    name: 'option',
    properties: {
        spriteFrame: cc.SpriteFrame,
        callback: [cc.Component.EventHandler]
    }
});
cc.Class({
    extends: Script,

    properties: {
        option: [option],
        index: 0,
    },

    onLoad() {
        var self = this;
        self.Sprite = self.node.Sprite;
        self.node.on(cc.Node.EventType.TOUCH_END, self.onTouchEnd, self);
        self.node.on(cc.Node.EventType.TOUCH_CANCEL, self.onTouchCancel, self);
    },

    /**监听触摸节点内松开
     *
     * @param e 触摸事件
     */
    onTouchEnd(e) {
        var self = this;
        self.index++;
        if (self.index >= self.option.length)
            self.index = 0;
        self.Sprite.spriteFrame = self.option[self.index].spriteFrame;
        var callback = self.option[self.index].callback,
            event = null;
        for (let i = 0, len = callback.length; i < len; i++) {
            event = self.analysisEventHandler(callback[i]);
            event.callback.call(event.target, callback[i].customEventData);
            event = null;
        }
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

    /**监听触摸节点外松开
     *
     * @param e 触摸事件
     */
    onTouchCancel(e) {
        this.onTouchEnd(e);
    },

});
