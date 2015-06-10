'use strict';

angular.module('ngDependencyGraph')
  .directive('dgGraph', function($rootScope, $timeout, appDeps, dev, Component, Const, currentView) {

    return {
      link: function(scope, elm, attrs) {


        function update() {
          var currentGraph = currentView.graph;

          force.nodes(currentGraph.nodes)
            .links(currentGraph.links);

          links = svg.selectAll('.link')
            .data(force.links(), _.property('_id'));

          links.enter()
            .insert("line", ":first-child") // this needs to be rendered first -> prepend
            .attr('class', 'link')
            .attr('marker-end', 'url(#end)');
          links.exit().remove();

          nodes = svg.selectAll('.node')
            .data(force.nodes(), _.property('_id'));

          nodesEnter = nodes
            .enter()
            .append('g')
            .attr('class', _.property('type'))
            .classed('node', true)
            .on('mouseover', mouseover)
            .on('mouseout', mouseout)
            .on('mousedown', nodeClick)
            .call(force.drag);

          nodesEnter.append('circle')
            .attr('r', 8);

          nodesEnter.append('text')
            .attr('x', 12)
            .attr('dy', '.35em')
            .text(function(d) {
              return d.name;
            });
          nodes.exit().remove();

          force
            .size([width, height])
            .linkDistance(80)
            .charge(-400)
            .on('tick', tick)
            .start();
        }


        function tick() {
          links
            .attr('x1', function(d) {
              return d.source.x;
            })
            .attr('y1', function(d) {
              return d.source.y;
            })
            .attr('x2', function(d) {
              return d.target.x;
            })
            .attr('y2', function(d) {
              return d.target.y;
            });

          nodes
            .attr('transform', function(d) {
              return 'translate(' + d.x + ',' + d.y + ')';
            });
        }

        function mouseover() {
          d3.select(this).select('circle')
            .transition()
            .duration(Const.View.HOVER_TRANSITION_TIME)
            .attr('r', 12);
        }

        function mouseout() {
          d3.select(this).select('circle')
            .transition()
            .duration(Const.View.HOVER_TRANSITION_TIME)
            .attr('r', 8);
        }

        function nodeClick(d) {
          $rootScope.$apply(function() {
            currentView.chooseNode(d);
          });
        }

        scope.$on('chooseNode', function(event, d) {
          var x = width/2 - d.x;
          var y = height/2 - d.y;

          zoom.translate([x, y]).event(svg);
        });


        var width = elm.width();
        var height = elm.height();

        var zoom = d3.behavior.zoom()
          .scaleExtent([0.5 ,2])
          .on('zoom', redraw);


        var svg = d3.select(elm[0]).append('svg')
          .call(zoom)
          .append('g');

        function redraw() {
          console.log('redraw!');
          svg.attr('transform',
              'translate(' + d3.event.translate + ')' +
              ' scale(' + d3.event.scale + ')');
        }   

        /**
         * Definitions of markers
         */
        svg.append('svg:defs').selectAll('marker')
            .data(['end'])      // Different link/path types can be defined here
          .enter().append('svg:marker')    // This section adds in the arrows
            .attr('id', String)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 18)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('fill', '#eee')
            .attr('orient', 'auto')
          .append('svg:path')
            .attr('d', 'M0,-3L10,0L0,3');

        var force = d3.layout.force();
          
        var links, nodes, nodesEnter;

        update();
        scope.$on('updateGraph', update);


      }
    };

  });
