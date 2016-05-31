'use strict'

const AMQP = require('amqplib');
const EventEmitter = require('events');
const Consumer = require('./consumer.js');
const Producer = require('./producer.js');

class Connection extends EventEmitter {

	constructor(host, options) {
		super();
		if (!host) throw new Error('Lapin: Host is not defined');
		this.host = host;
		this.maxRetries = options && options.maxRetries || 5;
		this.retryDelay = options && options.retryDelay || 5000;
		this.connect(this.maxRetries);
	}

	connect(retries) {
		this.connectTry()
			.then(con => {
				this.connection = con;
				this.emit('ready');
			})
			.catch(err => setTimeout(() => {
				if (retries <= 0) {
					this.emit('error', new Error(`Couldn't connect to AMQP on host ${this.host}: ${err}`));
				} else {
					this.connect(retries - 1);
				}
			}, this.retryDelay));
	}

	connectTry() {
		return new Promise((resolve, reject) => {
			AMQP.connect(`amqp://${this.host}`)
				.then(resolve)
				.catch(reject);
		});
	}

	createConsumer(queue) {
		return new Promise((resolve, reject) => {
			this.connection.createChannel()
				.then(ch => {
					ch.assertQueue(queue, {durable: true});	
					resolve(new Consumer(ch, queue));
				})
				.catch(reject);
		});		
	}

	createProducer(queue) {
		return new Promise((resolve, reject) => {
			this.connection.createChannel()
				.then(ch => {
					ch.assertQueue(queue, {durable: true});	
					resolve(new Producer(ch, queue));
				})
				.catch(reject);
		});
	}
}

module.exports = Connection;
