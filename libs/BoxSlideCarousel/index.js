/*
  * Quản lý Box carousel slide
*/

var BSCEvent = {
  loaded: 'loaded', // fired khi init chạy xong
  // update thêm sau
};

var BSCMoveBox = {
  horizontal: 'h', // loại Box khi move trái hoặc phải sẽ slide
  vertical: 'v' // loại Box khi move lên hoặc xuống sẽ slide
};

/*
  *  Parameter
  *  - box: box create value (object)
  *     + isBoxGap: box có khoảng cách giữa các item hay không (Boolean) - mặc định true
  *     + gap: khoảng cách giữa các item (Number || 'auto') - mặc định 'auto'
  *     + slidesToShow: số item show (Number) - mặc định 1
  *     + ele: Id or Class of element DOM (ex: '#abcd', '.abcd')
  *     + indexShowDefault: item ở vị trí nào sẽ active (Number) - mặc định 0
  *     + infinite: slide infinite hay không (Boolean) - mặc định false
  *     + containerWidth: container width của box (Number) - mặc định 800
  *     + speed: tốc độ slide (Number) - mặc định 250
  *  - listenerInput: (object)
  *     Ex:
  *      var listener = {
  *        [BSCEvent[type]]: function () { // to do code },
  *        ....
  *      };
  *  - trans: Object gửi vào để set scope
  *      Ex:
          var trans = {
            data: {
              name: 'Tên muốn đặt của scope',
              default: { data: [] }
            },
            indexShowCurrent: {
              name: 'Tên muốn đặt của scope'
            }
          };
  *  - $scope: $scope của Controller
*/
/*
  HTML SET UP:
  <div id="eleId" class="stt-slider">
    <div class="stt-slider-list">
      <div class="stt-slider-track">
        <div class="stt-slider-slide" ng-repeat="item in [trans.data.name] track by $index"
            ng-class="{ 'active': [trans.indexShowCurrent.name] == $index }">
        </div>
      </div>
    </div>
  </div>
*/
function BoxSlideCarousel (box, listenerInput, trans, $scope) {
  var self = this;
  var listener = {};
  var move = 0;
  var speed = isPositiveNumber(box.speed) ? parseInt(box.speed) : 250;
  var threshHoldItem = 0.9;
  var threshHoldGap = 0.1;
  var isBoxGap = (box.isBoxGap == true || (typeof box.isBoxGap == 'undefined')) ? true : false; // gap or not
  if (isBoxGap) { // set gap auto or not
    this.gap = isPositiveNumber(box.gap) ? parseFloat(box.gap) : 'auto';
  } else {
    this.gap = 0;
  }
  var sliderTrackClass = '.stt-slider-track';
  var sliderListClass = '.stt-slider-list';
  var sliderItemClass = '.stt-slider-slide';
  var sliderVClass = '.stt-slider--vertical';
  var sliderHClass = '.stt-slider--horizontal';
  this.col = isPositiveNumber(box.slidesToShow, false) ? parseInt(box.slidesToShow) : 1; // slide to show
  this.ele = document.querySelector(box.ele); // box elemement
  var sliderTrack = null;
  var sliderList = null;
  if (this.ele) {
    sliderList = this.ele.querySelector(sliderListClass);
    sliderTrack = this.ele.querySelector(sliderTrackClass);
  }
  this.containerSuper = 0; // slick track width
  this.containerWidth = isPositiveNumber(box.containerWidth) ? parseFloat(box.containerWidth) : 800; // container Width (slick list width)
  this.itemWidth = 0; // item Width
  var infinite = (box.infinite == true) ? true : false; // infinite or not
  var indexShowDefault = isPositiveNumber(box.indexShowDefault) ? parseInt(box.indexShowDefault) : 0; // active index Item default
  if (indexShowDefault >= this.col) indexShowDefault = 0;
  this.moveLeft = null;
  this.moveRight = null;
  this.moveUp = null;
  this.moveDown = null;
  // type move box
  var typeMoveBox = BSCMoveBox.horizontal;
  setTypeBox(box.typeMoveBox);
  
  var scope = $scope ? $scope : null; // scope from Controller

  // holder scope name
  var data, indexShowCurrent;

  // helper
  function setUpperCaseFirst (string) {
    return string[0].toUpperCase() + string.substring(1, string.length);
  };

  function isNumber (input) {
    return !isNaN(parseInt(input)) && isFinite(input);
  }
    
  function isPositiveNumber (input, isZero) {
    if (typeof isZero == 'undefined') isZero = true;
    else isZero = false;

    if (isNumber(input)) {
      if (isZero) {
        if (parseInt(input) >= 0) return true; // default
      } else {
        if (parseInt(input) > 0) return true;
      }
      return false;
    }
    return false;
  }
  
  this.setBoxItem = function () {
    if (isPositiveNumber(this.containerWidth) && isPositiveNumber(this.col, false)) {
      this.containerWidth = parseFloat(this.containerWidth);
      this.col = parseInt(this.col);
      isBoxGap = false;
      this.gap = 0;
      this.itemWidth = (this.containerWidth / this.col);
      return true;
    }
    return false;
  };
    
  this.setBoxItemWithGap = function () {
    if (isPositiveNumber(this.containerWidth) && isPositiveNumber(this.col, false)) {
      this.containerWidth = parseFloat(this.containerWidth);
      this.col = parseInt(this.col);
      isBoxGap = true;
      if (this.gap == 'auto') { // set gap auto
        if (this.col == 1) {
          this.itemWidth = this.containerWidth;
          this.gap = 0;
        } else {
          this.itemWidth = threshHoldItem*(this.containerWidth / this.col);
          this.gap = threshHoldGap/(this.col - 1)*this.containerWidth;
        }
      } else { // set gap by user (this.gap đã có rồi)
        if (this.col == 1) {
          this.itemWidth = this.containerWidth;
        } else {
          var totalGap = this.gap*(this.col - 1);
          this.itemWidth = (this.containerWidth - totalGap)/this.col;
          if (this.itemWidth < 0) { // invalid case
            this.itemWidth = 0;
            this.gap = 0;
          }
        }
      }
      return true;
    }
    return false;
  };

  function turnOnMove () {
    if (typeMoveBox == BSCMoveBox.horizontal) {
      self.moveLeft = movePrev;
      self.moveRight = moveNext;
      self.moveUp = function () {};
      self.moveDown = function () {};
    } else {
      self.moveUp = movePrev;
      self.moveDown = moveNext;
      self.moveLeft = function () {};
      self.moveRight = function () {};
    }
  }

  function turnOffMove () {
    self.moveLeft = function () {};
    self.moveRight = function () {};
    self.moveUp = function () {};
    self.moveDown = function () {};
  }

  function setTypeBox (typeBox) {
    switch (typeBox) {
      case BSCMoveBox.vertical:
        typeMoveBox = BSCMoveBox.vertical;
        break;
      default:
        typeMoveBox = BSCMoveBox.horizontal;
        break;
    }
    setClassBasedTypeBox();
  }

  function setClassBasedTypeBox () {
    if (self.ele) {
      var klass = (typeMoveBox == BSCMoveBox.horizontal)
        ? sliderHClass.substring(1, sliderHClass.length)
        : sliderVClass.substring(1, sliderVClass.length);
      self.ele.classList.add(klass);
    }
  }

  // if has true param => loaded Event will fired
  function buildBox (isRunLoaded) {
    if (!self.ele) self.ele = document.querySelector(box.ele);
    var parent = self.ele;

    // set sliderList
    if (!sliderList) sliderList = parent.querySelector(sliderListClass);
    if (!sliderList && parent.classList.contains(sliderListClass.substring(1, sliderListClass.length))) {
      sliderList = self.ele;
    }
    if (sliderList) {
      if (typeMoveBox == BSCMoveBox.horizontal) {
        sliderList.style.width = self.containerWidth + 'px';
      } else {
        sliderList.style.height = self.containerWidth + 'px';
      }
    }

    // set sliderTrack
    if (!sliderTrack) sliderTrack = parent.querySelector(sliderTrackClass);
    if (sliderTrack) {
      if (infinite) {
        move = scope[data].len*(-(self.itemWidth + self.gap));
      } else {
        move = 0;
      }
      sliderTrack.style.opacity = 1;
      if (typeMoveBox == BSCMoveBox.horizontal) {
        sliderTrack.style.width = self.containerSuper + 'px';
        sliderTrack.style.transform = 'translate3d(' + move + 'px, 0, 0)';
      } else {
        sliderTrack.style.height = self.containerSuper + 'px';
        sliderTrack.style.transform = 'translate3d(0,' + move + 'px, 0)';
      }
    }
    
    // set sliderItem
    /*setTimeout(function () {
      var sliderItem = parent.getElementsByClassName(sliderItemClass.substring(1, sliderItemClass.length));
      if (sliderItem.length > 0) {
        console.log(sliderItem.length);
        for (var i = 0; i < sliderItem.length; i++) {
          console.log(i);
          sliderItem[i].style.width = self.itemWidth + 'px';
          sliderItem[i].style.marginRight = self.gap + 'px';
        }
      }
    });*/

    // check listener and dispatch Loaded Event
    if (typeof isRunLoaded == 'undefined') isRunLoaded = true;
    if (isRunLoaded && (typeof listener[BSCEvent.loaded] == 'function')) {
      listener[BSCEvent.loaded]();
    }
  }

  this.processDataInfinite = function (data, id) {
    const length = data.length;
    const lengthS = parseInt(length / 2);

    var copyData = data.slice();
    var data1 = copyData.slice(0, lengthS); // [1 2]
    var data2 = copyData.slice(lengthS, length); // [3 4 5]

    for (var i = data2.length - 1; i >= 0; i--) {
      copyData.unshift(data2[i]);
    }

    for (var i = 0; i < data1.length; i++) {
      copyData.push(data1[i]);
    }

    return {
      id, // id ngữ cảnh
      data: copyData, // result data [3 4 5 1 2 3 4 5 1 2]
      len: data2.length, // chiều dài data2: [3 4 5] =>  3
      rootData: data, // data gốc
      rootDataLength: length // chiều dài data gốc: [1 2 3 4 5] => 5
    };
  };

  this.processDataInfiniteNew = function (data, id) {
    var length = data.length;
    var copyData = data.slice();
    var dataClone1 = copyData.slice((length - this.col), length);
    var dataClone2 = copyData.slice();

    for (var i = dataClone1.length - 1; i >= 0; i--) {
      copyData.unshift(dataClone1[i]);
    }

    for (var i = 0; i < dataClone2.length; i++) {
      copyData.push(dataClone2[i]);
    }
    console.log('copyData: ', copyData);
    return {
      id, // id ngữ cảnh
      len: dataClone1.length, // length dataClone 1
      data: copyData, // result data [(dataClone 1)|1 2 3 4 5|(dataClone 2)]
      rootData: data, // data gốc [1 2 3 4 5]
      rootDataLength: length // chiều dài data gốc: [1 2 3 4 5] => 5
    };
  };

  function checkScopeHolderName () {
    // set indexShowCurrent
    if (!trans.indexShowCurrent) {
      trans.indexShowCurrent = {};
      trans.indexShowCurrent.name = 'indexShowCurrent' + setUpperCaseFirst(trans.data.name);
    }
    indexShowCurrent = trans.indexShowCurrent.name;
  }

  function checkScopeHolderValue (newData) {
    if (self.col >= newData.data.length) { // show một lúc toàn bộ thì tắt slide đi
      infinite = false;
      turnOffMove();
    } else {
      infinite = (box.infinite == true) ? true : false;
      turnOnMove();
    }

    if (infinite) {
      // set dataInfinite
      scope[data] = self.processDataInfiniteNew(newData.data, newData.id);
      // set indexShowCurrent
      scope[indexShowCurrent] = scope[data].len + indexShowDefault;
    } else {
      scope[data].data = newData.data;
      // set indexShowCurrent
      if (indexShowDefault >= newData.data.length) {
        scope[indexShowCurrent] = 0;
      } else {
        scope[indexShowCurrent] = indexShowDefault;
      }
    }
    // set this.containerSuper
    self.containerSuper = (self.itemWidth + self.gap)*scope[data].data.length;
  }

  this.resetBox = function (newData, isRunLoaded) {
    if (scope) {
      checkScopeHolderValue(newData);
      buildBox(isRunLoaded); // build box base
    }
  };

  this.resetEmptyBox = function (isRunLoaded) {
    this.resetBox({ data: [] }, isRunLoaded);
  };

  if (isBoxGap) { // Box có gap
    this.setBoxItemWithGap();
  } else { // Box không có gap
    this.setBoxItem();
  }

  if (scope && trans) {
    data = trans.data.name;
    if (!trans.data.default) {
      trans.data.default = {};
      trans.data.default.data = [];
    }
    scope[data] = trans.data.default;
    checkScopeHolderName();

    // set Listener
    if (listenerInput) listener = listenerInput;
  }

  this.setSpeed = function (newSpeed) {
    if (isPositiveNumber(newSpeed)) {
      speed = parseInt(newSpeed);
      return true;
    }
    return false;
  };

  this.init = function (newData, isRunLoaded) {
    this.resetBox(newData, isRunLoaded);
  };

  this.getBoxInfo = function () {
    return {
      speed,
      infinite,
      isBoxGap,
      typeMoveBox,
      ele: this.ele,
      sliderList,
      sliderTrack,
      containerSuper: this.containerSuper,
      containerWidth: this.containerWidth,
      slidesToShow: this.col,
      indexShowDefault,
      itemWidth: this.itemWidth,
      gap: this.gap
    };
  };

  this.getScopeHolderName = function () {
    return {
      data,
      indexShowCurrent
    }
  };

  this.updateData = function (newData, isRunLoaded) {
    var dataLength = newData.data.length;
    if (dataLength == 0) {
      this.resetEmptyBox();
      return;
    }
    var defaultTrans = (this.itemWidth + this.gap);
    if (this.col >= dataLength) {
      turnOffMove();
      var a = infinite ? scope[data].len : 0; // from infinite or not infinite
      if ((scope[indexShowCurrent] - a) >= dataLength) {
        scope[indexShowCurrent] = dataLength - 1;
      } else {
        scope[indexShowCurrent] -= a;
      }

      infinite = false;
      move = 0;
      scope[data].data = newData.data;
    } else {
      infinite = (box.infinite == true) ? true : false;
      if (infinite) {
        scope[data] = this.processDataInfiniteNew(newData.data, newData.id);
      } else {
        scope[data].data = newData.data;
      }
      var lastIndexNewData = (infinite) ? (scope[data].len + dataLength - 1) : (dataLength - 1);
      if (scope[indexShowCurrent] > lastIndexNewData) {
        scope[indexShowCurrent] = lastIndexNewData;
        move = -defaultTrans*(scope[indexShowCurrent] - indexShowDefault);
      }
      turnOnMove();
    }

    // buid box base
    this.containerSuper = defaultTrans*scope[data].data.length;
    if (sliderList) {
      sliderList.style.width = this.containerWidth + 'px';
    }

    if (sliderTrack) {
      sliderTrack.style.opacity = 1;
      sliderTrack.style.width = this.containerSuper + 'px';
      sliderTrack.style.transform = 'translate3d(' + move + 'px, 0, 0)';
    }

    if (typeof isRunLoaded == 'undefined') isRunLoaded = true;
    if (isRunLoaded && (typeof listener[BSCEvent.loaded] == 'function')) {
      listener[BSCEvent.loaded]();
    }
  };

  function moveSmoothSlide (translate) {
    if (sliderTrack) {
      var transform = (typeMoveBox == BSCMoveBox.horizontal)
        ? 'translate3d(' + Math.round(translate) + 'px, 0px, 0px)'
        : 'translate3d(0px,' + Math.round(translate) + 'px, 0px)';

      sliderTrack.style.transform = transform;
      sliderTrack.style.transition = 'transform ' + speed + 'ms ease 0s';
      setTimeout(function () {
        sliderTrack.style.transition = '';
      }, speed);
    }
  }

  function moveSmoothSlideCut (fakeTranslate, translate) {
    if (sliderTrack) {
      var fakeTransform = (typeMoveBox == BSCMoveBox.horizontal)
        ? 'translate3d(' + Math.round(fakeTranslate) + 'px,0px,0px)'
        : 'translate3d(0px,' + Math.round(fakeTranslate) + 'px,0px)';
      sliderTrack.style.transform = fakeTransform;

      setTimeout(function () {
        sliderTrack.style.transition = 'transform ' + speed + 'ms ease 0s';
        var transform = (typeMoveBox == BSCMoveBox.horizontal)
          ? 'translate3d(' + Math.round(translate) + 'px,0px,0px)'
          : 'translate3d(0px,' + Math.round(translate) + 'px,0px)';
        sliderTrack.style.transform = transform;
        setTimeout(function () {
          sliderTrack.style.transition = '';
        }, speed);
      }, (speed / 10));
    }
  }

  function moveNext () {
    var defaultTrans = this.itemWidth + this.gap;
    if (infinite) {
      var rootDataLength = scope[data].rootDataLength;
      var dataClone1Length = scope[data].len;
      if (scope[indexShowCurrent] >= (dataClone1Length + rootDataLength - 1)) {
        // cut smooth slide êm như nhung
        scope[indexShowCurrent] = dataClone1Length;
        move = (-defaultTrans) * (scope[indexShowCurrent] - indexShowDefault);
        var fakeTrans = move + defaultTrans;
        moveSmoothSlideCut(fakeTrans, move);
      } else {
        scope[indexShowCurrent] += 1;
        move -= defaultTrans;
        moveSmoothSlide(move);
      }
    } else {
      if (scope[indexShowCurrent] < (scope[data].data.length - 1)) {
        scope[indexShowCurrent] += 1;
        move -= defaultTrans;
        moveSmoothSlide(move);
      }
    }
  }

  function movePrev () {
    var defaultTrans = this.itemWidth + this.gap;
    if (infinite) {
      var rootDataLength = scope[data].rootDataLength;
      var dataClone1Length = scope[data].len;
      if (scope[indexShowCurrent] <= dataClone1Length) {
        // cut smooth slide êm như nhung
        scope[indexShowCurrent] = (dataClone1Length + rootDataLength - 1);
        move = (-defaultTrans) * (scope[indexShowCurrent] - indexShowDefault);
        var fakeTrans = move - defaultTrans;
        moveSmoothSlideCut(fakeTrans, move);
      } else {
        scope[indexShowCurrent] -= 1;
        move += defaultTrans;
        moveSmoothSlide(move);
      }
    } else {
      if (scope[indexShowCurrent] > 0) {
        scope[indexShowCurrent] -= 1;
        move += defaultTrans;
        moveSmoothSlide(move);
      }
    }
  }
}
