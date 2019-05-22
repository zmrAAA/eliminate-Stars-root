/**加载类
 *
 */
'use strict';

/**加载clip回调
 *
 * @param clip      动画
 */
function animationCallBack ( clip ) {
    if ( !this.isValid ) {
        return;
    }
    var com = this.Animation;
    if ( !com ) {
        com = this.addComponent( cc.Animation );
    }
    com.addClip( clip, clip.$$newName );
    com.play( clip.$$newName );
    // if (this.time) {
    //     com.on('finished ', function () {
    //         this.scheduleOnce(function () {
    //             this.play(clip.$$newName);
    //         }, this.node.time);
    //     }, com);
    // }
};

/**加载resources外的资源
 *
 * @param path      路径
 * @param callback  回调
 */
function load ( path, callback ) {
    if ( !path ) {
        throw `加载resources外的资源没有传入路径`;
    }
    cc.loader.load( path, function ( err, assets ) {
        if ( err ) {
            throw `加载resources外的资源错误${err}`;
        }
        callback && callback( assets );
    } );
};

/**加载resources内的资源
 *
 * @param path      路径
 * @param type      类型
 * @param callback  回调
 */
function loadRes ( path, type, callback ) {
    if ( !path ) {
        throw `加载resources内的资源没有传入路径`;
    }
    cc.loader.loadRes( path, type, function ( err, assets ) {
        if ( err ) {
            throw `加载resources内的资源错误${err}`;
        }
        callback && callback( assets );
    } );
};

/**获取相关资源
 *
 * @param assets    资源
 */
function getDependsRecursively ( assets ) {
    return cc.loader.getDependsRecursively( assets );
};

/**获取资源的路径
 *
 * @param assets    资源
 */
function getReferenceKey ( assets ) {
    return cc.loader._getReferenceKey( assets );
};

/**释放资源
 *
 * @param assets    需要释放的资源或路径
 */
function release ( assets ) {
    if ( !assets ) {
        throw `没有选择释放的资源`;
    }
    cc.loader.release( assets );
};

/**获取路径
 *
 * @param path  resources文件夹下的路径
 */
function raw ( path ) {
    return cc.url.raw( 'resources/' + path );
};

