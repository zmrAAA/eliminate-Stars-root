cc.Class({
    extends: Script,

    init: function (data) {
        var
            self = this,
            qrcode = new QRCode(-1, QRErrorCorrectLevel.H);
        qrcode.addData(data);
        qrcode.make();

        var ctx = self.node.Graphics || self.node.addComponent(cc.Graphics);
        ctx.fillColor = cc.Color.BLACK;
        var moduleCount = qrcode.getModuleCount(),
            tileW = self.node.width / moduleCount,
            tileH = self.node.height / moduleCount,
            row = 0, col = 0, w, h;
        for (; row < moduleCount; row++) {
            for (; col < moduleCount; col++) {
                if (qrcode.isDark(row, col)) {
                    w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
                    h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
                    ctx.rect(Math.round(col * tileW), Math.round(row * tileH), w, h);
                }
            }
        }
        ctx.fill();
    }
});