/**滑动组件
 *
 */
cc.Class( {
    extends : cc.ScrollView,

    properties : {
        prefabItem     : cc.Prefab,             //预制
        spawnCount     : 0,                     //生成的预制数量
        totalCount     : 0,                     //总项目数
        spacing        : 0,                     //每个项目的间隔
        bufferZone     : 0,                     //缓冲区
        updateInterval : 0                      //刷新频率
    },

    onLoad () {
        var pool = this.pool = new cc.NodePool(),
            i          = 0,
            spawnCount = this.spawnCount,
            prefabItem = this.prefabItem;
        for ( ; i < spawnCount; i++ )
            pool.put( cc.instantiate( prefabItem ) );
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
        this.updateTimer    = 0;
        this.prefabItem     = prefabItem || this.prefabItem;
        this.spawnCount     = spawnCount || this.spawnCount;
        this.totalCount     = totalCount || this.totalCount;
        this.bufferZone     = bufferZone || this.bufferZone;
        this.updateInterval = updateInterval || this.updateInterval;
    },

    /**生成项目
     *
     * @param totalCount    一共有几个
     */
    initialize ( data, totalCount ) {
        if ( typeof data === 'number' ) {
            totalCount = data;
        } else {
            totalCount = totalCount || data.length;
        }
        this.putAll();
        this.data          = data;
        this.totalCount    = totalCount;
        this.items         = [];                                           //存储项目
        this.content.width = this.totalCount * ( this.prefabItem.data.width + this.spacing ) + this.spacing;
        var len            = totalCount < this.spawnCount ? totalCount : this.spawnCount;
        for ( var i = 0; i < len; ++i ) {
            var item = this.createItem( i, this.content );
            item.setPosition( item.width * ( 0.5 + i ) + this.spacing * ( i + 1 ), 0 );
            this.items.push( item );
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
        if ( this.pool.size() > 0 ) {
            item = this.pool.get();
        } else {
            item = cc.instantiate( this.prefabItem );
        }
        item.parent = parent;
        item.Script.init( index + 1, this.data[ index ] );
        return item;
    },

    /**获取项目当前位置
     *
     * @param item  项目
     */
    getPositionInView ( item ) {
        var worldPos = item.parent.convertToWorldSpaceAR( item.position );
        var viewPos  = this.node.convertToNodeSpaceAR( worldPos );
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
        if ( !self.items || self.items.length === 0 ) {
            return;
        }
        self.updateTimer += dt;
        if ( self.updateTimer < self.updateInterval ||
            self.content.x === this.lastContentPosX ) {
            return;
        }

        self.updateTimer = 0;
        var items        = self.items,
            buffer       = self.bufferZone,
            isLeft       = self.content.x < this.lastContentPosX,
            offset       = ( self.prefabItem.data.width + self.spacing ) * items.length,
            contentWidth = self.content.width,
            i            = 0,
            len          = items.length,
            viewPos, item, itemScript, itemId;
        for ( ; i < len; ++i ) {
            item    = items[ i ];
            viewPos = self.getPositionInView( item );
            if ( isLeft ) {
                if ( viewPos.x < -buffer && item.x + offset < contentWidth ) {
                    item.setPositionX( item.x + offset );
                    itemScript = item.Script;
                    itemId     = itemScript.itemID + items.length;
                    itemScript.init( itemId, self.data[ itemId - 1 ] );
                }
            } else {
                if ( viewPos.x > buffer && item.x - offset > 0 ) {
                    item.setPositionX( item.x - offset );
                    itemScript = item.Script;
                    itemId     = itemScript.itemID - items.length;
                    itemScript.init( itemId, self.data[ itemId - 1 ] );
                }
            }
        }
        self.lastContentPosX = self.content.x;
    }
} );