const Loader   = ( function () {

    function Loader () {
        var self                = this;
        self.animationClip      = {};               //存储动画
        self._loadingUrl        = {};               //正在加载的资源
        self._loadItems         = {};               //加载的资源
        self.items              = {};               //已加载的项目
        self._loadAnimationClip = {};               //加载动画的callback
    }

    var _p = Loader.prototype;

    /**加载资源
     *
     * @param path      资源路径
     * @param type      类型
     * @param callback  回调
     */
    _p.load = function ( path, type, callback ) {
        var self    = this,
            _assets = self.getRes( path, type );

        if ( _assets ) {
            callback( _assets );
            return;
        }
        if ( self._loadingUrl[ path ] ) {
            callback && self._loadingUrl[ path ].push( callback );
            return;
        }

        self._loadingUrl[ path ] = callback ? [ callback ] : [];

        loadRes( path, type, function ( assets ) {
            self.setRes( path, type, assets );

            self.addAssets( assets );

            var loadingUrl = self._loadingUrl[ path ],
                len        = loadingUrl.length,
                i          = 0;
            for ( ; i < len; i++ )
                loadingUrl[ i ]( assets );

            delete self._loadingUrl[ path ];
        } );
    };

    /**
     * 根据路径个类型获取资源   没有加载过则返回空
     *
     * @param path  路径
     * @param type  类型
     */
    _p.getRes = function ( path, type ) {
        var self  = this,
            items = self.items,
            name  = type.name,
            item  = null;
        if ( items[ name ] ) {
            item = items[ name ][ path ];
            if ( !item || !item.isValid ) {
                return null;
            }
            return item;
        }
        return null;
    };

    /**
     * 设置资源 方便后续直接获取
     *
     * @param path      路径
     * @param type      类型
     * @param assets    资源
     */
    _p.setRes = function ( path, type, assets ) {
        var self  = this,
            items = self.items,
            name  = type.name;
        if ( !items[ name ] ) {
            items[ name ] = {};
        }
        items[ name ][ path ] = assets;
    };

    /**添加资源引用
     *
     * @param assets    需要添加的资源或路径
     */
    _p.addAssets = function ( assets ) {
        var deps      = getDependsRecursively( assets ),
            loadItems = this._loadItems,
            i         = deps.length - 1;
        for ( ; i >= 0; i-- ) {
            if ( loadItems[ deps[ i ] ] ) {
                loadItems[ deps[ i ] ]++;
            } else {
                loadItems[ deps[ i ] ] = 1;
            }
        }
    };

    /**移除资源
     *
     * @param assets            需要移除的资源或路径
     * @param isReleaseRelevant 是否需要释放相关的资源
     */
    _p.release = function ( assets, isReleaseRelevant ) {
        var deps = !isReleaseRelevant ? [ getReferenceKey( assets ) ] : getDependsRecursively( assets ),
            i    = deps.length - 1;
        for ( ; i >= 0; i-- ) {
            this.removeAssets( deps[ i ] );
        }
    };

    /**移除资源引用
     *
     * @param assets    需要移除的资源或路径
     */
    _p.removeAssets = function ( assets ) {
        if ( typeof assets !== 'string' ) {
            assets = getReferenceKey( assets );
        }

        var loadItems = this._loadItems;
        if ( loadItems[ assets ] ) {
            loadItems[ assets ]--;
            if ( loadItems[ assets ] <= 0 ) {
                release( assets );
                delete loadItems[ assets ];
            }
        } else {
            release( assets );
        }
    };

    /**更换精灵帧
     *
     * @param path          资源路径
     * @param node          需要替换的节点
     * @param callback      回调
     * @param isSpriteAtlas 是否是合图
     * @param name          名字,是合图才需要传
     */
    _p.changeSpriteFrame = function ( path, node, callback, isSpriteAtlas, name ) {
        if ( !node ) {
            throw `没有传入节点`;
        }
        var component = node.Sprite || node.Mask;
        if ( !component ) {
            if ( node instanceof cc.Sprite || node instanceof cc.Mask ) {
                component = node;
            } else {
                throw `更换精灵帧的时候节点没有精灵或者遮罩组件`;
            }
        }
        if ( !isSpriteAtlas ) {
            this.loadSpriteFrame( path, function ( texture ) {
                if ( !node.isValid ) {
                    return;
                }
                var spriteFrame       = new cc.SpriteFrame( texture );
                spriteFrame._uuid     = texture._uuid;
                component.spriteFrame = spriteFrame;
                callback && callback( texture, spriteFrame );
            } );
        } else {
            this.loadSpriteAtlas( path, function ( spriteAtlas ) {
                if ( !node.isValid ) {
                    return;
                }
                var spriteFrame       = spriteAtlas.getSpriteFrame( name );
                component.spriteFrame = spriteFrame;
                callback && callback( null, spriteFrame );
            } );
        }
    };

    /**直接生成一个预制节点
     *
     * @param path      预制路径
     * @param parent    父节点
     * @param pos       位置
     * @param callback  回调
     * @param isRelease 加载完是否需要释放预制
     */
    _p.generatePrefabNode = function ( path, parent, pos, callback, isRelease ) {
        this.loadPrefab( path, function ( prefab ) {
            var node    = cc.instantiate( prefab );
            node.parent = parent || null;
            node.setPosition( pos || cc.p( 0, 0 ) );
            callback && callback( node, prefab );
        }.bind( this ), isRelease );
    };

    /**加载预制
     *
     * @param path      路径
     * @param callback  回调
     * @param isRelease 加载完是否需要释放预制
     */
    _p.loadPrefab = function ( path, callback, isRelease ) {
        this.load( 'Prefab/' + path, cc.Prefab, function ( prefab ) {
            callback && callback( prefab );
            isRelease && this.release( prefab, false );
        }.bind( this ) );
    };

    /**加载图片
     *
     * @param path      路径
     * @param callback  回调
     * @param param     回调的时候附带的参数
     */
    _p.loadSpriteFrame = function ( path, callback, param ) {
        this.load( 'Texture/' + path, cc.Texture2D, function ( texture ) {
            callback && callback( texture, param );
        }.bind( this ) );
    };

    /**加载图集
     *
     * @param path      路径
     * @param callback  回调
     * @param param     回调的时候附带的参数
     */
    _p.loadSpriteAtlas = function ( path, callback, param ) {
        this.load( 'Plist/' + path, cc.SpriteAtlas, function ( spriteAtlas ) {
            callback && callback( spriteAtlas, param );
        }.bind( this ) );
    };

    /**加载图集并转化为帧动画
     *
     * @param path      路径
     * @param callback  回调
     * @param sample    帧速率,没有则默认10
     */
    _p.loadSpriteAtlasToClip = function ( path, callback, sample = 10 ) {
        this.loadSpriteAtlas( path, function ( spriteAtlas ) {
            var clip = cc.AnimationClip.createWithSpriteFrames( spriteAtlas.getSpriteFrames(), sample );
            callback && callback( clip, spriteAtlas );
        } );
    };

    /**加载图集转为动画并播放
     *
     * @param node      需要播放的节点
     * @param newName   动画的名字
     * @param path      路径
     * @param callback  回调
     * @param wapMode   播放模式,默认循环
     * @param sample    帧速率,没有则默认10
     */
    _p.loadSpriteAtlasToClipAndPlay = function ( node, newName = 'default', path, callback, wapMode = cc.WrapMode.Loop, sample ) {
        if ( !node ) {
            throw '加载图集转为动画并播放没有节点';
        }
        var self = this,
            name = path + '_' + newName;

        if ( self._loadAnimationClip[ name ] ) {
            callback && self._loadAnimationClip[ name ].push( callback );
            return;
        } else if ( self.animationClip[ name ] instanceof cc.AnimationClip ) {
            return animationCallBack.call( node, self.animationClip[ name ] );
        }

        var loadAnimationClip = self._loadAnimationClip[ name ] = callback ? [ callback ] : [];

        self.loadSpriteAtlasToClip( path, function ( clip ) {
            clip.wrapMode  = wapMode;
            clip.$$newName = newName;
            animationCallBack.call( node, clip );

            self.animationClip[ name ] = clip;

            var len = loadAnimationClip.length,
                i   = 0;
            for ( ; i < len; i++ )
                loadAnimationClip[ i ]( clip );

            delete self._loadAnimationClip[ name ];
        }, sample );
    };

    /**加载音乐
     *
     * @param path      路径
     * @param callback  回调
     */
    _p.loadMusic = function ( path, callback ) {
        this.load( 'music/' + path, cc.AudioClip, function ( audioClip ) {
            callback && callback( audioClip );
        }.bind( this ) );
    };

    /**加载json
     *
     * @param path      路径
     * @param callback  回调
     */
    _p.loadJson = function ( path, callback ) {
        this.load( path, cc.JsonAsset, function ( json ) {
            callback && callback( json );
        }.bind( this ) );
    };

    /**加载字体
     *
     * @param path      路径
     * @param tOrB      类型
     * @param callback  回调
     */
    _p.loadFont = function ( path, tOrB, callback ) {
        this.load( 'font/' + path, tOrB === 't' ? cc.TTFFont : cc.BitmapFont, function ( font ) {
            callback && callback( font );
        }.bind( this ) );
    };

    /**替换label字体
     *
     * @param node      替换的节点
     * @param path      路径
     * @param tOrB      类型
     * @param callback  回调
     */
    _p.changeFont = function ( node, path, tOrB, callback ) {
        this.loadFont( path, tOrB, function ( font ) {
            var com = node.i18n_Label;
            if ( !com ) {
                throw `替换字体的节点没有label组件`;
            }
            com.font = font;
            callback && callback( font );
        }.bind( this ) );
    };

    return Loader;
}() );
module.exports = Loader;
