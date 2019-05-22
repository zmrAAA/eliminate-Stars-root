cc.Class( {
    extends : Script,

    properties : {
        add         : cc.Node,
        reduce      : cc.Node,
        maxNum      : 100,
        minNum      : 0,
        changeEvent : [ cc.Component.EventHandler ]
    },

    onLoad () {
        // 文字居中
        var editbox = this.node.EditBox || this.getComponent( cc.EditBox );
        if ( editbox ) {
            var render_cmd              = editbox._sgNode._renderCmd;
            var edTxt                   = render_cmd._edTxt;
            edTxt.style[ "text-align" ] = "center";
        }

        // 注册事件
        this.EditBox = editbox;
        this._onTouch( this.add );
        this._onTouch( this.reduce );
    },

    _onTouch ( node ) {
        var EventType = cc.Node.EventType;
        node.on( EventType.TOUCH_START, this._onTouchStart, this );
        node.on( EventType.TOUCH_END, this._onTouchEndOrCancel, this );
        node.on( EventType.TOUCH_CANCEL, this._onTouchEndOrCancel, this );
    },

    _onTouchStart ( e ) {
        var target = e.target,
            name   = target._name;
        if ( name === 'add' ) {
            this.addNum();
        } else {
            this.reduceNum();
        }
        this[ name + 'Id' ] = setTimeout( function () {
            this.updateNumStatus = name + 'Num';
        }.bind( this ), 500 );
    },

    _onTouchEndOrCancel ( e ) {
        var target = e.target;
        clearTimeout( this[ target._name + 'Id' ] );
        this.updateNumStatus = null;
    },

    /**
     * 增加
     */
    addNum () {
        var num = this.getNum();
        if ( num >= this.maxNum ) {
            return;
        }
        this.EditBox.string = String( num + 1 );
        this.emitChangeEvent();
    },

    /**
     * 减少
     */
    reduceNum () {
        var num = this.getNum();
        if ( num <= this.minNum ) {
            return;
        }
        this.EditBox.string = String( num - 1 );
        this.emitChangeEvent();
    },

    /**
     * 获取当前数量
     * @returns {number}
     */
    getNum () {
        return parseInt( this.EditBox.string );
    },

    onChangeString () {
        var num = this.getNum();
        if ( num >= this.maxNum ) {
            this.EditBox.string = String( this.maxNum );
        } else if ( num <= this.minNum ) {
            this.EditBox.string = String( this.minNum );
        }
        this.emitChangeEvent();
    },

    emitChangeEvent () {
        var changeEvent = this.changeEvent,
            len         = changeEvent.length,
            i           = 0,
            event       = null;
        for ( ; i < len; i++ ) {
            event = changeEvent[ i ];
            event.target.getComponent( event.component )[ event.handler ]( event.customEventData );
        }
    },

    update () {
        // 一直增加或减少
        if ( this.updateNumStatus ) {
            this[ this.updateNumStatus ]();
        }
    }
} );
