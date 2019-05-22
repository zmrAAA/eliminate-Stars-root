/**选择器组件
 *
 */
cc.Class({
    extends: Script,

    properties: {
        isBank: false,          //是否是银行
        option: [cc.String],    //选项
        item: cc.Prefab,        //预制
        content: cc.Node,       //layout
        max_Height: 200,        //限制高
        view_Mask: cc.Node,     //遮罩
        btn_Open: cc.Node,      //开启选项
        currentOption: cc.Label,//显示选项的label
        _active_Potion: true,   //当前是否有打开选项框
        callback: [cc.Component.EventHandler]   //每次选择后的回调
    },

    /**程序入口
     *
     */
    start() {
        var self = this;
        self.initPoint();
        self.updateCurrentOption(String(self.option[0]));
        Global.addClickEvent(self.btn_Open, self.node, 'ChoiceScrollView', 'active_Potion');
    },

    /**初始化
     *
     */
    initPoint() {
        var self = this,
            option = self.option,
            parent = self.content;
        for (let i = 0, len = option.length; i < len; i++) {
            var node = cc.instantiate(self.item);
            node.parent = parent;
            node.children[0].i18n_Label.string = self.getStr(option[i]);
            Global.addClickEvent(node, self.node, 'ChoiceScrollView', 'updateCurrentOption', option[i]);
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


    /**获取转换后的字符串
     *
     * @param str   需要转换的字符串
     */
    getStr(str) {
        str = Global.i18n.get(str);
        if (!this.isBank)
            return str;
        var regular = Global.gameConfig.bank.regular;
        str = str.replace('#0#', String(regular.interestRate_0 * 100) + '%');
        str = str.replace('#1#', String(regular.interestRate_1 * 100) + '%');
        str = str.replace('#3#', String(regular.interestRate_3 * 100) + '%');
        str = str.replace('#6#', String(regular.interestRate_6 * 100) + '%');
        return str;
    },

    /**开启或关闭选项
     *
     */
    active_Potion() {
        var self = this;
        if (!self._active_Potion) {
            self.view_Mask.height = self.max_Height;
            self._active_Potion = true;
        } else {
            self.view_Mask.height = 0;
            self._active_Potion = false;
        }
    },

    /**更新当前选项
     *
     * @param key   key
     */
    updateCurrentOption(event, key) {
        if (!key)
            key = event;
        var self = this;
        self.currentOption._key = key;
        self.currentOption.string = self.getStr(key);
        self.active_Potion();
        var callback = self.callback,
            event = null;
        for (let i = 0, len = callback.length; i < len; i++) {
            event = self.analysisEventHandler(callback[i]);
            event.callback.call(event.target, callback[i].customEventData, key);
            event = null;
        }
    }

});
