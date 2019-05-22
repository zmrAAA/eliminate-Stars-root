var NonUuidMark = '.';

function IdGenerater(category) {
    this.id = 0 | (Math.random() * 998);

    this.prefix = category ? (category + NonUuidMark) : '';
}

IdGenerater.prototype.getNewId = function () {
    return this.prefix + (++this.id);
};
cc.IdGenerater = new IdGenerater('Global');
module.exports = IdGenerater;
