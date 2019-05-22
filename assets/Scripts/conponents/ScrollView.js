/**滑动组件
 *
 */
cc.Class( {
    extends : cc.ScrollView,

    properties : {
        prefabItem     : cc.Prefab,              //预制
        spawnCount     : 0,                      //生成的预制数量
        totalCount     : 0,                      //总项目数
        spacing        : 0,                         //每个项目的间隔
        bufferZone     : 0,                      //缓冲区
        updateInterval : 0                   //刷新频率
    },

    onLoad () {
        this.Pool = new cc.NodePool();
        for ( let i = 0; i < this.spawnCount; i++ )
            this.Pool.put( cc.instantiate( this.prefabItem ) );
    },

    /**初始化
     *
     * @param prefabItem                    //预制
     * @param spawnCount                    //生成的预制数量
     * @param totalCount                    //总项目数
     * @param spacing                       //每个项目的间隔
     * @param bufferZone                    //缓冲区
     * @param updateInterval                //刷新频率
     */
    init ( prefabItem, spawnCount, totalCount, spacing, bufferZone, updateInterval ) {
        var self            = this;
        self.updateTimer    = 0;
        self.prefabItem     = prefabItem || self.prefabItem;
        self.spawnCount     = spawnCount || self.spawnCount;
        self.totalCount     = totalCount || self.totalCount;
        self.bufferZone     = bufferZone || self.bufferZone;
        self.updateInterval = updateInterval || self.updateInterval;
    },

    /**生成项目
     *
     * @param data          数据
     * @param totalCount    一共有几个
     * @param type          类型
     */
    initialize ( data, totalCount, type ) {
        var self = this;
        self.putAll();
        self.type   = type;
        self.record = data;
        totalCount  = self.totalCount = totalCount || data.length;
        self.items          = [];                                                    //存储项目
        self.content.height = self.totalCount * ( self.prefabItem.data.height + self.spacing ) + self.spacing;
        var len             = totalCount < self.spawnCount ? totalCount : self.spawnCount;
        len                 = len > data.length ? data.length : len;
        var i, item         = null;
        for ( i = 0; i < len; ++i ) {
            item = self.createItem( i, self.content );
            item.setPosition( 0, -item.height * ( 0.5 + i ) - self.spacing * ( i + 1 ) );
            self.items.push( item );
        }
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

    /**创建项目
     *
     * @param index     索引
     * @param parent    父节点
     */
    createItem ( index, parent ) {
        var item;
        if ( this.Pool.size() > 0 ) {
            item = this.Pool.get();
        } else {
            item = cc.instantiate( this.prefabItem );
        }
        item.parent = parent;
        item.Script.init( index + 1, this.record[ index ], this.type );
        return item;
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
        var items                       = self.items,
            buffer                      = self.bufferZone,
            isDown                      = self.content.y < self.lastContentPosY,
            offset                      = ( self.prefabItem.data.height + self.spacing ) * items.length,
            item, itemScript, itemId, i = items.length - 1,
            viewPos                     = null;
        for ( ; i >= 0; i-- ) {
            item    = items[ i ];
            viewPos = self.getPositionInView( item );
            if ( isDown ) {
                if ( viewPos.y < -buffer && item.y + offset < 0 ) {
                    item.setPositionY( item.y + offset );
                    itemScript = item.Script;
                    itemId     = itemScript.itemID - items.length;
                    if ( self.record[ itemId - 1 ] ) {
                        itemScript.init( itemId, self.record[ itemId - 1 ], self.type );
                    }
                }
            } else {
                if ( viewPos.y > buffer && item.y - offset > -self.content.height ) {
                    item.setPositionY( item.y - offset );
                    itemScript = item.Script;
                    itemId     = itemScript.itemID + items.length;
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