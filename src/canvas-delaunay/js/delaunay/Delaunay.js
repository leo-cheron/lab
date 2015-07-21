////////////////////////////////////////////////////////////////////////////////
//
// Delaunay Triangulation, adapted from Joshua Bell code
//
////////////////////////////////////////////////////////////////////////////////

"use strict";

var DelaunayVertex = require("./DelaunayVertex");
var DelaunayTriangle = require("./DelaunayTriangle");
var DelaunayEdge = require("./DelaunayEdge");

/**
 * Delaunay
 * @constructor
 */
// var Delaunay = module.exports = function() {};

module.exports =
{
	/**
	 * Perform the Delaunay Triangulation of a set of vertices.
	 *
	 * @params
	 * vertices: Array of Vertex objects
	 *
	 * @returns
	 * Array of Triangles
	 */
	triangulate: function(vertices)
	{
		var triangles = [];

		// First, create a "supertriangle" that bounds all vertices
		var st = this.createBoundingTriangle(vertices);
		triangles.push(st);

		// Next, begin the triangulation one vertex at a time
		var i = 0;
		var vertex;
		while((vertex = vertices[i++]) !== undefined) 
		{
			// NOTE: This is O(n^2) - can be optimized by sorting vertices
			// along the x-axis and only considering triangles that have
			// potentially overlapping circumcircles
			this.addVertex(vertex, triangles);
		}

		//
		// Remove triangles that shared edges with "supertriangle"
		//
		for(i in triangles )
		{
			var triangle = triangles[i];

			if(triangle.v0 == st.v0 || triangle.v0 == st.v1 || triangle.v0 == st.v2 || triangle.v1 == st.v0 || triangle.v1 == st.v1 || triangle.v1 == st.v2 || triangle.v2 == st.v0 || triangle.v2 == st.v1 || triangle.v2 == st.v2)
				delete triangles[i];
		}

		return triangles;
	},

	// Internal: create a triangle that bounds the given vertices, with room to spare
	createBoundingTriangle: function(vertices)
	{
		// NOTE: There's a bit of a heuristic here. If the bounding triangle
		// is too large and you see overflow/underflow errors. If it is too small
		// you end up with a non-convex hull.

		var minx, miny, maxx, maxy;
		var i = 0;
		var vertex;
		while((vertex = vertices[i++]) !== undefined) 
		{
			if(minx === undefined || vertex.x < minx)
				minx = vertex.x;
			if(miny === undefined || vertex.y < miny)
				miny = vertex.y;
			if(maxx === undefined || vertex.x > maxx)
				maxx = vertex.x;
			if(maxy === undefined || vertex.y > maxy)
				maxy = vertex.y;
		}

		var dx = (maxx - minx ) * 10;
		var dy = (maxy - miny ) * 10;

		var stv0 = new DelaunayVertex(minx - dx, miny - dy * 3, null);
		var stv1 = new DelaunayVertex(minx - dx, maxy + dy, null);
		var stv2 = new DelaunayVertex(maxx + dx * 3, maxy + dy, null);
		return new DelaunayTriangle(stv0, stv1, stv2);
	},

	// Internal: update triangulation with a vertex
	addVertex: function(vertex, triangles)
	{
		var edges = [];

		// Remove triangles with circumcircles containing the vertex
		var i;
		for(i in triangles )
		{
			var triangle = triangles[i];
			if(triangle.InCircumcircle(vertex))
			{
				edges.push(new DelaunayEdge(triangle.v0, triangle.v1));
				edges.push(new DelaunayEdge(triangle.v1, triangle.v2));
				edges.push(new DelaunayEdge(triangle.v2, triangle.v0));
				delete triangles[i];
			}
		}
		edges = this.uniqueEdges(edges);

		// Create new triangles from the unique edges and new vertex
		for(i in edges )
		{
			var edge = edges[i];

			triangles.push(new DelaunayTriangle(edge.v0, edge.v1, vertex));
		}
	},

	// Internal: remove duplicate edges from an array
	uniqueEdges: function(edges)
	{
		// TODO: This is O(n^2), make it O(n) with a hash or some such
		var uniqueEdges = [];
		for(var i in edges)
		{
			var edge1 = edges[i];
			var unique = true;

			for(var j in edges)
			{
				if(i != j)
				{
					var edge2 = edges[j];

					if((edge1.v0 == edge2.v0 && edge1.v1 == edge2.v1 ) || (edge1.v0 == edge2.v1 && edge1.v1 == edge2.v0 ))
					{
						unique = false;
						break;
					}
				}
			}

			if(unique)
			{
				uniqueEdges.push(edge1);
			}
		}

		return uniqueEdges;
	}
};
