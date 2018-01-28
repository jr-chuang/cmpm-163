let state = {
  clock: null,
  time: null,
  scene: null,
  camera: null,
  renderer: null,
  entities: {},
  meshes: {},
  passes: {},
  uniforms: {},
  keyboard: {
    keys: [],
    isPressed: function (keyCode) {
      return (typeof this.keys[keyCode] !== "undefined") ? (this.keys[keyCode] >= 1) : false;
    },
    startPressed: function (keyCode) {
      return (typeof this.keys[keyCode] !== "undefined") ? (this.keys[keyCode] === 1) : false;
    },
    update: function (deltaTime) {
      let len = this.keys.length;
      while (len--) {
        if (this.keys[len] >= 1) {
          this.keys[len] += deltaTime;
        }
      }
    }
  },
  loader: {
    items: 0,
    finishedLoading: null,
    changeCount: function (value) {
      this.items += value;
      if (this.items === 0) {
        this.finishedLoading();
      }
    }
  }
};

module.exports = state;
