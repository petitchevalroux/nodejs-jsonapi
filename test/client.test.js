"use strict";

var assert = require("assert");
var sinon = require("sinon");
var path = require("path");

describe("models/client", function() {
    var Client = require(path.join(__dirname, "..", "src", "models", "client"));

    describe("setEndPoint", function() {
        it("set client endpoint to the client endpoint", function() {
            var client = new Client();
            client.setEndPoint("http://localhost:8080", function(err) {
                assert.equal(err, null);
                assert.equal("http://localhost:8080", client.endPoint);
            });
        });
    });
    describe("getEndPoint", function() {
        it("get an empty client endpoint return an error", function() {
            var client = new Client();
            client.getEndPoint(function(err, endPoint) {
                assert.equal(null, endPoint);
                assert.ok(err instanceof Error, "err is not an Error instance");
            });
        });
        it("return client endpoint", function() {
            var client = new Client();
            client.endPoint = "http://localhost:8081";
            client.getEndPoint(function(err, endPoint) {
                assert.equal(err, null);
                assert.equal(endPoint, "http://localhost:8081");
            });
        });
    });

    describe("getResource", function() {
        it("return a resource", function(done) {
            var client = new Client();
            var expectedArticle = {
                "id": "1",
                "title": "sample title"
            };
            var stubRestClientGet = sinon.stub(client.restClient, "get", function(url, callback) {
                assert.equal(url, "http://192.168.99.100:8080/articles/1");
                callback(expectedArticle, {
                    "statusCode": 200
                });
                return {
                    "on": function() {}
                };
            });
            client.setEndPoint("http://192.168.99.100:8080", function() {
                client.getResource("/articles/1", function(err, article) {
                    assert.equal(err, null);
                    assert.equal(article, expectedArticle);
                    done();
                });
            });
            stubRestClientGet.restore();
        });
    });


    describe("getResources", function() {
        it("return resources", function(done) {
            var client = new Client();
            var expectedArticles = [{
                "id": "1",
                "title": "sample title"
            }];
            var stubRestClientGet = sinon.stub(client.restClient, "get", function(url, callback) {
                assert.equal(url, "http://192.168.99.100:8080/articles");
                callback(expectedArticles, {
                    "statusCode": 200
                });
                return {
                    "on": function() {}
                };
            });

            client.setEndPoint("http://192.168.99.100:8080", function() {
                client.getResources("/articles", function(err, articles) {
                    assert.equal(err, null);
                    assert.equal(articles, expectedArticles);
                    done();
                });
            });
            stubRestClientGet.restore();
        });
    });

    describe("getResources with filters", function() {

        it("return resources", function(done) {
            var client = new Client();
            var expectedArticles = [{
                "id": "1",
                "title": "sample title"
            }];
            var stubRestClientGet = sinon.stub(client.restClient, "get", function(url, callback) {
                assert.equal(url, "http://192.168.99.100:8080/articles?filters%5Btitle%5D=sample%20title");
                callback(expectedArticles, {
                    "statusCode": 200
                });
                return {
                    "on": function() {}
                };
            });

            client.setEndPoint("http://192.168.99.100:8080", function() {
                client.getResources("/articles", {
                    "filters": {
                        "title": "sample title"
                    }
                }, function(err, articles) {
                    assert.equal(err, null);
                    assert.equal(articles, expectedArticles);
                    done();
                });
            });
            stubRestClientGet.restore();
        });
    });

    describe("createResource", function() {
        it("return resource", function(done) {
            var client = new Client();
            var expectedUser = {
                "name": "John Doe"
            };
            var stubRestClientPost = sinon.stub(client.restClient, "post", function(url, args, callback) {
                assert.equal(url, "http://192.168.99.100:8080/users");
                callback(expectedUser, {
                    "statusCode": 201
                });
                return {
                    "on": function() {}
                };
            });
            client.setEndPoint("http://192.168.99.100:8080", function() {
                client.createResource("/users", {
                    "name": "John Doe"
                }, function(err, user) {
                    assert.equal(err, null);
                    assert.equal(user, expectedUser);
                    done();
                });
            });
            stubRestClientPost.restore();
        });
    });

    describe("updateResource", function() {
        it("return updated resource", function(done) {
            var client = new Client();
            var expectedUser = {
                "name": "John Foo"
            };
            var stubRestClientPut = sinon.stub(client.restClient, "put", function(url, args, callback) {
                assert.equal(url, "http://192.168.99.100:8080/users/1");
                callback(expectedUser, {
                    "statusCode": 200
                });
                return {
                    "on": function() {}
                };
            });
            client.setEndPoint("http://192.168.99.100:8080", function() {
                client.updateResource("/users/1", {
                    "name": "John Foo"
                }, function(err, user) {
                    assert.equal(err, null);
                    assert.equal(user, expectedUser);
                    done();
                });
            });
            stubRestClientPut.restore();
        });
    });

    describe("deleteResource", function() {
        it("deleting resource return true", function(done) {
            var client = new Client();
            var stubRestClientDelete = sinon.stub(client.restClient, "delete", function(url, callback) {
                assert.equal(url, "http://192.168.99.100:8080/users/90");
                callback(true, {
                    statusCode: 204
                });
                return {
                    "on": function() {}
                };
            });
            client.setEndPoint("http://192.168.99.100:8080", function() {
                client.deleteResource("/users/90", function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result, true);
                    done();
                });
            });
            stubRestClientDelete.restore();
        });
    });

    describe("walkResources", function() {
        it("walk through resources", function(done) {
            var client = new Client();
            var stubClientGetResources = sinon.stub(
                client,
                "getResources",
                function(uri, params, callback) {
                    var metas;
                    if (uri === "/articles") {
                        metas = {
                            "links": {
                                "next": "/articles?limit=1&offset=2"
                            }
                        };
                    }
                    callback(null, ["resource 1", "resource 2"], metas);
                });
            client.setEndPoint("http://192.168.99.100:8080", function() {
                client.walkResources("/articles", {
                    "limit": 1
                }, function(resource) {
                    assert(resource === "resource 1" || resource === "resource 2");
                }, function(err, succeed) {
                    assert.equal(err, null);
                    assert(succeed);
                    done();
                });
            });
            stubClientGetResources.restore();
        });
    });

});
