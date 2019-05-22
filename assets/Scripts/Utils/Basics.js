const Basics   = cc.Class( {
    extends : Script,

    properties : {
        prefanName : '',
        btn_close  : cc.Node,                 //关闭按钮
    },

    onLoad () {
        Global.addClickEvent( this.btn_close, this.node, this.prefanName, 'close' );
    },

    close () {
        this.onClose && this.onClose();
        cc.vv.game.removePrefabByName( this.prefanName );
    }
} );
module.exports = Basics;