'use strict';
function on_child_added(detail) {
    $ui._bindDescendantsNode(this, detail);
    $ui.init(detail);
};
function on_child_removed(detail) {
    $ui._removeDescendantsNode(this, detail);
};
function push(component) {
    $ui._bindComponent(component.node, component);
    return this._push.call(this, component);
};
function splice(i, num) {
    $ui._removeComponent(this[i].node, this[i]);
    return this._splice.call(this, i, num);
};
function getName() {
    return this._name;
};
function setName(val) {
    if (!this.parent || !this.parent.isValid) {
        return;
    }
    $ui._removeDescendantsNode(this.parent, this);
    this._name = val;
    $ui._bindDescendantsNode(this.parent, this);
};
var $ui = {
    /**移除子孙节点信息
     *
     * @param target            目标节点
     * @param descendantsNode   子孙节点
     */
    _removeDescendantsNode(target, descendantsNode) {
        delete target[`$${descendantsNode.name}`];
    },

    /**绑定子孙节点
     *
     * @param target            目标节点
     * @param descendantsNode   子孙节点
     */
    _bindDescendantsNode(target, descendantsNode) {
        target[`$${descendantsNode.name}`] = descendantsNode;
    },

    /**绑定组件
     *
     * @param target    目标节点
     * @param component 目标组件
     */
    _bindComponent(target, component) {
        var name = this._getComponentName(component);
        name = `${name}`;
        target[name] = component;
    },

    /**移除组件
     *
     * @param target    目标节点
     * @param component 目标组件
     */
    _removeComponent(target, component) {
        var name = this._getComponentName(component);
        name = `${name}`;
        delete target[name];
    },

    /**
     * 获取组件名字
     * @param {cc.Component} component
     */
    _getComponentName(component) {
        if (component instanceof Script) {
            return 'Script';
        } else {
            return component.name.match(/<.*>$/)[0].slice(1, -1);
        }
    },

    /**初始化
     *
     * @param target    需要绑定的节点或组件
     */
    init(target) {
        if (!(target instanceof cc.Node)) {
            target = target.node;
        }
        if (!target) {
            throw new Error('初始化ui没有传入节点或组件');
        }

        if (target.$$isInitUi)
            return;
        target.$$isInitUi = true;

        this.bindGetSet(target);
        this.bindComponent(target);
        this.bindDescendantsNode(target);
    },

    /**绑定getset事件,用于监听
     *
     */
    bindGetSet(target) {
        var components = target._components;
        components._push = components.push;
        components.push = push.bind(components);

        components._splice = components.splice;
        components.splice = splice.bind(components);

        target._name = target.name;
        delete target.name;

        Object.defineProperties(target, { name: { get: getName, set: setName } });
        target.on('child-added', on_child_added, target);
        target.on('child-removed', on_child_removed, target);
    },

    /**绑定组件
     *
     * @param target      需要绑定组件的节点
     */
    bindComponent(target) {
        var self = this,
            components = target._components,
            i = components.length - 1;
        for (; i >= 0; i--) {
            self._bindComponent(target, components[i]);
        }
        components = null;
    },

    /**绑定子节点
     *
     * @param target    目标节点
     */
    bindDescendantsNode(target) {
        var self = this,
            childrens = target.children,
            i = childrens.length - 1;
        for (; i >= 0; i--) {
            self._bindDescendantsNode(target, childrens[i]);
            self.init(childrens[i]);
        }
    }
};
// var array = function () {
// };
// cc.js.extend(array, Array);
// array._push = array.prototype.push;
// array._splice = array.prototype.push;
// array.push = (function (component) {
//     window.ui._bindComponent(component.node, component);
//     return this._push.call(this, component);
// });
// array.splice = (function (i, num) {
//     window.ui._removeComponent(this[i].node, this[i]);
//     return this._splice.call(this, i, num);
// });
// cc.Node.prototype.__ctor__ = function () {
//     this._components = new array();
// };
module.exports = window.ui = $ui;