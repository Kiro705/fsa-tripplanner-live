function State() {
    this.hotels = []
    this.restaurants = []
    this.activities = []
}

State.prototype.addPlace = function (varname, placeId) {
    if (!this[varname].includes(placeId)) {
        this[varname].push(placeId)
        return true
    } else return false
}
State.prototype.removePlace = function (varname, placeId) {
    if (this[varname].includes(placeId)) {
        this[varname].splice(this[varname].indexOf(placeId),1)
    }
}

State.prototype.clearState = function (){
    this.hotels = []
    this.restaurants = []
    this.activities = []
}

function Plan() {
    this.days = [new State()]
    this.currentday = 0
}

Plan.prototype.addPlaceToCurrentDay = function (varname, placeId) {
    return this.days[this.currentday].addPlace(varname, placeId)
}
Plan.prototype.removePlaceFromCurrentDay = function (varname, placeId) {
    this.days[this.currentday].removePlace(varname, placeId)
}
Plan.prototype.resetDays = function () {
    this.days = [new State()]
    this.currentday = 0
}

Plan.prototype.addNewDay = function () {
    this.days.push(new State())
    this.currentday += 1
}

Plan.prototype.removeDay = function () {
    this.days.splice(this.currentday, 1)
    this.currentday -= 1
}
Plan.prototype.switchDays = function (idx) {
    this.currentday = idx
}

module.exports = {State, Plan}  //, days}

