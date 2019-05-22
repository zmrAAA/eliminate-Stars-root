/**滑动组件
 *
 */
cc.Class( {
    extends : cc.ScrollView,

    properties : {
        prefabItem     : cc.Prefab,             // 预制
        count          : 3,                     // 一排要几个
        spawnCount     : 0,                     // 生成的预制数量
        totalCount     : 0,                     // 总项目数
        spacingY       : 0,                     // 每个项目的间隔
        bufferZone     : 0,                     // 缓冲区
        updateInterval : 0,                     // 刷新频率
        paddingLeft    : 0,                     // 左边边距
        paddingRight   : 0                      // 右边边距
    },

    onLoad () {
        var data      = this.prefabItem.data,
            cWidth    = this.content.width - this.paddingLeft - this.paddingRight,
            width     = data.width,
            count     = this.count;
        this.spacingX = ( cWidth - width * count ) / ( count - 1 );

        var pool = this.pool = new cc.NodePool(),
            prefabItem = this.prefabItem,
            spawnCount = this.spawnCount * this.count;
        for ( let i = 0; i < spawnCount; i++ )
            pool.put( cc.instantiate( prefabItem ) );
    },

    /**生成项目
     *
     * @param data          数据
     * @param totalCount    一共有几个
     * @param type          类型
     */
    initialize ( data, totalCount, type ) {
        var self    = this,
            content = self.content;
        self.putAll();
        self.type   = type;
        self.record = data;
        totalCount  = self.totalCount = totalCount || data.length;
        content.height = Math.ceil( totalCount / self.count ) * ( self.prefabItem.data.height + self.spacingY ) + self.spacingY;
        var v2Arr      = self.v2Arr = [],
            items = self.items = [],                                                   //存储项目
            count    = self.count,
            data     = self.prefabItem.data,
            width    = data.width,
            height   = data.height,
            spacingX = self.spacingX,
            spacingY = self.spacingY,
            F_v2     = cc.v2,
            i,
            x, y,
            xi, yi;
        for ( i = 0; i < totalCount; ++i ) {
            xi = i % count;
            x  = width * ( 0.5 + xi ) + spacingX * xi;
            yi = Math.floor( i / count );
            y  = -height * ( 0.5 + yi ) - spacingY * ( yi + 1 );
            v2Arr.push( F_v2( x, y ) );
        }
        var len = totalCount < this.spawnCount ? totalCount : this.spawnCount;
        for ( i = 0; i < len; ++i ) {
            var item = self.createItem( i, content );
            item.setPosition( v2Arr[ i ] );
            items.push( item );
        }
    },

    /**创建项目
     *
     * @param index     索引
     * @param parent    父节点
     */
    createItem ( index, parent ) {
        var item;
        if ( this.pool.size() > 0 ) {
            item = this.pool.get();
        } else {
            item = cc.instantiate( this.prefabItem );
        }
        item.parent = parent;
        item.Script.init( index + 1, this.record[ index ], this.type );
        return item;
    },

    /**清除所有项目
     *
     */
    putAll () {
        var self = this;
        if ( !self.items ) {
            return;
        }
        var items = self.items,
            pool  = self.pool,
            i     = items.length - 1;
        for ( ; i >= 0; i-- ) {
            pool.put( items[ i ] );
        }
        self.items = null;
        items      = null;
    },

    /**获取项目当前位置
     *
     * @param item  项目
     */
    getPositionInView ( item ) {
        let worldPos = item.parent.convertToWorldSpaceAR( item.position );
        let viewPos  = this.node.convertToNodeSpaceAR( worldPos );
        return viewPos;
    },

    /**更新滑动节点显示
     *
     */
    update ( dt ) {
        var self = this;
        if ( self._autoScrolling ) {
            self._processAutoScrolling( dt );
        }
        if ( !self.items || self.items.length === 0 ||
            self.content.y === self.lastContentPosY ) {
            return;
        }
        self.updateTimer += dt;
        if ( self.updateTimer < self.updateInterval ) {
            return;
        }

        self.updateTimer                = 0;
        var v2Arr                       = self.v2Arr,
            items                       = self.items,
            len                         = items.length,
            buffer                      = self.bufferZone,
            isDown                      = self.content.y < self.lastContentPosY,
            contentHeight               = -self.content.height,
            offset                      = ( self.prefabItem.data.height + self.spacingY ) * Math.floor( len / self.count ),
            item, itemScript, itemId, i = items.length - 1,
            viewPos                     = null;
        for ( ; i >= 0; i-- ) {
            item    = items[ i ];
            viewPos = self.getPositionInView( item );
            if ( isDown ) {
                if ( viewPos.y < -buffer && item.y + offset < 0 ) {

                    itemScript = item.Script;
                    itemId     = itemScript.itemID - items.length;
                    if ( !v2Arr[ itemId - 1 ] ) {
                        continue;
                    }
                    item.setPosition( v2Arr[ itemId - 1 ] );
                    if ( self.record[ itemId - 1 ] ) {
                        itemScript.init( itemId, self.record[ itemId - 1 ], self.type );
                    }
                }
            } else {
                if ( viewPos.y > buffer && item.y - offset > contentHeight ) {

                    itemScript = item.Script;
                    itemId     = itemScript.itemID + items.length;
                    if ( !v2Arr[ itemId - 1 ] ) {
                        continue;
                    }
                    item.setPosition( v2Arr[ itemId - 1 ] );
                    if ( self.record[ itemId - 1 ] ) {
                        itemScript.init( itemId, self.record[ itemId - 1 ], self.type );
                    }
                }
            }
            item    = null;
            viewPos = null;
        }
        self.lastContentPosY = self.content.y;
    }
} );
