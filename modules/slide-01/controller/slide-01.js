app.controller('slide01', function ($scope, $timeout) {
  // Constructor
  var boxBuild = {};
  var listenter = {
    [BSCEvent.loaded]: function () {
      console.log('Slider loaded');
      $scope.isLoaded = true;
      var build = boxCarousel.getBoxInfo();
      var mgRight = build.typeMoveBox == BSCMoveBox.horizontal ? build.gap : 0;
      var mgBottom = build.typeMoveBox == BSCMoveBox.horizontal ? 0 : build.gap;
      $scope.slideItemStyle = {
        'width': build.itemWidth + 'px',
        'height': build.itemWidth + 'px',
        'margin-right': mgRight + 'px',
        'margin-bottom': mgBottom + 'px'
      };
    }
  };
  var boxTrans = {
    data: {
      name: 'demoData'
    },
    indexShowCurrent: {
      name: 'indexCurrent'
    }
  };
  var boxCarousel = null;

  var isTurnOnKeyDown = null;
  $scope.$on('build', build);
  $scope.$on('destroy', destroy);
  $scope.$on('resetDefault', resetDefault);

  function resetSlideBeforeBuild () {
    var sliderDemo = document.querySelector('.stt-slider-list');
    sliderDemo.removeAttribute('style');
    if (sliderDemo.classList.contains('stt-slider--horizontal'))
      sliderDemo.classList.remove('stt-slider--horizontal');
    if (sliderDemo.classList.contains('stt-slider--vertical'))
      sliderDemo.classList.remove('stt-slider--vertical');

    var sliderTrack = sliderDemo.querySelector('.stt-slider-track');
    sliderTrack.removeAttribute('style');
  }

  function build (e, data) {
    if ($scope.demoData) $scope.demoData.data.length = 0;
    $scope.isLoaded = false;
    $timeout(function () {
      resetSlideBeforeBuild();
      var box = data.box;
      var slideItems = setFillArray(box.dataLength);
      var containerWidth = (box.typeMoveBox == BSCMoveBox.horizontal)
        ? document.querySelector('.slide01-controller').offsetWidth
        : document.querySelector('.slide01-controller').offsetHeight;
      boxBuild = {
        ele: '#demoSlider', // default
        slidesToShow: box.slidesToShow,
        containerWidth,
        indexShowDefault: box.indexShowDefault,
        infinite: box.isInfinite,
        speed: box.speed,
        gap: box.gap,
        typeMoveBox: box.typeMoveBox
      };
      boxCarousel = new BoxSlideCarousel(boxBuild, listenter, boxTrans, $scope);
      boxCarousel.init({ data: slideItems });
      if (!isTurnOnKeyDown) {
        turnOnKeyDown();
        isTurnOnKeyDown = true;
      }
    }, 300);
  }

  function destroy () {
    boxCarousel.resetEmptyBox();
    if (isTurnOnKeyDown) {
      turnOffKeyDown();
      isTurnOnKeyDown = false;
    }
  }

  function resetDefault () {
    var build = boxCarousel.getBoxInfo();
    var currentData = build.infinite
      ? $scope.demoData.rootData
      : $scope.demoData.data;
    boxCarousel.resetBox({ data: currentData });
  }

  function turnOnKeyDown () {
    document.addEventListener('keydown', onKeyDown);
  }

  function turnOffKeyDown () {
    document.removeEventListener('keydown', onKeyDown);
  }

  function onKeyDown(e) {
    $scope.$apply(function() {
      switch(e.keyCode) {
        case 38: // UP
          console.log('up');
          boxCarousel.moveUp();
          break;
        case 40: // DOWN
          boxCarousel.moveDown();
          break;
        case 37: // LEFT
          boxCarousel.moveLeft();
          break;
        case 39: // RIGHT
          boxCarousel.moveRight();
          break;
      }
    });
  }
});
