const COLOR     = cc.Enum( {
    WHITE   : cc.Color.WHITE,
    BLACK   : cc.Color.BLACK,
    GRAY    : cc.Color.GRAY,
    RED     : cc.Color.RED,
    GREEN   : cc.Color.GREEN,
    BLUE    : cc.Color.BLUE,
    ORANGE  : cc.Color.ORANGE,
    CYAN    : cc.Color.CYAN,
    MAGENTA : cc.Color.MAGENTA
} );
const ROW       = 10,
      COL       = 10,
      ROW_SPEED = 500,
      COL_SPEED = 500;
cc.Class( {
    extends : Script,

    properties : {},

    start () {
        cc.director.setClearColor( new cc.Color( 114, 154, 107, 255 ) );    // 方便测试
        this.pool = new cc.NodePool();
        cc.vv.Loader.loadPrefab( 'block', this.init.bind( this ), false );
    },

    init ( prefab ) {
        prefab            = this.prefab || ( this.prefab = prefab );
        const blockSize   = cc.director.getWinSizeInPixels().width / COL;
        prefab.data.width = prefab.data.height = blockSize;
        this.node.height = blockSize * ROW;

        var blockList = this.blockList = [],
            colorList = this.colorList = [],
            posList = this.posList = [],
            parent      = this.node,
            instantiate = cc.instantiate,
            i, j, color, _col,
            block       = null;

        for ( i = 0; i < ROW; i++ ) {
            blockList.push( [] );
            posList.push( [] );
            colorList.push( [] );
        }
        var keys    = Object.keys( COLOR ),
            keysLen = keys.length,
            all     = ROW * COL;
        for ( i = 0; i < all; i++ ) {
            block        = instantiate( prefab );
            block.parent = parent;
            _col         = Math.floor( i / COL );
            color        = COLOR[ keys[ Math.floor( Math.random() * keysLen ) ] ];
            block.color  = color;
            blockList[ _col ].push( block );
            colorList[ _col ].push( color );
            block = null;
        }
        parent.Layout.enabled = true;
        parent.Layout.updateLayout();
        parent.Layout.enabled = false;
        parent.Widget.updateAlignment();

        for ( i = 0; i < ROW; i++ ) {
            for ( j = 0; j < COL; j++ ) {
                posList[ i ][ j ] = blockList[ i ][ j ].getPosition();
            }
        }

        this.node.on( cc.Node.EventType.TOUCH_END, this._onTouchEnd, this );
    },

    _onTouchEnd ( e ) {
        var pos       = e.touch.getLocation(),
            blockList = this.blockList,
            node      = this.node,
            width     = node.width,
            height    = node.height,
            row       = Math.floor( ( ( height - pos.y ) / height ) * ROW ),
            col       = Math.floor( ( pos.x / width ) * COL );
        blockList[ row ][ col ] && this.eliminate( row, col );
        //     block     = null,
        //     row       = blockList.length,
        //     col, i, j, wx, hy;
        // for ( i = 0; i < row; i++ ) {
        //     col = blockList[ i ].length;
        //     for ( j = 0; j < col; j++ ) {
        //         block = blockList[ i ][ j ];
        //         if ( !block ) {
        //             continue;
        //         }
        //         wx = block.width * block.anchorX;
        //         hy = block.height * block.anchorY;
        //         if ( block.x - wx < pos.x &&
        //             block.x + wx > pos.x &&
        //             block.y - hy < pos.y &&
        //             block.y + hy > pos.y ) {
        //             console.log( i, j );
        //             // this.eliminate( i, j );
        //             break;
        //         }
        //         // if ( blockList[ i ][ j ] && blockList[ i ][ j ]._hitTest( pos ) ) {
        //         //     this.eliminate( i, j );
        //         //     break;
        //         // }
        //     }
        // }

    },

    _filter ( array ) {
        return Array.from( new Set( array ) );
    },

    /**
     * 获取关联的方块
     * @param row   点击的方块所在的行
     * @param col   点击的方块所在的列
     * @returns {*|string[]}
     */
    getRelevantBlock ( row, col ) {
        var colorList         = this.colorList,
            relevantBlockList = [ row + ',' + col ];

        function getLeft ( _row, _col ) {
            return colorList[ _row ][ _col - 1 ] &&
            colorList[ _row ][ _col ] === colorList[ _row ][ _col - 1 ]
                ? _row + ',' + ( _col - 1 )
                : null;
        }

        function getRight ( _row, _col ) {
            return colorList[ _row ][ _col + 1 ] &&
            colorList[ _row ][ _col ] === colorList[ _row ][ _col + 1 ]
                ? _row + ',' + ( _col + 1 )
                : null;
        }

        function getTop ( _row, _col ) {
            return colorList[ _row - 1 ] &&
            colorList[ _row ][ _col ] === colorList[ _row - 1 ][ _col ]
                ? ( _row - 1 ) + ',' + _col
                : null;
        }

        function getBottom ( _row, _col ) {
            return colorList[ _row + 1 ] &&
            colorList[ _row ][ _col ] === colorList[ _row + 1 ][ _col ]
                ? ( _row + 1 ) + ',' + _col
                : null;
        }

        function getRelevantBlock ( _row, _col ) {
            var arr = [],
                left, right, top, bottom;
            left    = getLeft( _row, _col );
            if ( left ) {
                arr.push( left );
            }

            right = getRight( _row, _col );
            if ( right ) {
                arr.push( right );
            }

            top = getTop( _row, _col );
            if ( top ) {
                arr.push( top );
            }

            bottom = getBottom( _row, _col );
            if ( bottom ) {
                arr.push( bottom );
            }
            return arr;
        }

        relevantBlockList = this._filter( relevantBlockList.concat( getRelevantBlock( row, col ) ) );

        var rowAndCol, i, len;
        for ( ; ; ) {
            var arr = [];
            for ( i = 0, len = relevantBlockList.length; i < len; i++ ) {
                rowAndCol = relevantBlockList[ i ].split( ',' );
                arr       = arr.concat( getRelevantBlock( parseInt( rowAndCol[ 0 ] ), parseInt( rowAndCol[ 1 ] ) ) );
            }
            relevantBlockList = this._filter( arr.concat( relevantBlockList ) );
            if ( relevantBlockList.length === len ) {
                break;
            }
        }
        for ( i = 0, len = relevantBlockList.length; i < len; i++ ) {
            rowAndCol              = relevantBlockList[ i ].split( ',' );
            relevantBlockList[ i ] = { row : rowAndCol[ 0 ], col : rowAndCol[ 1 ] };
        }
        return relevantBlockList;
    },

    /**
     * 消除
     */
    eliminate ( _row, _col ) {
        var pool              = this.pool,
            blockList         = this.blockList,
            colorList         = this.colorList,
            relevantBlockList = this.getRelevantBlock( _row, _col ),
            relevantBlock, row, col;
        // relevantBlockList.length 消除的数量
        for ( var i = 0, len = relevantBlockList.length; i < len; i++ ) {
            relevantBlock = relevantBlockList[ i ];
            row           = relevantBlock.row;
            col           = relevantBlock.col;
            pool.put( blockList[ row ][ col ] );
            blockList[ row ][ col ] = null;
            colorList[ row ][ col ] = null;
            relevantBlock           = null;
        }
        this.updateAllBlock();

    },

    /**
     * 刷新界面布局
     */
    updateAllBlock () {
        var blockList = this.blockList,
            colorList = this.colorList,
            posList   = this.posList,
            i, j, len, rowLen, existence, row, col, countRow, countCol, distance;

        function update ( _row, _col, _countRow, _countCol ) {
            blockList[ _row + _countRow ][ _col - _countCol ] = blockList[ _row ][ _col ];
            blockList[ _row ][ _col ]                         = null;

            colorList[ _row + _countRow ][ _col - _countCol ] = colorList[ _row ][ _col ];
            colorList[ _row ][ _col ]                         = null;
        }

        function runColAction ( _row, _col, _countCol ) {
            distance = posList[ _row ][ _col ].x - posList[ _row ][ col - _countCol ].x;
            blockList[ _row ][ _col ].runAction( cc.moveBy( distance / COL_SPEED, -distance, 0 ) );
        }

        for ( row = blockList.length - 1; row >= 0; row-- ) {   // 砖块可以向下移动
            for ( col = blockList[ row ].length - 1; col >= 0; col-- ) {
                if ( !blockList[ row ][ col ] ) {
                    continue;
                }
                countRow = 0;
                for ( ; ; ) {
                    countRow++;
                    if ( !blockList[ row + countRow ] ||
                        blockList[ row + countRow ][ col ] ) {
                        countRow--;
                        break;
                    }
                }

                if ( countRow ) {
                    distance = posList[ row ][ col ].y - posList[ row + countRow ][ col ].y;
                    blockList[ row ][ col ].runAction( cc.moveBy( distance / ROW_SPEED, 0, -distance ) );
                    update( row, col, countRow, 0 );
                }
            }
        }

        for ( col = 1; col < COL; col++ ) {     // 整排向左移动
            countCol  = 0;
            existence = false;
            for ( ; ; ) {
                countCol++;
                if ( col - countCol >= 0 ) {
                    for ( j = 0, rowLen = blockList.length; j < rowLen; j++ ) {
                        if ( blockList[ j ][ col - countCol ] ) {
                            existence = true;
                            break;
                        }
                    }
                } else {
                    existence = true;
                }

                if ( existence ) {
                    countCol--;
                    break;
                }
            }
            if ( countCol ) {
                for ( i = 0, len = blockList.length; i < len; i++ ) {
                    if ( blockList[ i ][ col ] ) {
                        runColAction( i, col, countCol );
                        update( i, col, 0, countCol );
                    }
                }
            }
        }
    }
} );
