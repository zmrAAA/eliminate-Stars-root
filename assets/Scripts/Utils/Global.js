'use strict';
cc.vv            = {};
const CRYPTO_KEY = '~!@#$%^&*(';
const CCSchedule = cc.director.getScheduler();                  // 获取定时器
const Global     = {
    widget        : [],
    scheduleId    : 0,                                              // 定时器ID
    allScheduleId : {},                                          // 存放定时器
    mobileModel   : '',                                            // 手机机型

    /**初始化
     *
     */
    init () {
        if ( CC_EDITOR ) return;
        require( 'ui' );
        require( 'generater-Id' );
        Global.newClass();                                      // 生成管理者
        // Global.initgetset();                                    // 初始化getset事件
        // Global.online();
        // Global.onResize();
        // Global.onPopstate();
        cc.IdGenerater && Global.getNewId( Global );            // 设置ID
    },

    /**生成管理者
     *
     */
    newClass () {
        var vv          = cc.vv;
        vv.EventTarget  = new cc.EventTarget();
        vv.AudioMgr     = new ( require( 'AudioMgr' ) )();
        vv.Loader       = new ( require( 'Loader' ) )();
    },

    /**转换时间
     *
     * @param time
     */
    conversionTime : function ( time ) {
        var SECOND = 1000,
            BRANCH = SECOND * 60,
            HOUR   = BRANCH * 60,
            DAY    = HOUR * 24;

        var day = Math.floor( time / DAY );         // 天

        time -= day * DAY;

        var hour = Math.floor( time / HOUR );       // 小时

        time -= hour * HOUR;

        var branch = Math.floor( time / BRANCH );   // 分

        time -= branch * BRANCH;

        var second = Math.floor( time / SECOND );   // 秒

        time -= second * SECOND;                    // 毫秒
        return {
            day         : day,
            hour        : hour,
            branch      : branch,
            second      : second,
            millisecond : time
        };
    },

    /**监听屏幕改变并强制改为横屏
     *
     */
    onResize () {
        if ( !cc.sys.isNative ) {
            cc.view.setResizeCallback( function () {
                if ( cc.sys.os === cc.sys.OS_IOS ) {
                    if ( document.body.scrollWidth > document.body.scrollHeight ) {
                        cc.view.setOrientation( cc.macro.ORIENTATION_LANDSCAPE );
                        // console.log('横屏');
                    } else {
                        cc.view.setOrientation( cc.macro.ORIENTATION_PORTRAIT );
                        // console.log('竖屏');
                    }
                }

                var widget = Global.widget,
                    i      = widget.length - 1;
                for ( ; i >= 0; i-- ) {
                    widget[ i ].updateAlignment();
                }

                cc.vv.main && cc.vv.main.updateBg();
            }.bind( this ) );
        }
    },

    /**监听返回操作
     *
     */
    onPopstate () {
        const pushHistory = function () {
            var state = {
                title : "title",
                url   : "#"
            };
            window.history.pushState( state, "title", "#" );
        };
        $( function () {
            pushHistory();
            window.addEventListener( "popstate", function ( e ) {
                // cc.vv.UserMgr.setUserGameData();
            }, false );
        } );
    },

    /**监听网络状态
     *
     */
    online () {
        window.ononline  = function () {
            // console.log("链接上网络了");
            // cc.vv.game.removePrefabByName('noNetwork');
        };
        window.onoffline = function () {
            // console.log("网络链接已断开");
            // cc.vv.game.prefabNameToNode('noNetwork');
        };
    },

    /**初始化getset事件
     *
     */
    initgetset () {
        cc.js.get( Global, 'time', function () {                 // 获取1970年到现在的毫秒数
            return cc.sys.now();
        } );
    },

    /**获取url中的参数值
     *
     * @param name  参数名
     */
    getQueryString ( name ) {
        var reg = new RegExp( '(^|&)' + name + '=([^&]*)(&|$)', 'i' );
        var r   = window.location.search.substr( 1 ).match( reg );
        if ( r != null ) {
            return unescape( r[ 2 ] );
        }
        return null;
    },

    /**获取uuid
     *
     * @returns {string} uuid
     */
    getUuid () {
        var s         = [];
        var hexDigits = "0123456789abcdef";
        for ( var i = 0; i < 36; i++ ) {
            s[ i ] = hexDigits.substr( Math.floor( Math.random() * 0x10 ), 1 );
        }
        s[ 14 ] = "4";
        s[ 19 ] = hexDigits.substr( ( s[ 19 ] & 0x3 ) | 0x8, 1 );
        s[ 8 ]  = s[ 13 ] = s[ 18 ] = s[ 23 ] = "-";

        var uuid = s.join( "" );
        return uuid;
    },

    /**转换成Unicode编码
     *
     * @param str   需要转换的字符串
     */
    encodeUnicode ( str ) {
        var res = [];
        for ( var i = 0; i < str.length; i++ ) {
            res[ i ] = ( "00" + str.charCodeAt( i ).toString( 16 ) ).slice( -4 );
        }
        return "\\u" + res.join( "\\u" );
    },

    /**Unicode编码转换成UTF-8
     *
     * @param str   需要转换的字符串
     */
    decodeUnicode ( str ) {
        str = str.replace( /\\/g, "%" );
        return unescape( str );
    },

    /**转换成html编码
     *
     * @param str   需要转换的字符串
     */
    htmlEncodeByRegExp ( str ) {
        var s = "";
        if ( str.length == 0 ) {
            return "";
        }
        s = str.replace( /&/g, "&amp;" );
        s = s.replace( /</g, "&lt;" );
        s = s.replace( />/g, "&gt;" );
        s = s.replace( / /g, "&nbsp;" );
        s = s.replace( /\'/g, "&#39;" );
        s = s.replace( /\"/g, "&quot;" );
        return s;
    },

    /**html编码转换成
     *
     * @param str   需要转换的字符串
     */
    UTFByHtmlEncode ( str ) {
        var s = "";
        if ( str.length == 0 ) {
            return "";
        }
        s = str.replace( /&amp;/g, "&" );
        s = s.replace( /&lt;/g, "<" );
        s = s.replace( /&gt;/g, ">" );
        s = s.replace( /&nbsp;/g, " " );
        s = s.replace( /&#39;/g, "\'" );
        s = s.replace( /&quot;/g, "\"" );
        return s;
    },

    /**
     * aes加密
     * @param content   要加密的内容
     * @param key       秘钥
     * @returns {*}
     */
    encrypt ( content, key ) {
        return CryptoJS.AES.encrypt( content, key || CRYPTO_KEY ).toString();
    },

    /**
     * aes解密
     * @param content   要加密的内容
     * @param key       秘钥
     * @returns {*}
     */
    decrypt ( content, key ) {
        return CryptoJS.AES.decrypt( content, key || CRYPTO_KEY ).toString( CryptoJS.enc.Utf8 );
    },

    /**获取本地数据
     *
     * @param key   存储的键
     * @param value 如果本地没有数据则返回该值
     */
    getData ( key, value ) {
        let val = CC_WECHATGAME ? wx.getStorageSync( key ) : cc.sys.localStorage.getItem( key );
        if ( typeof val === 'undefined' || val === null || val === '' || ( typeof val === 'number' && isNaN( val ) ) ) {
            return value;
        }
        return val;
    },

    /**设置本地数据
     *
     * @param key   存储的键
     * @param value 存储的值
     */
    setData ( key, value ) {
        CC_WECHATGAME ? wx.setStorageSync( key, value ) : cc.sys.localStorage.setItem( key, value );
    },

    /**提示
     *
     * @param str   需要显示的消息
     */
    tips ( str ) {
        var tips = new cc.Node();
        tips.addComponent( cc.Label );
        var scene = tips.parent = cc.director.getScene(),
            canvas = scene.$Canvas || scene.getChildByName( 'Canvas' );
        tips.setPosition( canvas.width >> 1, canvas.height * 0.7 );
        tips.Label.string = str;
        tips.runAction(
            cc.sequence(
                cc.delayTime( 1 ),
                cc.spawn(
                    cc.moveBy( 1, 0, 300 ),
                    cc.fadeOut( 1 )
                ),
                cc.callFunc( function () {
                    tips.destroy();
                } )
            )
        );
    },

    /**远程加载图片
     *
     * @param url       图片地址
     * @param Sprite    需要改变节点
     * @param type      图片的类型(比如png)
     * @param callback  回调
     */
    remoteLoadImages ( url, Sprite, type, callback ) {
        type = type || url.indexOf( '.png' ) !== -1 ? 'png' : 'jpg';
        cc.loader.load( { url : url, type : type }, function ( err, texture ) {
            if ( err ) return Global.log( '远程加载图片错误:', err );
            var spriteFrame = new cc.SpriteFrame( texture );
            var com         = Sprite.Sprite || Sprite;
            com && ( com.spriteFrame = spriteFrame );
            callback && callback( texture, spriteFrame );
        } );
    },

    /**图片转换成Base64
     *
     * @param url       图片路径
     * @param ext       后缀(比如png)
     * @param callback  回调函数
     */
    getUrlBase64 ( url, ext, callback ) {
        var canvas      = document.createElement( "canvas" );      // 创建canvas DOM元素
        var ctx         = canvas.getContext( "2d" );
        var img         = new Image();
        img.crossOrigin = 'Anonymous';
        img.src         = url;
        img.onload      = function () {
            canvas.width  = 60;                              // 指定画板的宽度，自定义
            canvas.height = 60;                             // 指定画板的高度,自定义
            ctx.drawImage( img, 0, 0, 60, 60 );               // 参数可自定义
            var dataURL = canvas.toDataURL( "image/" + ext );
            callback.call( this, dataURL );                   // 回掉函数获取Base64编码
            canvas = null;
        };
    },

    /**
     * ArrayBuffer转成Base64
     * @param   {ArrayBuffer}   buffer
     * @returns {string}        Base64
     */
    transformArrayBufferToBase64 ( buffer, type ) {
        var binary = '';
        var bytes  = new Uint8Array( buffer );
        for ( var len = bytes.byteLength, i = 0; i < len; i++ ) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        return `data:image/${type};base64,` + window.btoa( binary );
    },

    /**添加按钮的点击事件
     *
     * @param node              按钮节点
     * @param target            目标节点
     * @param component         目标组件名
     * @param handler           目标函数名
     * @param customEventData   携带的参数
     */
    addClickEvent ( node, target, component, handler, customEventData ) {
        console.log( component + ":" + handler );
        var eventHandler             = new cc.Component.EventHandler();                                     // 创建一个回调事件
        eventHandler.target          = target;                                                           // 目标节点
        eventHandler.component       = component;                                                     // 目标组件名
        eventHandler.handler         = handler;                                                         // 目标函数名
        eventHandler.customEventData = customEventData;                                         // 携带的参数

        var clickEvents = ( node.Button || node.addComponent( cc.Button ) ).clickEvents;            // 获取节点上的按钮事件
        clickEvents.push( eventHandler );                                                         // 把新建事件添加到回调
    },

    /**获取旋转一定角度后的位置
     *
     * @param pos       位置
     * @param node      中心节点
     */
    getAfterRotationPoint ( pos, node ) {
        const rotation = node.rotation;
        const angle    = rotation * ( Math.PI / 180 );
        return cc.pRotateByAngle( pos, node.getPosition(), angle );
    },

    /**获取两个节点的距离
     *
     * @param node1     节点1
     * @param node2     节点2
     */
    getLength ( node1, node2 ) {
        return cc.pDistance( node1.getPosition(), node2.getPosition() );
    },

    /**定时器
     *
     * @param callback  回调
     * @param param     携带参数需要包含在数组里面[param....]
     * @param target    指定对象
     * @param interval  间隔
     * @param repeat    让定时器触发 repeat + 1 次
     * @param delay     延迟多长时间开始触发
     * @param paused    值为 true，那么直到 resume 被调用才开始计时
     * @param tag       标记定时器
     */
    schedule ( callback, param, target, interval, repeat, delay, paused, tag ) {
        if ( !callback || !target ) {
            return;
        }
        Global.getNewId( target );
        if ( !param ) {
            return CCSchedule.schedule( callback, target, interval || 0, repeat, delay, paused );
        }
        if ( !Array.isArray( param ) ) {
            param = [ param ];
        }
        var id                     = Global.getScheduleId(), func;
        Global.allScheduleId[ id ] = tag || target;
        func                       = function () {
            if ( !Global.allScheduleId[ id ] ) {
                return CCSchedule.unschedule( func, target ) || ( id = null ) || ( func = null );
            }
            callback.apply( target, param );
        };
        CCSchedule.schedule( func, target, interval || 0, repeat, delay, paused );
        return id;
    },

    /**关闭定时器
     *
     * @param idOrCallback  id或函数
     * @param target        目标节点,参数1填函数的时候需要
     */
    unschedule ( idOrCallback, target ) {
        if ( target ) {
            return CCSchedule.unschedule( idOrCallback, target );
        }
        delete Global.allScheduleId[ id ];
    },

    /**获取指定对象的所有定时器
     *
     * @param target    指定对象
     */
    getIdByTarget ( target ) {
        var arr = [];
        for ( let i in Global.allScheduleId ) {
            if ( Global.allScheduleId[ i ] === target ) {
                arr.push( i );
            }
        }
        return arr;
    },

    /**根据标记获取定时器id
     *
     * @param tag   标记
     */
    getIdByTag ( tag ) {
        for ( let i in Global.allScheduleId ) {
            if ( Global.allScheduleId[ i ] === tag ) {
                return i;
            }
        }
        return null;
    },

    /**给对象添加一个_id或uuid属性
     *
     * @param target    需要添加的对象
     */
    getNewId ( target ) {
        !target._id && ( target._id = cc.IdGenerater.getNewId() );             // 需在源码engine\cocos2d\core\platform\id-generater.js增加cc.IdGenerater = IdGenerater.global;
        !target.uuid && ( target.uuid = target._id );
    },

    /**获取一个定时器id
     *
     */
    getScheduleId () {
        return ++Global.scheduleId;
    },

    /** 刷新子域的纹理
     *
     */
    _updateSubDomainCanvas () {
        if ( window.sharedCanvas != void 0 ) {
            Global.tex.initWithElement( window.sharedCanvas );
            Global.tex.handleLoadedTexture();
            Global.displaySprite.spriteFrame = new cc.SpriteFrame( Global.tex );
        }
    },

    /**获取随机数
     *
     * @param min 最小值
     * @param max 最大值
     */
    getRandomNum ( min, max ) {
        return Math.random() * ( max - min ) + min;
    },

    /**获取随机数并按照指定方式取整
     *
     * @param min   最小值
     * @param max   最大值
     * @param mode  取整方式(<0向下取整,0四舍五入,>1向上取整)
     */
    getRandomNum_Round ( min, max, mode ) {
        if ( mode < 0 ) {
            return Math.floor( Global.getRandomNum( min, max ) );
        } else if ( mode == 0 ) {
            return Math.round( Global.getRandomNum( min, max ) );
        } else if ( mode > 0 ) {
            return Math.ceil( Global.getRandomNum( min, max ) );
        }
    },

    /**获取一个数组中最大最小的xy的随机值
     *
     * @param arr   包含位置数组
     */
    getMaxAndMinByPointArr ( arr ) {
        var x = [];
        for ( let i = 0, len = arr.length; i < len; i++ ) {
            x.push( arr[ i ].x );
        }
        var y = [];
        for ( let i = 0, len = arr.length; i < len; i++ ) {
            y.push( arr[ i ].y );
        }
        return {
            maxX : Math.max.apply( Math, x ),
            minX : Math.min.apply( Math, x ),
            maxY : Math.max.apply( Math, y ),
            minY : Math.min.apply( Math, y )
        };
    },

    /**切换节点检测函数
     *
     * @param node  需要切换的节点
     */
    changeHitTest ( node ) {
        node._hitTest = Global.hitTest.bind( node );
    },

    /**检测触摸的是透明像素或图片
     *
     * @param point 坐标
     */
    hitTest ( point ) {
        var locationInNode = this.convertToNodeSpace( point );
        var size           = this.getContentSize();
        var rect           = cc.rect( 0, 0, size.width, size.height );
        var imgObj         = this.Sprite.spriteFrame.getTexture().getHtmlElementObj();
        if ( cc.rectContainsPoint( rect, locationInNode ) ) {
            if ( Global.onLucencyTouch( imgObj, locationInNode.x, size.height - locationInNode.y ) ) {
                return true;
            } else {
                return false;
            }
        }
    },

    /**检测触摸点是否是在图片内
     *
     * @param img   图片对象
     * @param x     x坐标
     * @param y     y坐标
     */
    onLucencyTouch ( img, x, y ) {
        var cvs    = document.createElement( "canvas" );
        var ctx    = cvs.getContext( '2d' );
        cvs.width  = 1;
        cvs.height = 1;
        ctx.drawImage( img, x, y, 1, 1, 0, 0, 1, 1 );
        var imgdata = ctx.getImageData( 0, 0, 1, 1 );
        return imgdata.data[ 3 ];
    },

    /**节点坐标转成世界坐标
     *
     * @param node  需要转换的节点
     * @param pos   需要转换的坐标
     */
    getNodeToWorldPoint ( node, pos ) {
        return node.convertToWorldSpaceAR( pos || cc.p() );
    },

    /**世界坐标转成节点坐标
     *
     * @param node  需要转换的节点
     * @param pos   需要转换的坐标
     */
    getWorldToNodePoint ( node, pos ) {
        return node.convertToNodeSpaceAR( pos || cc.p() );
    },

    /**节点A的坐标切换到节点B的坐标
     *
     * @param nodeA
     * @param nodeB
     */
    getNodeAToNodeBPoint ( nodeA, nodeB, pos ) {
        pos = Global.getNodeToWorldPoint( nodeA, pos );
        return Global.getWorldToNodePoint( nodeB, pos );
    },

    /**切换父节点并保持坐标不变
     *
     * @param node     需要切换的节点
     * @param parent   需要切换的父节点
     */
    changeParent ( node, parent ) {
        var pos     = Global.getNodeAToNodeBPoint( node, parent );
        node.parent = parent;
        node.setPosition( pos );
    },

    /** 打印消息
     *
     */
    log () {
        return console.log.apply( console, arguments );
    }
};
window.Global    = Global;
Global.init();