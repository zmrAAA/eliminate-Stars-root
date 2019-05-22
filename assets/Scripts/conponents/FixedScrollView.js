/**滑动组件
 *
 */
cc.Class( {
    extends : Script,

    properties : {
        layout       : cc.Node,        //布局节点
        spacing      : 0,             //每个项目的间隔
        centeredNode : cc.Node,  //初始化要居中的节点
        centeredPosX : 0,        //居中到哪，基于当前脚本节点
        isScale      : true,          //是否缩放
    },

    onLoad () {
        var self = this;

        self.touchEnd = true;

        self.lastContentPosX      = self.layout.x;                                                   //备份坐标，用于判断往左或往右
        self.centeredNode.viewPos = { x : 100 };                                                   //自定义视图坐标
        self.centeredNode.absX    = 0;

        self.node.on( cc.Node.EventType.TOUCH_MOVE, self.onTouchMove, self );                     //注册触摸移动
        self.node.on( cc.Node.EventType.TOUCH_END, self.onTouchEnd, self );                       //注册触摸节点内结束
        self.node.on( cc.Node.EventType.TOUCH_CANCEL, self.onTouchCancel, self );                 //注册触摸节点外结束

        self.layout.on( 'position-changed', self.updateItem, self );                              //监听移动

        self.updateItem();
    },

    /**显示下一个
     *
     */
    next () {
        var self   = this,
            layout = self.layout;
        if ( !self.touchEnd ) {
            return;
        }
        layout.runAction( cc.moveBy( 0.5, -layout.parent.width, 0 ) );
    },

    /**添加新项
     *
     * @param node  需要添加的节点
     */
    addItem ( node ) {
        var len = this.layout.children.length;
        if ( len ) {
            node.setPositionX( this.layout.children[ len - 1 ].x + node.width );
        } else {
            node.setPositionX( node.width >> 1 );
        }
        node.parent = this.layout;
    },

    /**监听触摸移动
     *
     * @param e 触摸事件
     */
    onTouchMove ( e ) {
        var self      = this;
        self.touchEnd = false;

        self.layout.x += e.touch.getDelta().x;                                                  //移动
        self.lastContentPosX = self.layout.x;
    },

    /**监听触摸节点内结束
     *
     */
    onTouchEnd () {
        var self     = this,
            viewPosX = self.centeredNode.viewPos.x,
            absX     = self.centeredNode.absX;

        self.touchEnd = true;
        self.layout.runAction( cc.moveBy( 0.1, viewPosX > 0 ? -absX : absX, 0 ) );       //滚到中间
    },

    /**监听触摸节点外结束
     *
     */
    onTouchCancel () {
        this.onTouchEnd();
    },

    /**获取项目当前位置
     *
     * @param item  项目
     */
    getPositionInView ( item ) {
        var worldPos = item.parent.convertToWorldSpaceAR( item.position ),
            viewPos  = this.node.convertToNodeSpaceAR( worldPos );
        return viewPos;
    },

    /**更新滚动视图
     *
     */
    updateItem () {
        var self  = this,
            items = self.layout.children,                                       //所有子节点
            len   = items.length;

        if ( !len || self.layout.x === self.lastContentPosX ) {
            return;
        }

        var buffer        = ( self.node.width >> 1 ) + ( items[ 0 ].width >> 1 ),            //缓冲区（低于这个值就切换坐标）
            isLeft        = self.layout.x < self.lastContentPosX,                      //判断方向
            offset        = ( items[ 0 ].width + self.spacing ) * items.length,            //偏移坐标
            centeredNodeX = buffer,                                             //当前需要居中节点的视图坐标
            isScale       = self.isScale,
            item          = null,
            viewPos,            // 视图坐标
            absX,               // 视图坐标的X绝对值
            scaleX,             //缩放
            i             = 0;

        for ( ; i < len; ++i ) {
            item    = items[ i ];
            viewPos = self.getPositionInView( item );                     //获取视图坐标
            absX    = Math.abs( viewPos.x - self.centeredPosX );                 //获取绝对值
            if ( absX < centeredNodeX ) {                                     //需要更换居中节点
                self.centeredNode = item;
                item.viewPos      = viewPos;
                item.absX         = absX;
                centeredNodeX     = absX;
            }
            if ( isScale ) {
                scaleX     = ( buffer - absX ) / buffer;
                item.scale = scaleX < 0 ? 0 : scaleX;
            }

            //改变坐标
            if ( isLeft ) {
                if ( viewPos.x < -buffer ) {
                    item.setPositionX( item.x + offset );
                }
            } else {
                if ( viewPos.x > buffer ) {
                    item.setPositionX( item.x - offset );
                }
            }
            item = null;
        }
    }
} );
