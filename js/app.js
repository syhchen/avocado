angular.module('avocado', ['firebase', 'ngTagsInput',])

.controller('SearchCtrl', function($scope, $firebase, $q) {
  // Main app controller, empty for the example
  $scope.keywords = $firebase(new Firebase('https://guac.firebaseio.com/keywords'));

  $scope.selected = undefined;
  $scope.search = undefined;
  $scope.selected_sites = [];



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
          .take(3)
          .value();

    deferred.resolve(items);
    return deferred.promise;
  }

  $scope.updateTags = function() {
    $('.introduction').fadeOut()

    var tags = $scope.search;

    var search_tags = _.intersection(tags, $scope.keywords.$getIndex()),
        sites = [];

    search_tags.forEach(function(tag) {
      sites = sites.concat(_.keys($scope.keywords[tag].sites))
    })

    sites = _.countBy(sites)
    sites = _.pairs(sites).map(function(d) {
      return {
        url: d[0],
        weight: d[1]/tags.length
      }
    })

    var fb = new Firebase('https://guac.firebaseio.com')

    $scope.selected_sites = [];

    // _.flatten(sites).forEach(function(site) {
    //   fb.child('pages/' + site.url).once('value', function(snapshot) {
    //     var page_info = snapshot.val();

    //     $scope.selected_sites.push(page_info);
    //     $scope.$apply();
    //   })
    // })

    sites = _.flatten(sites);

    async.map(sites, getSiteFromFirebase, function(err, results) {
      updateD3(results);
      console.log(results)
    })

    function getSiteFromFirebase(site, callback) {
      fb.child('pages/' + site.url).once('value', function(snapshot) {
        var page_info = snapshot.val();

        page_info.weight = site.weight;

        callback(null, page_info);
      })
    }

    function updateD3(result) {
      var svg = d3.select('#graph')
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "bubble");

      var diameter = 960,
        color = d3.scale.category20c();

      var force = d3.layout.force()
        .size([1200,500])
        .nodes(result)
        .charge(-600)
        .on("tick", tick)
        .start();

      var node = svg.selectAll(".node")
        .data(force.nodes())
      .enter().append("g")
        .attr("class", "node")
        .call(force.drag);
        
      node.append('circle')
        .attr('r', '60px')
        .attr('fill', function(d,i) { return color(i); })

      node.append("text")
        .attr("y", 70)
        .attr("dy", ".35em")
        .attr('text-anchor', 'middle')
        .text(function(d) { return d.title; });


      function tick() {
        node
          .attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; });
          }

    }
  }
});