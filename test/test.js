'use strict'
const lapin = require('../lib');
const assert = require('chai').assert;
const expect = require('chai').expect;

const HOST = process.env.AMQP_HOST;
const QUEUE = 'mocha_test';

describe('Connection', function() {
	let conn = new lapin.Connection(HOST);

	it('should be instanciable', function() {
		expect(conn).to.be.an.instanceOf(lapin.Connection);
	});

	it('should have attributes', function() {
		assert.equal(conn.host, HOST);
	});

	it('should connect', function(done) {
		this.timeout(40000);
		conn.on('ready', done);
		conn.on('error', done);
	});

	describe('Producer', function() {

		it('should create a producer', function() {
			return conn.createProducer(QUEUE);
		});

		it('should publish a message', function() {
			conn.createProducer(QUEUE)
				.then(prod => {
					prod.publish('hello world');
				});
		});
	});

	describe('Consumer', function() {

		it ('should get a message', function(done) {
			this.timeout(20000);
			conn.createConsumer(QUEUE)
				.then(cons => {
					cons.on('message', (msg, content) => {
						assert.equal(content, 'hello world');
						cons.ack(msg);
						done();
					});
				});
		});

	});
});
