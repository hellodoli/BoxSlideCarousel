app.controller('main-controller', function ($scope) {
  // Default Scope
  $scope.slidesToShow = 5;
  $scope.numberItems = 10;
  $scope.speed = 250;
  $scope.typeMoveBox = BSCMoveBox.horizontal;
  $scope.isInfinite = false;
  $scope.indexShowDefault = 2;
  $scope.gap = 15;

  $scope.errorMessage = {
    indexShowDefault: ''
  };

  var formControls = document.getElementById('formUserControls');
  formControls.addEventListener('submit', function (e) {
    e.preventDefault();
  });

  // Check valid function
  $scope.isValidNumberItem = function () {
    if (isPositiveNumber($scope.numberItems, false)) return true;
    return false;
  };

  $scope.isValidShowItem = function () {
    if (isPositiveNumber($scope.slidesToShow, false)) return true;
    return false;
  };

  $scope.isValidSpeed = function () {
    if (isPositiveNumber($scope.speed, false)) return true;
    return false;
  };

  $scope.isValidGap = function () {
    if (isPositiveNumber($scope.gap)) return true;
    return false;
  };

  $scope.isValidIndexShowDefault = function () {
    if (isPositiveNumber($scope.indexShowDefault)) {
      if (parseInt($scope.indexShowDefault) < ($scope.slidesToShow)) {
        $scope.errorMessage.indexShowDefault = '';
        return true;
      }
      $scope.errorMessage.indexShowDefault = '"Index show item" must smaller "Show item"';
      return false;
    }
    return false;
  };

  $scope.isReadyBuild = function () {
    if ($scope.isValidNumberItem() && $scope.isValidShowItem() 
    && $scope.isValidSpeed() && $scope.isValidGap() && $scope.isValidIndexShowDefault()) {
      return true;
    }
    return false;
  };

  // Controls function
  $scope.isStartBuild = false;

  $scope.startBuild = function () {
    if ($scope.isReadyBuild()) {
      $scope.isStartBuild = true;
      var box = {
        dataLength: $scope.numberItems,
        slidesToShow: $scope.slidesToShow,
        isInfinite: $scope.isInfinite,
        speed: $scope.speed,
        typeMoveBox: $scope.typeMoveBox,
        gap: $scope.gap,
        indexShowDefault: $scope.indexShowDefault
      };
      $scope.$broadcast('build', { box });
    }
  };

  $scope.startDestroy = function () {
    if ($scope.isStartBuild) {
      $scope.isStartBuild = false;
      $scope.$broadcast('destroy');
    }
  };

  $scope.startResetDefault = function () {
    if ($scope.isStartBuild) {
      $scope.$broadcast('resetDefault');
    }
  };
});