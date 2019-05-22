// 游戏所有脚本继承Script
window.Script = cc.Class( {
    name    : 'Script',
    extends : cc.Component
} );

if ( !CC_EDITOR ) {
    cc.director.on( cc.Director.EVENT_BEFORE_SCENE_LAUNCH, function ( e ) {
        ui.init( e );
    } );

    // 添加widget
    cc.Widget.prototype.start = function () {
        Global.widget.push( this );
    };

    // 移除widget
    cc.Widget.prototype.onDestroy = function () {
        var widget = Global.widget,
            index  = widget.indexOf( this );
        if ( index !== -1 ) {
            widget.splice( index, 1 );
        }
    };

    // 快速获取子节点
    cc.Node.prototype.getChildByName = function ( name ) {
        return this[ `$${name}` ];
    };

    // 设置节点的渲染state(节点需要有精灵组件)
    cc.Node.prototype.setState = function ( state ) {
        var sprite = this.Sprite || this.getComponent( cc.Sprite );
        if ( sprite ) {
            sprite._sgNode.setState( state );
        }
    };

    // 让每次点击都触发声音
    cc.Button.prototype._onTouchEnded = function ( event ) {
        if ( !this.interactable || !this.enabledInHierarchy ) return;

        if ( this._pressed ) {
            cc.Component.EventHandler.emitEvents( this.clickEvents, event );
            this.node.emit( 'click', this );

            if ( cc.vv.isEffectsOpen ) {
                cc.vv.AudioMgr.play( 'touch', 1, false, 'Effects' );
            }
        }
        this._pressed = false;
        this._updateState();
        event.stopPropagation();
    };

    // 修改cc.find的实现
    cc.find = function ( path, referenceNode ) {
        if ( path == null ) {
            cc.errorID( 5600 );
            return null;
        }
        if ( !referenceNode ) {
            var scene = cc.director.getScene();
            if ( !scene ) {
                if ( CC_DEV ) {
                    cc.warnID( 5601 );
                }
                return null;
            }
            else if ( CC_DEV && !scene.isValid ) {
                cc.warnID( 5602 );
                return null;
            }
            referenceNode = scene;
        }
        else if ( CC_DEV && !referenceNode.isValid ) {
            cc.warnID( 5603 );
            return null;
        }

        var match      = referenceNode;
        var startIndex = ( path[ 0 ] !== '/' ) ? 0 : 1; //  skip first '/'
        var nameList   = path.split( '/' );

        //  parse path
        for ( var n = startIndex; n < nameList.length; n++ ) {
            var name = nameList[ n ];
            match    = match.getChildByName( name );
            if ( !match ) {
                return null;
            }
        }

        return match;
    };

}