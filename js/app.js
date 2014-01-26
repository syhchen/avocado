angular.module('avocado', ['firebase', 'ngTagsInput',])

.controller('SearchCtrl', function($scope, $firebase, $q) {
  // Main app controller, empty for the example
  $scope.keywords = $firebase(new Firebase('https://guac.firebaseio.com/keywords'));

  $scope.selected = undefined;

  $scope.loadSuperheroes = function($query) {
    var deferred = $q.defer();

      items = _.chain(files[name])
          .filter(function(x) { return x.toLowerCase().indexOf(query.toLowerCase()) > -1; })
          .take(10)
          .value();

      deferred.resolve(items);
      return deferred.promise;
  };

  $scope.loadKeywords = function($query) {
    var items, deferred = $q.defer();

    // console.log($scope.keywords)

    items = _.chain($scope.keywords.$getIndex())
          .filter(function(x) { return x.toLowerCase().indexOf($query.toLowerCase()) > -1; })
          .take(10)
          .value();

    deferred.resolve(items);
    return deferred.promise;
  }

  $scope.hideIntroduction = function() {
    $('.introduction').fadeOut()
  }
});